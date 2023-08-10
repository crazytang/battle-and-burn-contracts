// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../libraries/AggressiveBidDistributionStructs.sol";


interface IAggressiveBidDistribution {
    event SetBidRoyaltyRate(uint96 bid_royalty_rate);
    event SetVerifierAddress(address verifier_address);
    event AddedToDailyReward(address indexed sender, uint256 date, uint256 amount);
    event DistributedDaily(address indexed sender, uint256 date, uint256 total_amount, address[] users, uint256[] amounts, bytes32 merkle_root, bytes extra_signature, string merkle_ipfs_uri);
    event Claimed(address indexed sender, uint256 claimed_amount);

    function denominator() external view returns (uint96);
    function bid_royalty_rate() external view returns (uint96);
    function verifier_address() external view returns (address);

    function setVerifierAddress(address _verifier_address) external;
    function setBidRoyaltyRate(uint96 _bid_royalty_rate) external;
    function addToDailyReward(uint256 _timestamp) external payable;
    function distributeDaily(AggressiveBidDistributionStructs.ClaimRewardParams calldata _claim_reward_params) external;
    function claim() external;

    function getUserClaimableAmount(address _user_address) external view returns (uint256);
    function getRewardAmountDaily(uint256 _date) external view  returns (uint256);
}
