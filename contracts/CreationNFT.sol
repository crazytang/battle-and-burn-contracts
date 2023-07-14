// ##deployed index: 27
// ##deployed at: 2023/07/14 19:05:42
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./dependencies/ERC721Enumerable.sol";
import "./dependencies/Ownable.sol";
import "./dependencies/ERC2981.sol";
import "./dependencies/ReentrancyGuard.sol";
import "./interfaces/ICreationNFT.sol";
import "./interfaces/IDistributionPolicyV1.sol";
import "./libraries/DistributionStructs.sol";

contract CreationNFT is ICreationNFT, ERC721Enumerable, ERC2981, Ownable, ReentrancyGuard {

    /// @notice Track the max supply.
    uint256 constant max_supply = 10000;

    /// @notice Track the base URI for token metadata.
    string token_base_URI;

    /// @notice version
    uint8 constant public version = 0x1;

    /// @notice Distribution Role
    DistributionStructs.DistributionRole distribution_role;

    IDistributionPolicyV1 public override distribution_policy;

    mapping(address => DistributionStructs.UserRewardData) users_reward_data;

    address[] reward_users;

    /// @notice 构造函数
    /// @param _name NFT名称
    /// @param _symbol NFT符号
    /// @param __baseURI baseURI
    constructor(string memory _name, string memory _symbol, string memory __baseURI, DistributionStructs.DistributionRoleParams memory _distribution_role_params, address _distribution_policy_address) ERC721(_name, _symbol){
        token_base_URI = __baseURI;
        _mint(msg.sender, 0);

        // 使用本地接收版税，然后再分配
//        _setDefaultRoyalty(address(this), royaltyFee);

        // 设置分配策略
        distribution_policy = IDistributionPolicyV1(_distribution_policy_address);

        uint256 _count = _distribution_role_params.element_quote_element_creators.length;
        // 设置分配角色
        require(_distribution_role_params.element_creators.length == _count,"CreationNFT: element_creators length must be greater and equal to element_quote_element_creator length");

        distribution_role.creator = msg.sender;
        distribution_role.original_element_creator = _distribution_role_params.original_element_creator;
        distribution_role.element_creators = _distribution_role_params.element_creators;
        distribution_role.element_quote_element_creators = new address[](_count);
        for (uint256 i = 0; i < _count; i++) {
            distribution_role.element_quote_element_creators[i] = _distribution_role_params.element_quote_element_creators[i];
        }
    }

    /// @notice 设定分配策略合约地址
    /// @param _distribution_policy_address 分配策略合约地址
    function setDistributionPolicy(address _distribution_policy_address) external override onlyOwner {
        require(Address.isContract(_distribution_policy_address), "CreationNFT: _distribution_policy_address is not contract");
        distribution_policy = IDistributionPolicyV1(_distribution_policy_address);
        emit SetDistributionPolicy(_distribution_policy_address);
    }

    /// @notice 转移NFT的所有权，代为生成NFT合约的时候需要调用该方法
    /// @param _newOwner 新的所有者地址
    function transferOwnership(address _newOwner) public override onlyOwner {
        require(_newOwner != address(0), "CreationNFT: new owner is the zero address");
        super.transferOwnership(_newOwner);
        distribution_role.creator = _newOwner;
    }

    /// @notice 铸造
    /// @param _to 接收用户地址
    /// @param _tokenId tokenId
    function mint(address _to, uint256 _tokenId) external override onlyOwner {
        require(_tokenId < maxSupply(), "CreationNFT: tokenId must be less than max supply");
        require(_tokenId == totalSupply(), 'CreationNFT: tokenId is need to equal totalSupply()');

        _mint(_to, _tokenId);
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

    /// @notice 分配奖励
    /// @param _profit 收益
    function distribute(uint256 _profit) private {
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
            emit RemainingRewardToTreasury(address(distribution_policy.treasury()), _treasury_amount);
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
    function getClaimableRewardAmount(address _user) external view override returns (uint256) {
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
        distribute(msg.value);
    }

    /// @notice 改由分配策略合约来分配
    /// @param _tokenId tokenId
    /// @param _salePrice 销售价格
    /// @return 收款地址，收款金额
    function royaltyInfo(uint256 _tokenId, uint256 _salePrice) public view override returns (address, uint256) {
        uint96 royalty_fee = distribution_policy.royalty_fee();
        uint256 royaltyAmount = (_salePrice * royalty_fee) / _feeDenominator();

        _tokenId = 0;
        return (address(this), royaltyAmount);
    }

    /**
     * @notice 返回baseURI
     */
    function baseURI() external view override returns (string memory) {
        return _baseURI();
    }

    /**
     * @notice 返回baseURI
     * @return string baseURI
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return token_base_URI;
    }

    /**
     * @notice 返回最大的供应量
     * @return uint256 max_supply 最大的供应量
     */
    function maxSupply() public pure returns (uint256) {
        return max_supply;
    }

    /**
     * @notice 获取分配角色
     * @return DistributionStructs.DistributionRole 分配角色
     */
    function getDistributionRole() external view override returns (DistributionStructs.DistributionRole memory) {
        return distribution_role;
    }

    /**
     * @notice 获取用户奖励数据
     * @param _user_address 用户地址
     * @return DistributionStructs.UserRewardData 用户奖励数据
     */
    function getUserRewardData(address _user_address) external view override returns (DistributionStructs.UserRewardData memory) {
        return users_reward_data[_user_address];
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Enumerable, ERC2981) returns (bool) {
        return interfaceId == type(IERC2981).interfaceId || interfaceId == type(ERC721Enumerable).interfaceId || super.supportsInterface(interfaceId);
    }
}
