// ##deployed index: 2
// ##deployed at: 2023/08/22 09:48:46
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./dependencies/Initializable.sol";
import "./dependencies/OwnableUpgradeable.sol";
import "./dependencies/PausableUpgradeable.sol";
import "./dependencies/ReentrancyGuardUpgradeable.sol";
import "./libraries/DistributionStructs.sol";
import "./interfaces/IDistributionPolicyV1.sol";
import "./interfaces/ICreationRewardPool.sol";

contract CreationRewardPool is ICreationRewardPool, Initializable, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable {

    /// @notice Distribution Role
    DistributionStructs.DistributionRole distribution_role;

    IDistributionPolicyV1 public override distribution_policy;

    // NFT address => Distribution Role
    mapping(address => DistributionStructs.DistributionRole) distribution_roles;

    // User address => User Reward Data
    mapping(address => DistributionStructs.UserRewardData) users_reward_data;

    address[] reward_users;

    constructor(){

    }

    /// @notice This method is called by the proxy contract to initialize the contract.
    function initialize() public initializer {
        __Ownable_init();
        __Pausable_init();
        __ReentrancyGuard_init();
    }

    /// @notice 暂停合约
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice 恢复合约
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice 添加奖励用户
    /// @param _user 奖励用户地址
    function addRewardUser(address _user) private {
        require(_user != address(0), "CreationNFT: _user is the zero address");

        for (uint256 i=0;i<reward_users.length;i++) {
            if (reward_users[i] == _user) {
                return;
            }
        }

        reward_users.push(_user);

//        emit AddedRewardUser(_user);
    }

    function setDistributionRoles(DistributionStructs.DistributionRoleParams memory _distribution_role_params, address _distribution_policy) external onlyOwner {
        require(AddressUpgradeable.isContract(_distribution_policy), "CreationNFT: _distribution_policy must be a contract");
        distribution_policy = IDistributionPolicyV1(_distribution_policy);

    }

    /// @notice 分配奖励
    function distribute() private {
        uint256 _profit = msg.value;
        require(_profit > 0, "CreationNFT: _profit must be greater than 0");

        address[] memory _reward_addresses;
        uint256[] memory _reward_addresses_amount;
        // 分配
        (_reward_addresses, _reward_addresses_amount) = distribution_policy.getDistributedResult(distribution_role, _profit);
        uint256 _cummulated_amount = 0;
        for (uint256 i=0;i<_reward_addresses_amount.length;i++) {
            if (_reward_addresses[i] == address(0)) {
                continue;
            }

            users_reward_data[_reward_addresses[i]].claimable_amount += _reward_addresses_amount[i];
            _cummulated_amount += _reward_addresses_amount[i];

            addRewardUser(_reward_addresses[i]);
        }

        require(_cummulated_amount <= _profit, "CreationNFT: _cummulated_amount must be less than or equal to _amount");

        // 剩下的余数给国库
        uint256 _treasury_amount = _profit - _cummulated_amount;
        if (_treasury_amount > 0) {
            (bool success, ) = address(distribution_policy.treasury()).call{value: _treasury_amount}("");
            require(success, "CreationNFT: unable to send value, recipient may have reverted");
//            emit RemainingRewardToTreasury(address(distribution_policy.treasury()), _treasury_amount);
        }

        integrityCheck();
    }

    /// @notice 领取奖励
    function claimReward() external nonReentrant {
        uint256 _claimable_amount = users_reward_data[msg.sender].claimable_amount;
        require(_claimable_amount > 0, "CreationNFT: _claimable_amount must be greater than 0");

        users_reward_data[msg.sender].claimable_amount = 0;

        (bool success, ) = msg.sender.call{value: _claimable_amount}("");
        require(success, "CreationNFT: unable to send value, recipient may have reverted");

        integrityCheck();
    }


    /// @notice 获取用户可领取奖励数量
    function getClaimableRewardAmount(address _user) external view  returns (uint256) {
        return users_reward_data[_user].claimable_amount;
    }

    /// @notice 完整性检查
    function integrityCheck() private view {
        uint256 _balance_in_contract = address(this).balance;
        uint256 _balance_in_users = 0;

        for (uint256 i=0;i<reward_users.length;i++) {
            _balance_in_users += users_reward_data[reward_users[i]].claimable_amount;
        }

        if (_balance_in_contract != _balance_in_users) {
            revert("CreationNFT: _balance_in_contract must be equal to _balance_in_users");
        }
    }

    receive() external payable {
        distribute();
    }

    /**
     * @notice 获取分配角色
     * @return DistributionStructs.DistributionRole 分配角色
     */
    function getDistributionRole() external view  returns (DistributionStructs.DistributionRole memory) {
        return distribution_role;
    }

    /**
     * @notice 获取用户奖励数据
     * @param _user_address 用户地址
     * @return DistributionStructs.UserRewardData 用户奖励数据
     */
    function getUserRewardData(address _user_address) external view  returns (DistributionStructs.UserRewardData memory) {
        return users_reward_data[_user_address];
    }

    function royalty_fee() external view returns (uint96) {
        return distribution_policy.royalty_fee();
    }
}
