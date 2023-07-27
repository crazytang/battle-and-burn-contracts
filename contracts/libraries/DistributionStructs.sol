// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

library  DistributionStructs {
    // 分发角色参数
    struct DistributionRoleParams {
        address original_element_creator; // 最早期元素的创建者
        address[] element_creators; // 元素的创建者
        address[] element_quote_element_creators; // 元素的引用元素的创建者
    }

    // 分发角色
    struct DistributionRole {
        address creator; // 二创的创建者
        address original_element_creator; // 二创引用的最原始的元素的创建者
        address[] element_creators; // 元素的创建者
        address[] element_quote_element_creators; // 元素的引用元素的创建者
    }

    // 收益数据
    struct UserRewardData {
        address user_address;
        uint256 claimable_amount;
        uint256 claimed_amount;
        uint256 last_claimed_at;
    }

    // 领取数据
    struct ClaimData {
        address user_address;
        uint256 claimable_amount;
        uint256 claimed_amount;
        uint256 last_claimed_at;
    }

    struct CreationNFTParams {
        address creator;
        string name;
        string symbol;
        string baseURI;
        DistributionRoleParams distribution_role_params;
        address distribution_policy_address;
    }

    struct DetermineIncludeJPGVars {
        address winner_address;
        address loser_address;
        bool winner_is_jpg;
        bool loser_is_jpg;
        address winner_nft_address;
        uint256 winner_nft_token_id;
        address loser_nft_address;
        uint256 loser_nft_token_id;
        string winner_jpg;
        string loser_jpg;
    }
}
