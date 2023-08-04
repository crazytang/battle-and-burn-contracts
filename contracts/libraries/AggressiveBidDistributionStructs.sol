// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

library AggressiveBidDistributionStructs {

    struct RewardData {
        address user_address; // 用户地址
        uint256 claimable_amount; // 可提取收益
        uint256 claimed_amount; // 已提取收益
        uint256 claimed_at; // 提取时间
    }

    struct ClaimRewardParams {
        uint256 date; // 日期
        address[] reward_users; // 领取收益的用户
        uint256[] reward_amounts;   // 领取收益的数量
        bytes32 merkle_root;    // merkle根
        bytes extra_signature;  // 额外签名
        string merkle_ipfs_uri; // merkle地址
    }
}
