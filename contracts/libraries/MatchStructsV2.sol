// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../dependencies/Address.sol";

library MatchStructsV2 {

    // 比赛数据
    struct MatchDataParam {
        bytes32 matchId; // 比赛ID
        uint256 matchListTime; // 比赛上架时间
        uint256 matchStartTime; // 比赛开始时间
        uint256 matchEndTime; // 比赛结束时间

        uint256 voteCount; // 投票数量
        uint256 voteArenaCount; // 投票摆擂台数量
        uint256 voteChallengeCount; // 投票挑战者数量

        string arenaJPG; // 摆擂台JPG地址
        address arenaOwner; // 摆擂台持有人
        address arenaNFT; // 摆擂台的NFT地址
        uint256 arenaTokenId; // 摆擂台的NFT的tokenId
        bytes arenaOwnerSignature; // 摆擂台NFT持有人签名

        string challengeJPG; // 挑战者JPG地址
        address challengeOwner; // 挑战者持有人
        address challengeNFT; // 挑战者NFT地址
        uint256 challengeTokenId; // 挑战者NFT的tokenId
        bytes challengeOwnerSignature; // 挑战者NFT持有人签名

        string merkleTreeURI; // 投票结果MerkleTree的IPFS地址，用户可以自行验证
        bytes32 merkleTreeRoot; // 投票结果MerkleTree的根节点

        bytes extraSignature;
    }

    // 比赛数据
    struct MatchData {
        address arenaOwner;
        address arenaNFT;
        address challengeOwner;
        address challengeNFT;
        address winner;

        uint256 voteArenaCount;
        uint256 voteChallengeCount;
        uint256 arenaTokenId;
        uint256 challengeTokenId;
        uint256 determinedAt;

        bytes32 merkleTreeRoot;
    }
/*    struct MatchData {
//        bytes32 matchId; // 比赛ID
//        uint256 matchStartTime; // 比赛开始时间
//        uint256 matchEndTime; // 比赛结束时间
//
//        uint256 voteCount; // 投票数量
        uint256 voteArenaCount; // 投票摆擂台数量
        uint256 voteChallengeCount; // 投票挑战者数量

        address arenaOwner; // 摆擂台持有人
        address arenaNFT; // 摆擂台的NFT地址
        uint256 arenaTokenId; // 摆擂台的NFT的tokenId
//        bytes arenaOwnerSignature; // 摆擂台NFT持有人签名

        address challengeOwner; // 挑战者持有人
        address challengeNFT; // 挑战者NFT地址
        uint256 challengeTokenId; // 挑战者NFT的tokenId
//        bytes challengeOwnerSignature; // 挑战者NFT持有人签名

        bytes32 merkleTreeRoot; // 投票结果MerkleTree的根节点

        address winner; // 胜利者
//        bytes extraSignature;
//        uint256 burnedAt; // 比赛结束后，烧毁NFT的时间
        uint256 determinedAt; // 比赛结束时间
    }*/

    // 投票数据
/*    struct VoteData {
        bytes matchId; // 比赛ID
        address voter; // 投票人
        UserVote userVote; // 投票结果
        bytes signedUserVote; // 签名投票结果
        uint256 votedAt; // 投票时间
        bytes merkleTreeRoot; // 投票结果MerkleTree的根节点
        bytes[] merkleProof; // 投票结果MerkleTree的证明路径
    }*/

    // 用户投票
    struct UserVote {
        bytes32 matchId; // 比赛ID
        address voter; // 投票人
        address votedNFT; // 投票NFT地址
        uint256 votedTokenId; // 投票NFT的tokenId
        string votedJPG; // 投票NFT的JPG地址
        address NFTOwner; // 投票NFT的JPG持有人
        uint256 votedAt; // 投票时间
        bytes extraSignature; // 额外签名
    }

    enum Winner {
        Arena,
        Challenge
    }

    enum NFTType {
        ERC721,
        ERC1155
    }

}
