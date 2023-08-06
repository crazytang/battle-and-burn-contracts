// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

library AggressiveBidStructs {

    enum Side {Buy, Sell}
    enum AssetType {ERC721, ERC1155}
    enum OrderType {FixedPrice, EnglishAuction, DutchAuction}

    struct Order {
        address trader;
        Side side;
        OrderType orderType;
        address collection;
        AssetType assetType;
        uint256 tokenId;
        uint256 amount;
        address paymentToken;
        uint256 price;
        uint256 listingTime;
        uint256 expirationTime;
        uint256 trader_nonce;
        bytes extraParams;
    }

    struct Input {
        Order order;
        uint8 v;
        bytes32 r;
        bytes32 s;
        bytes extraSignature;
        MerkleTree merkleTree;
        uint256 blockNumber;
    }

    struct MerkleTree {
        bytes32 root;
        bytes32[] proof;
    }
}
