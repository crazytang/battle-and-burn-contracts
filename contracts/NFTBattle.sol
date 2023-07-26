// ##deployed index: 31
// ##deployed at: 2023/07/26 10:41:44
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./dependencies/Initializable.sol";
import "./dependencies/OwnableUpgradeable.sol";
import "./dependencies/PausableUpgradeable.sol";
import "./dependencies/ReentrancyGuardUpgradeable.sol";
import "./dependencies/Address.sol";
import "./dependencies/ECDSAUpgradeable.sol";
import "./libraries/MatchStructs.sol";
import "./interfaces/INFTBattlePool.sol";
import "./interfaces/INFTBattle.sol";

contract NFTBattle is INFTBattle, Initializable, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable {
    using ECDSAUpgradeable for bytes32;

    mapping(address => uint256) private user_nonces;

    mapping(bytes32 => MatchStructs.MatchData) private matches;

    bytes32[] private match_ids;

    mapping(bytes32 => bytes32[]) private nft_won_matches;

    mapping(bytes32 => uint256) private nft_ko_scores;

    uint96 minimum_vote_amount;

    INFTBattlePool public nft_battle_pool;

    /// @notice This method is called by the proxy contract to initialize the contract.
    function initialize() public initializer {
        __Ownable_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        minimum_vote_amount = 2;
    }

    /// @notice 设置NFTBattlePool地址
    /// @param _nft_battle_pool NFTBattlePool地址
    function setNFTBattlePool(address _nft_battle_pool) external override whenNotPaused onlyOwner {
        require(Address.isContract(_nft_battle_pool), "NFTBattle: NFTBattlePool is not a contract");
        nft_battle_pool = INFTBattlePool(_nft_battle_pool);

        emit SetNFTBattlePool(_nft_battle_pool);
    }

    /// @notice Battle裁决
    /// @param _match_data 比赛数据
    /// @param _redeem_nft 是否赎回NFT
    function determine(MatchStructs.MatchData calldata _match_data, bool _redeem_nft) external override whenNotPaused nonReentrant {
        _determine(_match_data, _redeem_nft, address(0));
    }

    /// @notice 系统裁决
    /// @param _match_data 比赛数据
    function determineBySys(MatchStructs.MatchData calldata _match_data) external {
        _determine(_match_data, false, msg.sender);
    }

    /// @notice hash比赛数据，用来签名
    /// @param _match_id 比赛ID
    /// @param _match_start_time 比赛开始时间
    /// @param _match_end_time 比赛结束时间
    /// @param _nft_address NFT地址
    /// @param _token_id NFT tokenId
    /// @return hash值
    function hashMatchData(bytes32 _match_id, uint256 _match_start_time, uint256 _match_end_time, address _nft_address, uint256 _token_id) external override pure returns (bytes32) {
        return _hashMatchData(_match_id, _match_start_time, _match_end_time, _nft_address, _token_id);
    }

    /// @notice 检查签名
    /// @param _hash hash值
    /// @param _signer 签名者
    /// @param _signature 签名
    /// @return 是否签名正确
    function checkSign(bytes32 _hash, address _signer, bytes calldata _signature) external override pure returns (bool) {
        return _checkSign(_hash, _signer, _signature);
    }

    /// @notice 检查Arena和Challenge的签名
    /// @param _match_data 比赛数据
    /// @return 两个签名是否正确
    function checkArenaAndChallengeSignatures(MatchStructs.MatchData calldata _match_data) external override view returns (bool, bool) {
        return _checkArenaAndChallengeSignatures(_match_data);
    }

    /// @notice 获取用户的nonce
    /// @param _user 用户地址
    /// @return nonce值
    function getUserNonce(address _user) external override view returns (uint256) {
        return user_nonces[_user];
    }

    /// @notice 获取比赛数据
    /// @param _match_id 比赛ID
    /// @return 比赛数据
    function getMatchData(bytes32 _match_id) external override view returns (MatchStructs.MatchData memory) {
        return matches[_match_id];
    }

    /// @notice 获取用户投票的hash
    /// @param _user_vote 用户投票数据
    /// @return hash值
    function getUserVoteHash(MatchStructs.UserVote calldata _user_vote) external override pure returns (bytes32) {
        return keccak256(bytes.concat(keccak256(abi.encode(
            _user_vote.matchId,
            _user_vote.voter,
            _user_vote.votedNFT,
            _user_vote.votedTokenId,
            _user_vote.voterNonce,
            _user_vote.votedAt
        ))));
    }

    /// @notice 获取NFT赢得的比赛
    /// @param _nft_address NFT地址
    /// @param _nft_tokenId NFT tokenId
    /// @return 比赛ID数组
    function getNFTWonMatches(address _nft_address, uint256 _nft_tokenId) external override view returns (bytes32[] memory) {
        bytes32 _nft_id = _getNFTId(_nft_address, _nft_tokenId);
        return nft_won_matches[_nft_id];
    }

    /// @notice 获取NFT的KO分数
    /// @param _nft_address NFT地址
    /// @param _nft_tokenId NFT tokenId
    /// @return KO分数
    function getNFTKOScore(address _nft_address, uint256 _nft_tokenId) external override view returns (uint256) {
        bytes32 _nft_id = _getNFTId(_nft_address, _nft_tokenId);
        return nft_ko_scores[_nft_id];
    }

    /// @notice 获取NFT的ID
    /// @param _nft_address NFT地址
    /// @param _nft_tokenId NFT tokenId
    /// @return NFT的ID
    function getNFTId(address _nft_address, uint256 _nft_tokenId) external override pure returns (bytes32) {
        return _getNFTId(_nft_address, _nft_tokenId);
    }

    function _getNFTId(address _nft_address, uint256 _nft_tokenId) private pure returns (bytes32) {
        return keccak256(abi.encode(_nft_address, _nft_tokenId));
    }

    function _checkSign(bytes32 _hash, address _signer, bytes calldata _signature) private pure returns (bool) {
        return _hash.recover(_signature) == _signer;
    }

    function _hashMatchData(bytes32 _match_id, uint256 _match_start_time, uint256 _match_end_time, address _nft_address, uint256 _token_id) private pure returns (bytes32) {
        return keccak256(bytes.concat(keccak256(abi.encode(
            _match_id,_match_start_time,_match_end_time,_nft_address,_token_id
        ))));
    }

    function _checkArenaAndChallengeSignatures(MatchStructs.MatchData calldata _match_data) private view returns (bool, bool) {
        bool _arena_sign = false;
        bytes32 _arena_hash = _hashMatchData(_match_data.matchId, _match_data.matchStartTime, _match_data.matchEndTime, _match_data.arenaNFT, _match_data.arenaTokenId);
        address _arena_owner = nft_battle_pool.getNFTOwner(_match_data.arenaNFT, _match_data.arenaTokenId);
        if (_checkSign(_arena_hash, _arena_owner, _match_data.arenaOwnerSignature)) {
            _arena_sign = true;
        }

        bool _challenge_sign = false;
        bytes32 _challenge_hash = _hashMatchData(_match_data.matchId, _match_data.matchStartTime, _match_data.matchEndTime, _match_data.challengeNFT, _match_data.challengeTokenId);
        address _challenge_owner = nft_battle_pool.getNFTOwner(_match_data.challengeNFT, _match_data.challengeTokenId);
        if (_checkSign(_challenge_hash, _challenge_owner, _match_data.challengeOwnerSignature)) {
            _challenge_sign = true;
        }

        return (_arena_sign, _challenge_sign);
    }

    function _determine(MatchStructs.MatchData calldata _match_data, bool _redeem_nft, address _executor) private {
        require(_match_data.matchId.length > 0, "NFTBattle: match_id is empty");
        require(_match_data.matchEndTime >= block.timestamp, "NFTBattle: matchEndTime is less than current time");
        require(_match_data.voteCount >= minimum_vote_amount, "NFTBattle: voteCount is less than minimum_vote_amount");
        require(_match_data.voteArenaCount != _match_data.voteChallengeCount, "NFTBattle: voteArenaCount is equal to voteChallengeCount");
        require(_match_data.merkleTreeRoot.length > 0, "NFTBattle: merkleTreeRoot can not be empty");

        (bool _arena_sign, bool _challenge_sign) = _checkArenaAndChallengeSignatures(_match_data);
        require(_arena_sign, "NFTBattle: arenaOwnerSignature is invalid");
        require(_challenge_sign, "NFTBattle: challengeOwnerSignature is invalid");

        matches[_match_data.matchId] = _match_data;
        matches[_match_data.matchId].burnedAt = block.timestamp;

        address _burn_nft_address;
        uint256 _burn_nft_token_id;

        address _won_nft_address;
        uint256 _won_nft_token_id;

        bool _arena_win = _match_data.voteArenaCount > _match_data.voteChallengeCount;
        if (_arena_win) {
            _burn_nft_address = _match_data.challengeNFT;
            _burn_nft_token_id = _match_data.challengeTokenId;
            _won_nft_address = _match_data.arenaNFT;
            _won_nft_token_id = _match_data.arenaTokenId;
        } else {
            _burn_nft_address = _match_data.arenaNFT;
            _burn_nft_token_id = _match_data.arenaTokenId;
            _won_nft_address = _match_data.challengeNFT;
            _won_nft_token_id = _match_data.challengeTokenId;
        }

        address _winner_address = nft_battle_pool.getNFTOwner(_won_nft_address, _won_nft_token_id);

        MatchStructs.NFTData memory _winner_nft_data = nft_battle_pool.getUserStakedData(_winner_address, _won_nft_address, _won_nft_token_id);
        require(_winner_nft_data.amount > 0, "NFTBattle: winner nft is not staked");
        require(_winner_nft_data.isFrozen == false, "NFTBattle: winner nft is frozen");

        // burn loser's nft
        address _loser_address = nft_battle_pool.getNFTOwner(_burn_nft_address, _burn_nft_token_id);
        nft_battle_pool.burnNFT(_loser_address, _burn_nft_address, _burn_nft_token_id);

        // update matches result data
        match_ids.push(_match_data.matchId);
        bytes32 _nft_winner_id = _getNFTId(_won_nft_address, _won_nft_token_id);
        nft_won_matches[_nft_winner_id].push(_match_data.matchId);

        // update nft ko score
        bytes32 _nft_loser_id = _getNFTId(_burn_nft_address, _burn_nft_token_id);
        nft_ko_scores[_nft_winner_id] = nft_ko_scores[_nft_loser_id] + 1;

        emit Determined(_match_data.matchId, _won_nft_address, _won_nft_token_id, _burn_nft_address, _burn_nft_token_id, nft_battle_pool.burn_to_address());

        // redeem won nft
        if (_redeem_nft) {
            nft_battle_pool.redeemToOwner(_winner_address, _won_nft_address, _won_nft_token_id);
        }

        // 由系统执行的时候，需要冻结赢家的NFT
        if (_executor != address(0)) {
            nft_battle_pool.freezeNFT(_winner_address, _won_nft_address, _won_nft_token_id, msg.sender);
        }
    }
}
