// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../libraries/AggressiveBidDistributionStructs.sol";


interface IAggressiveBidDistribution {

    function denominator() external view returns (uint96);
    function bid_royalty_rate() external view returns (uint96);

    function setBidRoyaltyRate(uint96 _bid_royalty_rate) external;
    function addToDailyReward(uint256 _timestamp) external payable;
    function distributeDaily(AggressiveBidDistributionStructs.ClaimRewardParams calldata _claim_reward_params) external;
    function claim() external;

    function getUserClaimableAmount(address _user_address) external view returns (uint256);
    function getRewardAmountDaily(uint256 _date) external view  returns (uint256);
}
