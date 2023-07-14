// ##deployed index: 13
// ##deployed at: 2023/07/14 18:02:32
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./dependencies/Initializable.sol";
import "./dependencies/OwnableUpgradeable.sol";
//import "./dependencies/AddressUpgradeable.sol";
import "./interfaces/IDistributionPolicyV1.sol";
import "./libraries/DistributionStructs.sol";
import "./interfaces/ITreasury.sol";

contract DistributionPolicyV1 is IDistributionPolicyV1, Initializable, OwnableUpgradeable {

    uint8 public override  version;

    uint96 public constant override DENOMINATOR = 10000;

    // 版税比例
    uint96 public override royalty_fee;

    // 二创创作者分成比例
    uint96 public original_creator_rate;
    // 二创的引用元素的创作者分成比例
    uint96 public element_creators_rate;

    // 二创引用最直接的元素的创作者分成比例
    uint96 public element_direct_quote_element_creator_rate;
    // 二创引用第二直接的元素的创作者分成比例
    uint96 public element_superior_quote_element_creator_rate;
    // 二创引用最原始的元素的创作者分成比例
    uint96 public element_original_quote_element_creator_rate;

    ITreasury public treasury;

    /// @notice This method is called by the proxy contract to initialize the contract.
    function initialize(address _treasury_address) public initializer {
        __Ownable_init();
        version = 0x1;
        royalty_fee = 500; // 5%

        original_creator_rate = 5000; // 50%
        element_creators_rate = 5000; // 50%

        element_direct_quote_element_creator_rate = 5000; // 50%
        element_superior_quote_element_creator_rate = 2500; // 25%
        element_original_quote_element_creator_rate = 2500; // 25%

        require(_treasury_address != address(0), "DistributionPolicyV1: _treasury_address is the zero address");
        require(AddressUpgradeable.isContract(_treasury_address), "DistributionPolicyV1: _treasury_address is not a contract address");
//
        treasury = ITreasury(_treasury_address);
    }

    /// @notice 设置版税比例
    /// @param _royalty_fee 版税比例，分母为10000
    function setRoyaltyFee(uint96 _royalty_fee) external onlyOwner {
        royalty_fee = _royalty_fee;

        emit SetRoyaltyFee(_royalty_fee);
    }

    /// @notice 设置二创创作者与所有引用的元素的分成比例
    /// @dev 两个参数相加必须等于10000
    /// @param _original_creator_rate 二创创作者分成比例
    /// @param _element_creators_rate 所有引用的元素的创作者分成比例
    function setOriginalCreatorAndElementsRate(uint96 _original_creator_rate, uint96 _element_creators_rate) external onlyOwner {
        require(_original_creator_rate + _element_creators_rate == DENOMINATOR,
            "DistributionPolicyV1: _original_creator_rate + _element_creators_rate must be equal to 10000");
        original_creator_rate = _original_creator_rate;
        element_creators_rate = _element_creators_rate;

        emit SetOriginalCreatorAndElementsRate(_original_creator_rate, _element_creators_rate);
    }

    /// @notice 设置元素的各个创作者分成比例
    /// @dev 三个参数相加必须等于10000
    /// @param _direct_element_rate 二创引用直接的元素的创作者分成比例
    /// @param _superior_element_rate 二创引用间接接的元素的创作者分成比例
    /// @param _original_element_rate 二创引用最原始的元素的创作者分成比例
    function setElementCreatersRate(uint96 _direct_element_rate, uint96 _superior_element_rate, uint96 _original_element_rate) external onlyOwner {
        require(_direct_element_rate + _superior_element_rate + _original_element_rate == DENOMINATOR,
            "DistributionPolicyV1: _direct_element_rate + _superior_element_rate + _original_element_rate must be equal to 10000");

        element_direct_quote_element_creator_rate = _direct_element_rate;
        element_superior_quote_element_creator_rate = _superior_element_rate;
        element_original_quote_element_creator_rate = _original_element_rate;

        emit SetElementCreatersRate(_direct_element_rate, _superior_element_rate, _original_element_rate);
    }

    /// @notice 获取各个角色的分成结果
    /// @param _distribution_role 分成角色
    /// @param _amount 分成金额
    /// @return _reward_addresses 分成地址, _reward_addresses_amount 分成金额，一对一关系
    function getDistributedResult(DistributionStructs.DistributionRole calldata _distribution_role, uint256 _amount) external view override returns (address[] memory, uint256[] memory) {
        require(_amount > 0, "DistributionPolicyV1: amount must be greater than 0");

        uint256 _count = 2 + _distribution_role.element_creators.length + _distribution_role.element_quote_element_creators.length;

        address[] memory _reward_addresses = new address[](_count);
        uint256[] memory _reward_addresses_amount = new uint256[](_count);

        // 二创创作者分成
        uint256 _creator_amount = _amount * original_creator_rate / DENOMINATOR;
        _reward_addresses[0] = _distribution_role.creator;
        _reward_addresses_amount[0] = _distribution_role.creator != address(0) ? _creator_amount : 0;

        // 最开始的元素创作者分成
        uint256 original_element_creator_amount = (_amount - _creator_amount) * element_original_quote_element_creator_rate / DENOMINATOR;
        _reward_addresses[1] = _distribution_role.original_element_creator;
        _reward_addresses_amount[1] = _distribution_role.original_element_creator != address(0) ? original_element_creator_amount : 0;
        _count = 2;

        uint256 _element_direct_quote_elements_count = _distribution_role.element_quote_element_creators.length;
        // 二创直接引用的所有分成数量
        uint256 _per_element_direct_quote_amount = (_amount - _creator_amount) * element_direct_quote_element_creator_rate / DENOMINATOR / _element_direct_quote_elements_count;
        // 二创间接引用的所有分成数量
        uint256 _per_element_superior_quote_amount = (_amount - _creator_amount) * element_superior_quote_element_creator_rate/ DENOMINATOR / _element_direct_quote_elements_count;

        // 如果引用多个元素，需要平均分配
        for (uint256 i=0;i<_element_direct_quote_elements_count;i++) {
            // 二创直接引用的元素的创作者分成
            _reward_addresses[_count] = _distribution_role.element_creators[i];
            _reward_addresses_amount[_count] = _distribution_role.element_creators[i] != address(0) ? _per_element_direct_quote_amount : 0;
            _count ++;

            // 二创间接引用的元素的创作者分成
            _reward_addresses[_count] = _distribution_role.element_quote_element_creators[i];
            _reward_addresses_amount[_count] = _distribution_role.element_quote_element_creators[i] != address(0) ? _per_element_superior_quote_amount : 0;
            _count ++;
        }

        uint256 _total = 0;
        for (uint256 i=0;i<_reward_addresses_amount.length;i++) {
            _total += _reward_addresses_amount[i];
        }
        require(_total <= _amount, "DistributionPolicyV1: _total must be less than or equal to _amount");

        return (_reward_addresses, _reward_addresses_amount);
    }

}
