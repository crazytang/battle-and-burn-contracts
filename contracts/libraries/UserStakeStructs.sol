// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


struct BattlePoolUserStakedData {
    address owner;
    address nftAddress;
    uint256 tokenId;
    uint256 amount;
    uint256 stakedAt;
    bool isFrozen;
    address beneficiaryAddress;
}


struct BidPoolUserStakedData {
    address owner;
    address nftAddress;
    uint256 tokenId;
    uint256 amount;
    uint256 stakedAt;
}

struct ApprovalData {
    address owner;
    address spender;
    uint256 tokenId;
    uint256 nonce;
    uint256 deadline;
    uint8 v;
    bytes32 r;
    bytes32 s;
}
