// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

library MatchStructs {

    // 比赛数据
    struct MatchData {
        bytes32 matchId; // 比赛ID
        uint256 matchStartTime; // 比赛开始时间
        uint256 matchEndTime; // 比赛结束时间

        uint256 voteCount; // 投票数量
        uint256 voteArenaCount; // 投票摆擂台数量
        uint256 voteChallengeCount; // 投票挑战者数量

        string arenaJPG; // 摆擂台JPG地址
        address arenaJPGOwner; // 摆擂台JPG持有人
        address arenaNFT; // 摆擂台的NFT地址
        uint256 arenaTokenId; // 摆擂台的NFT的tokenId
        bytes arenaOwnerSignature; // 摆擂台NFT持有人签名

        string challengeJPG; // 挑战者JPG地址
        address challengeJPGOwner; // 挑战者JPG持有人
        address challengeNFT; // 挑战者NFT地址
        uint256 challengeTokenId; // 挑战者NFT的tokenId
        bytes challengeOwnerSignature; // 挑战者NFT持有人签名

        string merkleTreeURI; // 投票结果MerkleTree的IPFS地址，用户可以自行验证
        bytes32 merkleTreeRoot; // 投票结果MerkleTree的根节点

        uint256 burnedAt; // 比赛结束后，烧毁NFT的时间
    }

    // 投票数据
    struct VoteData {
        bytes matchId; // 比赛ID
        address voter; // 投票人
        UserVote userVote; // 投票结果
        bytes signedUserVote; // 签名投票结果
        uint256 votedAt; // 投票时间
        bytes merkleTreeRoot; // 投票结果MerkleTree的根节点
        bytes[] merkleProof; // 投票结果MerkleTree的证明路径
    }

    // 用户投票
    struct UserVote {
        bytes matchId; // 比赛ID
        address voter; // 投票人
        address votedNFT; // 投票NFT地址
        uint256 votedTokenId; // 投票NFT的tokenId
        uint256 voterNonce; // 投票人nonce
        uint256 votedAt; // 投票时间
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

    struct NFTData {
        address nftAddress;
        uint256 tokenId;
        uint256 amount;
        uint256 stakedAt;
        bool isFrozen;
        address beneficiaryAddress;
    }

    enum NFTType {
        ERC721,
        ERC1155
    }

}
