// ##deployed index: 10
// ##deployed at: 2023/08/11 19:24:13
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./dependencies/Initializable.sol";
import "./dependencies/OwnableUpgradeable.sol";
import "./dependencies/PausableUpgradeable.sol";
import "./dependencies/ReentrancyGuardUpgradeable.sol";
import "./dependencies/ECDSA.sol";

import "./interfaces/IAggressiveBidDistribution.sol";
import "./libraries/DateTime.sol";
import "./libraries/AggressiveBidDistributionStructs.sol";

contract AggressiveBidDistribution is IAggressiveBidDistribution, Initializable, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable {

    using ECDSA for bytes32;

    mapping(uint256 => uint256) private reward_amount_daily; // 每日收益总量
    mapping(address => AggressiveBidDistributionStructs.RewardData) private user_rewards; // 用户收益数据

    address[] private reward_users; // 领取收益的用户

    uint96 public constant override denominator = 10000;

    uint96 public override bid_royalty_rate;

    address public override verifier_address;

    /// @notice This method is called by the proxy contract to initialize the contract.
    function initialize(uint96 _bid_royalty_rate) public initializer {
        __Ownable_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        require(_bid_royalty_rate < denominator, "AggressiveBidDistribution: invalid royalty rate");
        bid_royalty_rate = _bid_royalty_rate;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function setVerifierAddress(address _verifier_address) external override onlyOwner {
        require(_verifier_address != address(0), "AggressiveBidDistribution: invalid verifier address");
        verifier_address = _verifier_address;
        emit SetVerifierAddress(_verifier_address);
    }

    function setBidRoyaltyRate(uint96 _bid_royalty_rate) external override onlyOwner {
        require(_bid_royalty_rate < denominator, "AggressiveBidDistribution: invalid royalty rate");

        bid_royalty_rate = _bid_royalty_rate;

        emit SetBidRoyaltyRate(_bid_royalty_rate);
    }

    function addToDailyReward(uint256 _timestamp) public payable override nonReentrant whenNotPaused {
        uint256 _date = DateTime.getDate(_timestamp);
        reward_amount_daily[_date] += msg.value;

        // 未分配的都暂时记录在这里
        user_rewards[address(0)].claimable_amount += msg.value;

        _integrity();

        emit AddedToDailyReward(msg.sender, _date, msg.value);
    }

    function distributeDaily(AggressiveBidDistributionStructs.ClaimRewardParams calldata _claim_reward_params) external nonReentrant whenNotPaused {
        uint256 _date = _claim_reward_params.date;
        require(_date <= DateTime.getDate(block.timestamp), "AggressiveBidDistribution: invalid date");
        require(reward_amount_daily[_date] > 0, "AggressiveBidDistribution: no reward");
        require(_claim_reward_params.reward_users.length == _claim_reward_params.reward_amounts.length,
            "AggressiveBidDistribution: invalid reward amount");

        require(_checkExtraSignature(_claim_reward_params.merkle_root, _claim_reward_params.extra_signature),
            "AggressiveBidDistribution: invalid extra signature");

        uint256 _claimed_total_amount = 0;
        for (uint256 i=0;i<_claim_reward_params.reward_users.length;i++) {
            address _to = _claim_reward_params.reward_users[i];
            uint256 _amount = _claim_reward_params.reward_amounts[i];

            if (user_rewards[_to].user_address == address(0)) {
                user_rewards[_to].user_address = _to;
                _addUserIfNotExist(_to);
            }
            user_rewards[_to].claimable_amount += _amount;

            _claimed_total_amount += _amount;
        }

        require(_claimed_total_amount == reward_amount_daily[_date], "AggressiveBidDistribution: invalid claimed amount");

        reward_amount_daily[_date] = 0;
        require(user_rewards[address(0)].claimable_amount > _claimed_total_amount, "AggressiveBidDistribution: invalid unclaimed amount");
        user_rewards[address(0)].claimable_amount -= _claimed_total_amount;

        _integrity();

        emit DistributedDaily(msg.sender, _date, _claimed_total_amount, _claim_reward_params.reward_users, _claim_reward_params.reward_amounts, _claim_reward_params.merkle_root, _claim_reward_params.extra_signature, _claim_reward_params.merkle_ipfs_uri);
    }

    function claim() external nonReentrant whenNotPaused {
        require(user_rewards[msg.sender].claimable_amount > 0, "AggressiveBidDistribution: no reward");

        uint256 _claimable_amount = user_rewards[msg.sender].claimable_amount;
        require(msg.sender == user_rewards[msg.sender].user_address, "AggressiveBidDistribution: invalid user address");

        user_rewards[msg.sender].claimable_amount = 0;
        user_rewards[msg.sender].claimed_amount += _claimable_amount;
        user_rewards[msg.sender].claimed_at = block.timestamp;

        (bool success,) = payable(msg.sender).call{value: _claimable_amount}("");
        require(success, "AggressiveBidDistribution: Transfer failed");

        _removeUserIfClaimed(msg.sender);

        _integrity();

        emit Claimed(msg.sender, _claimable_amount);
    }

    function getUserClaimableAmount(address _user_address) external view override returns (uint256) {
        return user_rewards[_user_address].claimable_amount;
    }

    function getRewardAmountDaily(uint256 _date) external view override returns (uint256) {
        return reward_amount_daily[_date];
    }

    function _addUserIfNotExist(address _user_address) private {
        bool is_exist = false;
        for (uint256 i = 0; i < reward_users.length; i++) {
            if (reward_users[i] == _user_address) {
                is_exist = true;
                break;
            }
        }
        if (!is_exist) {
            reward_users.push(_user_address);
        }
    }

    function _removeUserIfClaimed(address _user_address) private {
        if (user_rewards[_user_address].claimable_amount == 0) {
            for (uint256 i = 0; i < reward_users.length; i++) {
                if (reward_users[i] == _user_address) {
                    reward_users[i] = reward_users[reward_users.length - 1];
                    reward_users.pop();
                    break;
                }
            }
        }
    }

    function _integrity() private view returns (bool){
        uint256 _total_balance = 0;
        _total_balance += user_rewards[address(0)].claimable_amount;
        for (uint256 i = 0; i < reward_users.length; i++) {
            _total_balance += user_rewards[reward_users[i]].claimable_amount;
        }

        if (_total_balance != address(this).balance) {
            revert("AggressiveBidDistribution: ETH balance is not equal to the sum of reward user balances");
        }

        return true;
    }

    function _checkExtraSignature(bytes32 _merkle_root, bytes memory _signature) private view returns (bool) {
        return ECDSA.recover(_merkle_root, _signature) == verifier_address;
    }

    receive() external payable {
        addToDailyReward(block.timestamp);
    }
}
