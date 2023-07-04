// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./dependencies/Initializable.sol";
import "./dependencies/OwnableUpgradeable.sol";
import "./interfaces/IDistributionPolicyV1.sol";
import "./libraries/DistributionStructs.sol";

contract DistributionPolicyV1 is IDistributionPolicyV1, Initializable, OwnableUpgradeable {

    uint8 public override  version = 0x1;

    uint256 public constant DOMINATOR = 10000;

    // 版税比例
    uint96 public override royalty_fee;

    // 二创创作者分成比例
    uint96 public original_creator_rate;
    // 二创的引用元素的创作者分成比例
    uint96 public element_creators_rate;

    // 二创引用最直接的元素的创作者分成比例
    uint96 public element_quote_first_element_creator_rate;
    // 二创引用第二直接的元素的创作者分成比例
    uint96 public element_quote_second_element_creator_rate;
    // 二创引用最原始的元素的创作者分成比例
    uint96 public element_quote_original_element_creator_rate;

    address public constant override TREASURY_ADDRESS = 0x9B4a032D8c2f2b44b9172bda4747B4dDfA5D0DE3;

    /// @notice This method is called by the proxy contract to initialize the contract.
    function initialize() public initializer {
        __Ownable_init();

        version = 0x1;
        royalty_fee = 500; // 5%

        original_creator_rate = 5000; // 50%
        element_creators_rate = 5000; // 50%

        element_quote_first_element_creator_rate = 5000; // 50%
        element_quote_second_element_creator_rate = 2500; // 25%
        element_quote_original_element_creator_rate = 2500; // 25%
    }

    function setRoyaltyFee(uint96 _royalty_fee) external onlyOwner {
        royalty_fee = _royalty_fee;
    }

    function setOriginalCreatorAndElementsRate(uint96 _original_creator_rate, uint96 _element_creators_rate) external onlyOwner {
        require(_original_creator_rate + _element_creators_rate == DOMINATOR,
            "DistributionPolicyV1: _original_creator_rate + _element_creators_rate must be equal to 10000");
        original_creator_rate = _original_creator_rate;
        element_creators_rate = _element_creators_rate;
    }

    function setElementCreatersRate(uint96 _first_element_rate, uint96 _second_element_rate, uint96 _original_element_rate) external onlyOwner {
        require(_first_element_rate + _second_element_rate + _original_element_rate == DOMINATOR,
            "DistributionPolicyV1: _first_element_rate + _second_element_rate + _original_element_rate must be equal to 10000");

        element_quote_first_element_creator_rate = _first_element_rate;
        element_quote_second_element_creator_rate = _second_element_rate;
        element_quote_original_element_creator_rate = _original_element_rate;
    }

    function getDistributedResult(DistributionStructs.DistributionRole calldata _distribution_role, uint256 _amount) external view override returns (address[] memory, uint256[] memory) {
        require(_amount > 0, "DistributionPolicyV1: amount must be greater than 0");

        uint256 _count = 2 + _distribution_role.element_creators.length;

        for (uint256 i=0;i<_distribution_role.element_quote_element_creators.length;i++) {
            if (_distribution_role.element_quote_element_creators[i] != address(0)) {
                _count ++;
            }
        }

        address[] memory _reward_addresses = new address[](_count);
        uint256[] memory _reward_addresses_amount = new uint256[](_count);

        // 二创创作者分成
        uint256 _creator_amount = _amount * original_creator_rate / DOMINATOR;
        _reward_addresses[0] = _distribution_role.creator;
        _reward_addresses_amount[0] = _creator_amount;
        _count = 1;

        uint256 _element_quote_first_elements_count = _distribution_role.element_quote_element_creators.length;

        // 如果引用多个元素，需要平均分配
        uint256 _element_creators_amount = (_amount * element_creators_rate / DOMINATOR) / _element_quote_first_elements_count;
//        uint256 _cummulated_amount = 0;

        for (uint256 i=0;i<_element_quote_first_elements_count;i++) {
            // 二创直接引用的元素的创作者分成
            uint256 _element_quote_first_element_creator_amount = _element_creators_amount * element_quote_first_element_creator_rate / DOMINATOR;
            _reward_addresses[_count] = _distribution_role.element_creators[i];
            _reward_addresses_amount[_count] = _element_quote_first_element_creator_amount;
            _count ++;
            if (_distribution_role.element_quote_element_creators[i] != address(0)) {
                // 二创间接引用的元素的创作者分成
                uint256 _element_quote_second_element_creator_amount = _element_creators_amount * element_quote_second_element_creator_rate / DOMINATOR;
                _reward_addresses[_count] = _distribution_role.element_quote_element_creators[i];
                _reward_addresses_amount[_count] = _element_quote_second_element_creator_amount;
                _count ++;
            }
        }

        return (_reward_addresses, _reward_addresses_amount);
    }

}
