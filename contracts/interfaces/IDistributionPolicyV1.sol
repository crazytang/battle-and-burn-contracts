// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../libraries/DistributionStructs.sol";
import "./ITreasury.sol";

interface IDistributionPolicyV1 {
    event SetRoyaltyFee(uint96 royalty_fee);
    event SetOriginalCreatorAndElementsRate(uint96 original_creator_rate, uint96 element_creators_rate);
    event SetElementCreatersRate(uint96 direct_element_rate, uint96 superior_element_rate, uint96 original_element_rate);
    function royalty_fee() external view returns (uint96);
    function treasury() external view returns (ITreasury);
    function version() external view returns (uint8);
    function DENOMINATOR() external view returns (uint96);

    function setRoyaltyFee(uint96 _royalty_fee) external;
    function setOriginalCreatorAndElementsRate(uint96 _original_creator_rate, uint96 _element_creators_rate) external;
    function setElementCreatersRate(uint96 _direct_element_rate, uint96 _superior_element_rate, uint96 _original_element_rate) external;

    function getDistributedResult(DistributionStructs.DistributionRole calldata _distribution_role, uint256 _amount) external view returns (address[] memory, uint256[] memory);
}
