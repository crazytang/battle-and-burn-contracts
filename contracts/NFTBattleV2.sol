// ##deployed index: 113
// ##deployed at: 2023/08/28 22:41:53
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./dependencies/Initializable.sol";
import "./dependencies/OwnableUpgradeable.sol";
import "./dependencies/PausableUpgradeable.sol";
import "./dependencies/ReentrancyGuardUpgradeable.sol";
import "./dependencies/IERC721Enumerable.sol";
import "./dependencies/Address.sol";
import "./dependencies/ECDSAUpgradeable.sol";
import "./interfaces/INFTBattlePoolV2.sol";
import "./interfaces/INFTBattleV2.sol";
import "./interfaces/ICreationNFTV2.sol";
import "./libraries/MatchStructsV2.sol";

contract NFTBattleV2 is INFTBattleV2, Initializable, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable {
    using ECDSAUpgradeable for bytes32;

    // User address => nonce
    mapping(address => uint256) private user_nonces;

    // Match Id => MatchData
    mapping(bytes32 => MatchStructsV2.MatchData) private matches;

    // NFT address => (tokenId => MatchId[])
    mapping(address => mapping(uint256 => bytes32[])) private nft_won_matches;

    // NFT address => (tokenId => ko score)
    mapping(address => mapping(uint256 => uint256)) private nft_ko_scores;

    uint96 minimum_vote_amount;

    INFTBattlePoolV2 public override nft_battle_pool_v2;

    ICreationNFTV2 public override creation_nft_v2;

    address public override verifier_address;

    /// @notice This method is called by the proxy contract to initialize the contract.
    function initialize() public initializer {
        __Ownable_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        minimum_vote_amount = 3;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    /// @notice 设置NFTBattlePool地址
    /// @param _nft_battle_pool_v2 NFTBattlePool地址
    function setNFTBattlePool(address _nft_battle_pool_v2) external override whenNotPaused onlyOwner {
        require(Address.isContract(_nft_battle_pool_v2), "NFTBattle: NFTBattlePool is not a contract");
        nft_battle_pool_v2 = INFTBattlePoolV2(_nft_battle_pool_v2);

        emit SetNFTBattlePool(_nft_battle_pool_v2);
    }

    function setCreationNFT(address _creation_nft_address) external override whenNotPaused onlyOwner {
        require(Address.isContract(_creation_nft_address), "NFTBattle: CreationNFT is not a contract");
        creation_nft_v2 = ICreationNFTV2(_creation_nft_address);

        emit SetCreationNFTContract(_creation_nft_address);
    }

    function setVerifierAddress(address _verifier_address) external override whenNotPaused onlyOwner {
        verifier_address = _verifier_address;

        emit SetVerifierAddress(_verifier_address);
    }

    /// @notice Battle裁决
    /// @param _match_data_param 比赛数据
    /// @param _redeem_nft 是否赎回NFT
    function determine(MatchStructsV2.MatchDataParam calldata _match_data_param, bool _redeem_nft) external override whenNotPaused nonReentrant {
        _determine(_match_data_param, _redeem_nft, address(0));
    }

    /// @notice 系统裁决
    /// @param _match_data_param 比赛数据
    function determineBySys(MatchStructsV2.MatchDataParam calldata _match_data_param) external override whenNotPaused nonReentrant {
        _determine(_match_data_param, false, msg.sender);
    }

    /// @notice Battle裁决，包含JPG
    /// @param _match_data_param 比赛数据
    /// @param _token_meta_hash NFT的元数据hash
    /// @param _nft_redeem 是否赎回NFT
    function determineIncludeJPG(MatchStructsV2.MatchDataParam calldata _match_data_param, bytes32 _token_meta_hash, bool _nft_redeem) external override whenNotPaused nonReentrant {
        _determineIncludeJPG(_match_data_param, _token_meta_hash, _nft_redeem, address(0));
    }

    /// @notice 系统裁决，包含JPG
    /// @param _match_data_param 比赛数据
    /// @param _token_meta_hash NFT的元数据hash
    function determineIncludeJPGBySys(MatchStructsV2.MatchDataParam calldata _match_data_param, bytes32 _token_meta_hash) external override whenNotPaused nonReentrant {
        _determineIncludeJPG(_match_data_param, _token_meta_hash, false, msg.sender);
    }

    /// @notice hash比赛数据，用来签名
    /// @param _match_id 比赛ID
    /// @param _nft_address NFT地址
    /// @param _token_id NFT tokenId
    /// @return hash值
    function hashMatchData(bytes32 _match_id, address _nft_address, uint256 _token_id, string calldata _jpg, address _jpg_owner) external override pure returns (bytes32) {
        return _hashMatchData(_match_id, _nft_address, _token_id, _jpg, _jpg_owner);
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
    /// @param _match_data_param 比赛数据
    /// @return 两个签名是否正确
    function checkArenaAndChallengeSignatures(MatchStructsV2.MatchDataParam calldata _match_data_param) external override pure returns (bool, bool) {
        return _checkArenaAndChallengeSignatures(_match_data_param);
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
    function getMatchData(bytes32 _match_id) external override view returns (MatchStructsV2.MatchData memory) {
        return matches[_match_id];
    }

    /// @notice 获取用户投票的hash
    /// @param _user_vote 用户投票数据
    /// @return hash值
    function getUserVoteHash(MatchStructsV2.UserVote calldata _user_vote) public override pure returns (bytes32) {
        return keccak256(bytes.concat(keccak256(abi.encode(
            _user_vote.matchId,
            _user_vote.voter,
            _user_vote.votedNFT,
            _user_vote.votedTokenId,
            _user_vote.votedJPG,
            _user_vote.NFTOwner,
            _user_vote.votedAt,
            _user_vote.extraSignature
        ))));
    }

    /// @notice 获取NFT赢得的比赛
    /// @param _nft_address NFT地址
    /// @param _nft_tokenId NFT tokenId
    /// @return 比赛ID数组
    function getNFTWonMatches(address _nft_address, uint256 _nft_tokenId) external override view returns (bytes32[] memory) {
        return nft_won_matches[_nft_address][_nft_tokenId];
    }

    /// @notice 获取NFT的KO分数
    /// @param _nft_address NFT地址
    /// @param _nft_tokenId NFT tokenId
    /// @return KO分数
    function getNFTKOScore(address _nft_address, uint256 _nft_tokenId) external override view returns (uint256) {
        return nft_ko_scores[_nft_address][_nft_tokenId];
    }

    function checkUserVote(MatchStructsV2.UserVote calldata _user_vote, bytes calldata _signature) external view override returns (bool) {
        bytes32 _hash_for_extraSignature = keccak256(bytes.concat(keccak256(abi.encode(
            _user_vote.matchId,
            _user_vote.voter,
            _user_vote.votedNFT,
            _user_vote.votedTokenId,
            _user_vote.votedJPG,
            _user_vote.NFTOwner,
            _user_vote.votedAt
        ))));

        if (verifier_address != _hash_for_extraSignature.recover(_user_vote.extraSignature)) {
            return false;
        }

        bytes32 _hash = getUserVoteHash(_user_vote);
        return _hash.recover(_signature) == _user_vote.voter;
    }

    function _checkSign(bytes32 _hash, address _signer, bytes calldata _signature) private pure returns (bool) {
        (address _recovered_signer, ) = _hash.tryRecover(_signature);
        return _recovered_signer == _signer;
    }

    function _hashMatchData(bytes32 _match_id, address _nft_address, uint256 _token_id, string calldata _jpg, address _jpg_owner) private pure returns (bytes32) {
        return keccak256(bytes.concat(keccak256(abi.encode(
            _match_id,_nft_address,_token_id, _jpg, _jpg_owner
        ))));
    }

    function _checkArenaAndChallengeSignatures(MatchStructsV2.MatchDataParam calldata _match_data_param) private pure returns (bool, bool) {
        bool _arena_sign = false;
        bool _challenge_sign = false;

        if (_match_data_param.arenaOwnerSignature.length > 0 ){
            bytes32 _arena_hash = _hashMatchData(_match_data_param.matchId, _match_data_param.arenaNFT, _match_data_param.arenaTokenId, _match_data_param.arenaJPG, _match_data_param.arenaOwner);
            if (_checkSign(_arena_hash, _match_data_param.arenaOwner, _match_data_param.arenaOwnerSignature)) {
                _arena_sign = true;
            }
        }

        if (_match_data_param.challengeOwnerSignature.length > 0) {
            bytes32 _challenge_hash = _hashMatchData(_match_data_param.matchId, _match_data_param.challengeNFT, _match_data_param.challengeTokenId, _match_data_param.challengeJPG, _match_data_param.challengeOwner);
            if (_checkSign(_challenge_hash, _match_data_param.challengeOwner, _match_data_param.challengeOwnerSignature)) {
                _challenge_sign = true;
            }
        }

        return (_arena_sign, _challenge_sign);
    }

    struct DetermineVars {
        address winner_address;
        address loser_address;
        address winner_nft_address;
        uint256 winner_nft_token_id;
        address loser_nft_address;
        uint256 loser_nft_token_id;
    }
    function _determine(MatchStructsV2.MatchDataParam calldata _match_data_param, bool _redeem_nft, address _executor) private {
//        require(_match_data_param.arenaNFT != address(0), "NFTBattle: arenaNFT is empty");
//        require(_match_data_param.challengeNFT != address(0), "NFTBattle: challengeNFT is empty");

        require(nft_battle_pool_v2.userNFTIsAvailable(_match_data_param.arenaOwner, _match_data_param.arenaNFT, _match_data_param.arenaTokenId), "NFTBattle: arenaNFT is not available in NFTBattlePool");

        require(nft_battle_pool_v2.userNFTIsAvailable(_match_data_param.challengeOwner, _match_data_param.challengeNFT, _match_data_param.challengeTokenId), "NFTBattle: challengeNFT is not available in NFTBattlePool");

        _checkMatchData(_match_data_param);

        _checkExtraSignature(_match_data_param.matchId, _match_data_param.voteArenaCount, _match_data_param.voteChallengeCount, _match_data_param.arenaOwnerSignature, _match_data_param.challengeOwnerSignature, _match_data_param.merkleTreeRoot, _match_data_param.extraSignature);

        DetermineVars memory _vars;

        bool _arena_win = _match_data_param.voteArenaCount > _match_data_param.voteChallengeCount;
        if (_arena_win) {
            _vars.loser_nft_address = _match_data_param.challengeNFT;
            _vars.loser_nft_token_id = _match_data_param.challengeTokenId;
            _vars.loser_address = _match_data_param.challengeOwner;
            _vars.winner_nft_address = _match_data_param.arenaNFT;
            _vars.winner_nft_token_id = _match_data_param.arenaTokenId;
            _vars.winner_address = _match_data_param.arenaOwner;
        } else {
            _vars.loser_nft_address = _match_data_param.arenaNFT;
            _vars.loser_nft_token_id = _match_data_param.arenaTokenId;
            _vars.loser_address = _match_data_param.arenaOwner;
            _vars.winner_nft_address = _match_data_param.challengeNFT;
            _vars.winner_nft_token_id = _match_data_param.challengeTokenId;
            _vars.winner_address = _match_data_param.challengeOwner;
        }

        // burn loser's nft
        nft_battle_pool_v2.burnNFT(_vars.loser_address, _vars.loser_nft_address, _vars.loser_nft_token_id);

        _updateMatchData(_match_data_param, _vars.winner_address, _vars.winner_nft_address, _vars.winner_nft_token_id, _vars.loser_nft_address, _vars.loser_nft_token_id);

        emit Determined(_match_data_param.matchId, _vars.winner_nft_address, _vars.winner_nft_token_id, _vars.loser_nft_address, _vars.loser_nft_token_id, _match_data_param.merkleTreeURI, _match_data_param.merkleTreeRoot);
//        emit MatchDataSignatures(_match_data_param.arenaOwnerSignature, _match_data_param.challengeOwnerSignature, _match_data_param.extraSignature);

        // 由系统执行的时候，需要冻结赢家的NFT
        if (_executor != address(0)) {
            nft_battle_pool_v2.freezeNFT(_vars.winner_address, _vars.winner_nft_address, _vars.winner_nft_token_id, _executor);
            return;
        }

        // redeem won nft
        if (_redeem_nft) {
            nft_battle_pool_v2.redeemToOwner(_vars.winner_address, _vars.winner_nft_address, _vars.winner_nft_token_id);
        }

        delete _vars;
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

    function _determineIncludeJPG(MatchStructsV2.MatchDataParam calldata _match_data_param, bytes32 _token_meta_hash, bool _nft_redeem, address _executor) private {
        if (_match_data_param.arenaNFT != address(0)) {
            require(nft_battle_pool_v2.userNFTIsAvailable(_match_data_param.arenaOwner, _match_data_param.arenaNFT, _match_data_param.arenaTokenId), "NFTBattle: arenaNFT is not available in NFTBattlePool");
        }

        if (_match_data_param.challengeNFT != address(0)) {
            require(nft_battle_pool_v2.userNFTIsAvailable(_match_data_param.challengeOwner, _match_data_param.challengeNFT, _match_data_param.challengeTokenId), "NFTBattle: challengeNFT is not available in NFTBattlePool");
        }

        _checkMatchData(_match_data_param);

        _checkExtraSignature(_match_data_param.matchId, _match_data_param.voteArenaCount, _match_data_param.voteChallengeCount, _match_data_param.arenaOwnerSignature, _match_data_param.challengeOwnerSignature, _match_data_param.merkleTreeRoot, _match_data_param.extraSignature);

        DetermineIncludeJPGVars memory _vars;
        bool _arena_win = _match_data_param.voteArenaCount > _match_data_param.voteChallengeCount;
        if (_arena_win) {
            _vars.winner_address = _match_data_param.arenaOwner;
            if (_match_data_param.arenaNFT == address(0)) {
                _vars.winner_is_jpg = true;
                _vars.winner_jpg = _match_data_param.arenaJPG;
            } else {
                _vars.winner_nft_address = _match_data_param.arenaNFT;
                _vars.winner_nft_token_id = _match_data_param.arenaTokenId;
            }

            if (_match_data_param.challengeNFT == address(0)) {
                _vars.loser_is_jpg = true;
                _vars.loser_jpg = _match_data_param.challengeJPG;
            } else {
                _vars.loser_address = _match_data_param.challengeOwner;
                _vars.loser_nft_address = _match_data_param.challengeNFT;
                _vars.loser_nft_token_id = _match_data_param.challengeTokenId;
            }
        } else {
            _vars.winner_address = _match_data_param.challengeOwner;
            if (_match_data_param.challengeNFT == address(0)) {
                _vars.winner_is_jpg = true;
                _vars.winner_jpg = _match_data_param.challengeJPG;
            } else {
                _vars.winner_nft_address = _match_data_param.challengeNFT;
                _vars.winner_nft_token_id = _match_data_param.challengeTokenId;
            }

            if (_match_data_param.arenaNFT == address(0)) {
                _vars.loser_is_jpg = true;
                _vars.loser_jpg = _match_data_param.arenaJPG;
            } else {
                _vars.loser_address = _match_data_param.arenaOwner;
                _vars.loser_nft_address = _match_data_param.arenaNFT;
                _vars.loser_nft_token_id = _match_data_param.arenaTokenId;
            }
        }

        // mint creation nft
        if (_vars.winner_is_jpg) {
            address creation_nft_v2_address = address(creation_nft_v2);
            require(creation_nft_v2_address != address(0), "NFTBattle: creation_nft_v2 is empty");
            IERC721Enumerable _erc721 = IERC721Enumerable(creation_nft_v2_address);
            uint256 _token_id = _erc721.totalSupply();
            if (_nft_redeem == true && _executor == address(0)) {
                // 如果是胜方赎回，需要把NFT直接mint到胜方地址
                creation_nft_v2.mintTo(_vars.winner_address, _token_id, _token_meta_hash);
            } else {
                // 如果不赎回，或者是系统裁决，需要把NFT质押到NFTBattlePool
                creation_nft_v2.mintTo(address(nft_battle_pool_v2), _token_id, _token_meta_hash);
                nft_battle_pool_v2.transferTo(_vars.winner_address, creation_nft_v2_address, _token_id);
            }
            _vars.winner_nft_address = creation_nft_v2_address;
            _vars.winner_nft_token_id = _token_id;
        }

        if (_vars.loser_is_jpg == false) {
            nft_battle_pool_v2.burnNFT(_vars.loser_address, _vars.loser_nft_address, _vars.loser_nft_token_id);
        }

        _updateMatchData(_match_data_param, _vars.winner_address, _vars.winner_nft_address, _vars.winner_nft_token_id, _vars.loser_nft_address, _vars.loser_nft_token_id);

        emit DeterminedIncludeJPG(_match_data_param.matchId, _vars.winner_nft_address, _vars.winner_nft_token_id, _vars.winner_jpg, _vars.loser_nft_address, _vars.loser_nft_token_id, _vars.loser_jpg, _match_data_param.merkleTreeURI, _match_data_param.merkleTreeRoot);
//        emit MatchDataSignatures(_match_data_param.arenaOwnerSignature, _match_data_param.challengeOwnerSignature, _match_data_param.extraSignature);

        // 由系统执行的时候，需要冻结赢家的NFT
        if (_executor != address(0)) {
            nft_battle_pool_v2.freezeNFT(_vars.winner_address, _vars.winner_nft_address, _vars.winner_nft_token_id, _executor);
        }

        delete _vars;
    }

    function _checkMatchData(MatchStructsV2.MatchDataParam calldata _match_data_param) private view returns (bool) {
        require(_match_data_param.matchId.length > 0, "NFTBattle: match_id is empty");
        require(_match_data_param.matchStartTime < _match_data_param.matchEndTime, "NFTBattle: matchStartTime is greater than matchEndTime");
        require(_match_data_param.matchEndTime <= block.timestamp, "NFTBattle: matchEndTime is less than current time");
        require(_match_data_param.voteCount >= minimum_vote_amount, "NFTBattle: voteCount is less than minimum_vote_amount");
        require(_match_data_param.voteArenaCount != _match_data_param.voteChallengeCount, "NFTBattle: voteArenaCount is equal to voteChallengeCount");
        require(_match_data_param.merkleTreeRoot.length > 0, "NFTBattle: merkleTreeRoot can not be empty");

        (bool _arena_sign, bool _challenge_sign) = _checkArenaAndChallengeSignatures(_match_data_param);
        require(_arena_sign, "NFTBattle: arenaOwnerSignature is invalid");
        require(_challenge_sign, "NFTBattle: challengeOwnerSignature is invalid");

        return true;
    }

    function _checkExtraSignature(bytes32 _match_id, uint256 _vote_arena_count, uint256 _vote_challenge_count, bytes calldata _arena_signature, bytes calldata _challenge_signature, bytes32 _merkle_root, bytes calldata _extra_signature) private view returns (bool) {
        bytes32 _hash = keccak256(bytes.concat(keccak256(abi.encode(_match_id, _vote_arena_count, _vote_challenge_count, _arena_signature, _challenge_signature, _merkle_root))));
        return _hash.recover(_extra_signature) == verifier_address;
    }

    function _updateMatchData(MatchStructsV2.MatchDataParam calldata _match_data_param, address _winner_address, address _winner_nft_address, uint256 _winner_nft_token_id, address _loser_nft_address, uint256 _loser_nft_token_id) private {
        // update matches result data
        bytes32 _match_id = _match_data_param.matchId;
        matches[_match_id] = MatchStructsV2.MatchData({
            arenaOwner: _match_data_param.arenaOwner,
            arenaNFT: _match_data_param.arenaNFT,
            challengeOwner: _match_data_param.challengeOwner,
            challengeNFT: _match_data_param.challengeNFT,
            winner: _winner_address,
            voteArenaCount: _match_data_param.voteArenaCount,
            voteChallengeCount: _match_data_param.voteChallengeCount,
            arenaTokenId: _match_data_param.arenaTokenId,
            challengeTokenId: _match_data_param.challengeTokenId,
            determinedAt: block.timestamp,
            merkleTreeRoot: _match_data_param.merkleTreeRoot
        });
//        matches[_match_id].matchId = _match_id;
//        matches[_match_id].matchStartTime = _match_data_param.matchStartTime;
//        matches[_match_id].matchEndTime = _match_data_param.matchEndTime;
//        matches[_match_id].voteCount = _match_data_param.voteCount;
/*        matches[_match_id].voteArenaCount = _match_data_param.voteArenaCount;
        matches[_match_id].voteChallengeCount = _match_data_param.voteChallengeCount;
        matches[_match_id].arenaOwner = _match_data_param.arenaOwner;
        matches[_match_id].arenaNFT = _match_data_param.arenaNFT;
        matches[_match_id].arenaTokenId = _match_data_param.arenaTokenId;
        matches[_match_id].challengeOwner = _match_data_param.challengeOwner;
        matches[_match_id].challengeNFT = _match_data_param.challengeNFT;
        matches[_match_id].challengeTokenId = _match_data_param.challengeTokenId;
        matches[_match_id].merkleTreeRoot = _match_data_param.merkleTreeRoot;
        matches[_match_id].winner = _winner_nft_address == _match_data_param.arenaNFT ? _match_data_param.arenaOwner : _match_data_param.challengeOwner;
        matches[_match_id].determinedAt = block.timestamp;*/

        // After JPG to NFT, we need to update the new NFT address and tokenId to match_data
        if (_match_data_param.voteArenaCount > _match_data_param.voteChallengeCount) {
            if (_match_data_param.arenaNFT == address(0)) {
                matches[_match_id].arenaNFT = _winner_nft_address;
                matches[_match_id].arenaTokenId = _winner_nft_token_id;
            }
        } else {
            if (_match_data_param.challengeNFT == address(0)) {
                matches[_match_id].challengeNFT = _winner_nft_address;
                matches[_match_id].challengeTokenId = _winner_nft_token_id;
            }
        }

        nft_won_matches[_winner_nft_address][_winner_nft_token_id].push(_match_id);

        unchecked {
            // update nft ko score
            nft_ko_scores[_winner_nft_address][_winner_nft_token_id] = nft_ko_scores[_loser_nft_address][_loser_nft_token_id] + 1;
        }
    }
}
