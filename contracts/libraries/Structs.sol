// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

library Structs {

    // 比赛数据
    struct MatchData {
        bytes32 matchId; // 比赛ID
        string matchName; // 比赛名称
        uint256 matchStartTime; // 比赛开始时间
        uint256 matchEndTime; // 比赛结束时间
        uint256 voteCount; // 投票数量
        uint256 votePositiveCount; // 投票正面数量
        uint256 voteNegativeCount; // 投票反面数量
        address positiveNFT; // 正面NFT地址
        uint256 positiveTokenId; // 正面NFT的tokenId
        address negativeNFT; // 反面NFT地址
        uint256 negativeTokenId; // 反面NFT的tokenId
        string merkleTreeURI; // 投票结果MerkleTree的IPFS地址，用户可以自行验证
        bytes32 merkleTreeRoot; // 投票结果MerkleTree的根节点
    }

    // 投票数据
    struct VoteData {
        bytes32 matchId; // 比赛ID
        address voter; // 投票人
        VoteResult voteResult; // 投票结果
        bytes32 votedResultHash; // 投票结果hash
        uint256 votedAt; // 投票时间
    }

    // 投票结果
    struct VoteResult {
        bytes32 matchId; // 比赛ID
        address voter; // 投票人
        address votedNFT; // 投票NFT地址
        uint256 votedTokenId; // 投票NFT的tokenId
    }
}
