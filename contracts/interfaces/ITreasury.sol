// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface ITreasury {

    function MINIMUM_TRANSFER_FEES() external view returns (uint256);

    function canFeeDistribute() external view returns (bool);

    function feeDistribution() external;
}
