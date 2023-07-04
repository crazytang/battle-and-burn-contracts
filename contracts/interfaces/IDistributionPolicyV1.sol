// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../libraries/DistributionStructs.sol";

interface IDistributionPolicyV1 {
    function royalty_fee() external view returns (uint96);
    function TREASURY_ADDRESS() external view returns (address);
    function version() external view returns (uint8);

    function setRoyaltyFee(uint96 _royalty_fee) external;
    function setOriginalCreatorAndElementsRate(uint96 _original_creator_rate, uint96 _element_creators_rate) external;
    function setElementCreatersRate(uint96 _first_element_rate, uint96 _second_element_rate, uint96 _original_element_rate) external;

    function getDistributedResult(DistributionStructs.DistributionRole calldata _distribution_role, uint256 _amount) external view returns (address[] memory, uint256[] memory);
}
