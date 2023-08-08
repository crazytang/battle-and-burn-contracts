// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

library UserStakeStructs {
    struct BattlePoolUserStakedData {
        address userAddress;
        address nftAddress;
        uint256 tokenId;
        uint256 amount;
        uint256 stakedAt;
        bool isFrozen;
        address beneficiaryAddress;
    }


    struct BidPoolUserStakedData {
        address userAddress;
        NFTStakedData[] nftStakedDataList;
        uint256 balance;
    }

    struct NFTStakedData {
        address nftAddress;
        uint256 tokenId;
        uint256 amount;
    }

    struct UserNFTStakedData {
        address userAddress;
        address nftAddress;
        uint256 tokenId;
        uint256 amount;
        uint256 lastTradedAt;
    }

    struct ApprovalData {
        address userAddress;
        address spender;
        uint256 tokenId;
        uint256 nonce;
        uint256 deadline;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

}
