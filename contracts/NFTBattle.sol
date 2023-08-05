// ##deployed index: 64
// ##deployed at: 2023/08/05 15:15:37
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./dependencies/Initializable.sol";
import "./dependencies/OwnableUpgradeable.sol";
import "./dependencies/PausableUpgradeable.sol";
import "./dependencies/ReentrancyGuardUpgradeable.sol";
import "./dependencies/Address.sol";
import "./dependencies/ECDSAUpgradeable.sol";
import "./libraries/UserStakeStructs.sol";
import "./interfaces/INFTBattlePool.sol";
import "./interfaces/INFTBattle.sol";
import "./interfaces/ICreationNFT.sol";
import "./libraries/DistributionStructs.sol";
import "./libraries/MatchStructs.sol";
import "./CreateNFTContract.sol";

contract NFTBattle is INFTBattle, Initializable, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable {
    using ECDSAUpgradeable for bytes32;

    mapping(address => uint256) private user_nonces;

    mapping(bytes32 => MatchStructs.MatchData) private matches;

    bytes32[] private match_ids;

    mapping(bytes32 => bytes32[]) private nft_won_matches;

    mapping(bytes32 => uint256) private nft_ko_scores;

    uint96 minimum_vote_amount;

    INFTBattlePool public override nft_battle_pool;

    CreateNFTContract public override create_nft_contract;

    address public override verifier_address;

    /// @notice This method is called by the proxy contract to initialize the contract.
    function initialize(address _create_nft_contract) public initializer {
        __Ownable_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        require(Address.isContract(_create_nft_contract), "NFTBattle: CreateNFTContract is not a contract");
        create_nft_contract = CreateNFTContract(_create_nft_contract);

        minimum_vote_amount = 2;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    /// @notice 设置NFTBattlePool地址
    /// @param _nft_battle_pool NFTBattlePool地址
    function setNFTBattlePool(address _nft_battle_pool) external override whenNotPaused onlyOwner {
        require(Address.isContract(_nft_battle_pool), "NFTBattle: NFTBattlePool is not a contract");
        nft_battle_pool = INFTBattlePool(_nft_battle_pool);

        emit SetNFTBattlePool(_nft_battle_pool);
    }

    function setVerifierAddress(address _verifier_address) external override whenNotPaused onlyOwner {
        verifier_address = _verifier_address;

        emit SetVerifierAddress(_verifier_address);
    }

    function setCreateNFTContract(address _create_nft_contract) external override whenNotPaused onlyOwner {
        require(Address.isContract(_create_nft_contract), "NFTBattle: CreateNFTContract is not a contract");
        create_nft_contract = CreateNFTContract(_create_nft_contract);

        emit SetCreateNFTContract(_create_nft_contract);
    }

    /// @notice Battle裁决
    /// @param _match_data 比赛数据
    /// @param _redeem_nft 是否赎回NFT
    function determine(MatchStructs.MatchData calldata _match_data, bool _redeem_nft) external override whenNotPaused nonReentrant {
        _determine(_match_data, _redeem_nft, address(0));
    }

    /// @notice 系统裁决
    /// @param _match_data 比赛数据
    function determineBySys(MatchStructs.MatchData calldata _match_data) external override whenNotPaused nonReentrant {
        _determine(_match_data, false, msg.sender);
    }

    /// @notice Battle裁决，包含JPG
    /// @param _match_data 比赛数据
    /// @param _creation_nft_params 创建NFT的参数
    /// @param _nft_redeem 是否赎回NFT
    function determineIncludeJPG(MatchStructs.MatchData calldata _match_data, DistributionStructs.CreationNFTParams calldata _creation_nft_params, bool _nft_redeem) external override whenNotPaused nonReentrant {
        _determineIncludeJPG(_match_data, _creation_nft_params, _nft_redeem, address(0));
    }

    /// @notice 系统裁决，包含JPG
    /// @param _match_data 比赛数据
    /// @param _creation_nft_params 创建NFT的参数
    function determineIncludeJPGBySys(MatchStructs.MatchData calldata _match_data, DistributionStructs.CreationNFTParams calldata _creation_nft_params) external override whenNotPaused nonReentrant {
        _determineIncludeJPG(_match_data, _creation_nft_params, false, msg.sender);
    }

    /// @notice hash比赛数据，用来签名
    /// @param _match_id 比赛ID
    /// @param _match_start_time 比赛开始时间
    /// @param _match_end_time 比赛结束时间
    /// @param _nft_address NFT地址
    /// @param _token_id NFT tokenId
    /// @return hash值
    function hashMatchData(bytes32 _match_id, uint256 _match_start_time, uint256 _match_end_time, address _nft_address, uint256 _token_id, string calldata _jpg, address _jpg_owner) external override pure returns (bytes32) {
        return _hashMatchData(_match_id, _match_start_time, _match_end_time, _nft_address, _token_id, _jpg, _jpg_owner);
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
    function getUserVoteHash(MatchStructs.UserVote calldata _user_vote) public override pure returns (bytes32) {
        return keccak256(bytes.concat(keccak256(abi.encode(
            _user_vote.matchId,
            _user_vote.voter,
            _user_vote.votedNFT,
            _user_vote.votedTokenId,
            _user_vote.votedJPG,
            _user_vote.votedJPGOwner,
            _user_vote.votedAt,
            _user_vote.extraSignature
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

    function checkUserVote(MatchStructs.UserVote calldata _user_vote, bytes calldata _signature) external pure override returns (bool) {
        bytes32 _hash = getUserVoteHash(_user_vote);
        return _hash.recover(_signature) == _user_vote.voter;
    }

    function _getNFTId(address _nft_address, uint256 _nft_tokenId) private pure returns (bytes32) {
        return keccak256(abi.encode(_nft_address, _nft_tokenId));
    }

    function _checkSign(bytes32 _hash, address _signer, bytes calldata _signature) private pure returns (bool) {
        (address _recovered_signer, ) = _hash.tryRecover(_signature);
        return _recovered_signer == _signer;
    }

    function _hashMatchData(bytes32 _match_id, uint256 _match_start_time, uint256 _match_end_time, address _nft_address, uint256 _token_id, string calldata _jpg, address _jpg_owner) private pure returns (bytes32) {
        return keccak256(bytes.concat(keccak256(abi.encode(
            _match_id,_match_start_time,_match_end_time,_nft_address,_token_id, _jpg, _jpg_owner
        ))));
    }

    function _checkArenaAndChallengeSignatures(MatchStructs.MatchData calldata _match_data) private view returns (bool, bool) {
        bool _arena_sign = false;
        bool _challenge_sign = false;

        if (_match_data.arenaOwnerSignature.length > 0 ){
            bytes32 _arena_hash = _hashMatchData(_match_data.matchId, _match_data.matchStartTime, _match_data.matchEndTime, _match_data.arenaNFT, _match_data.arenaTokenId, _match_data.arenaJPG, _match_data.arenaJPGOwner);
            address _arena_owner = _match_data.arenaJPGOwner != address(0) ? _match_data.arenaJPGOwner : nft_battle_pool.getNFTOwner(_match_data.arenaNFT, _match_data.arenaTokenId);
            if (_checkSign(_arena_hash, _arena_owner, _match_data.arenaOwnerSignature)) {
                _arena_sign = true;
            }
        }

        if (_match_data.challengeOwnerSignature.length > 0) {
            bytes32 _challenge_hash = _hashMatchData(_match_data.matchId, _match_data.matchStartTime, _match_data.matchEndTime, _match_data.challengeNFT, _match_data.challengeTokenId, _match_data.challengeJPG, _match_data.challengeJPGOwner);
            address _challenge_owner = _match_data.challengeJPGOwner != address(0) ? _match_data.challengeJPGOwner : nft_battle_pool.getNFTOwner(_match_data.challengeNFT, _match_data.challengeTokenId);
            if (_checkSign(_challenge_hash, _challenge_owner, _match_data.challengeOwnerSignature)) {
                _challenge_sign = true;
            }
        }


        return (_arena_sign, _challenge_sign);
    }

    function _determine(MatchStructs.MatchData calldata _match_data, bool _redeem_nft, address _executor) private {
//        require(_match_data.matchId.length > 0, "NFTBattle: match_id is empty");
//        require(_match_data.matchEndTime >= block.timestamp, "NFTBattle: matchEndTime is less than current time");
//        require(_match_data.voteCount >= minimum_vote_amount, "NFTBattle: voteCount is less than minimum_vote_amount");
//        require(_match_data.voteArenaCount != _match_data.voteChallengeCount, "NFTBattle: voteArenaCount is equal to voteChallengeCount");
//        require(_match_data.merkleTreeRoot.length > 0, "NFTBattle: merkleTreeRoot can not be empty");

        _checkMatchData(_match_data);

        _checkExtraSignature(_match_data.merkleTreeRoot, _match_data.extraSignature);

        address _loser_nft_address;
        uint256 _loser_nft_token_id;

        address _winner_nft_address;
        uint256 _winner_nft_token_id;

        bool _arena_win = _match_data.voteArenaCount > _match_data.voteChallengeCount;
        if (_arena_win) {
            _loser_nft_address = _match_data.challengeNFT;
            _loser_nft_token_id = _match_data.challengeTokenId;
            _winner_nft_address = _match_data.arenaNFT;
            _winner_nft_token_id = _match_data.arenaTokenId;
        } else {
            _loser_nft_address = _match_data.arenaNFT;
            _loser_nft_token_id = _match_data.arenaTokenId;
            _winner_nft_address = _match_data.challengeNFT;
            _winner_nft_token_id = _match_data.challengeTokenId;
        }

        address _winner_address = nft_battle_pool.getNFTOwner(_winner_nft_address, _winner_nft_token_id);

        UserStakeStructs.BattlePoolUserStakedData memory _winner_nft_data = nft_battle_pool.getUserStakedData(_winner_address, _winner_nft_address, _winner_nft_token_id);
        require(_winner_nft_data.amount > 0, "NFTBattle: winner nft is not staked");
        require(_winner_nft_data.isFrozen == false, "NFTBattle: winner nft is frozen");

        // burn loser's nft
        address _loser_address = nft_battle_pool.getNFTOwner(_loser_nft_address, _loser_nft_token_id);
        nft_battle_pool.burnNFT(_loser_address, _loser_nft_address, _loser_nft_token_id);

        // update matches result data
//        matches[_match_data.matchId] = _match_data;
//        matches[_match_data.matchId].burnedAt = block.timestamp;
//
//        match_ids.push(_match_data.matchId);
//        bytes32 _nft_winner_id = _getNFTId(_winner_nft_address, _winner_nft_token_id);
//        nft_won_matches[_nft_winner_id].push(_match_data.matchId);
//
//        // update nft ko score
//        bytes32 _nft_loser_id = _getNFTId(_loser_nft_address, _loser_nft_token_id);
//        nft_ko_scores[_nft_winner_id] = nft_ko_scores[_nft_loser_id] + 1;

        _updateMatchData(_match_data, _winner_nft_address, _winner_nft_token_id, _loser_nft_address, _loser_nft_token_id);

        emit Determined(_match_data.matchId, _winner_nft_address, _winner_nft_token_id, _loser_nft_address, _loser_nft_token_id, nft_battle_pool.burn_to_address());

        // 由系统执行的时候，需要冻结赢家的NFT
        if (_executor != address(0)) {
            nft_battle_pool.freezeNFT(_winner_address, _winner_nft_address, _winner_nft_token_id, msg.sender);
            return;
        }

        // redeem won nft
        if (_redeem_nft) {
            nft_battle_pool.redeemToOwner(_winner_address, _winner_nft_address, _winner_nft_token_id);
        }

    }

    function _determineIncludeJPG(MatchStructs.MatchData calldata _match_data, DistributionStructs.CreationNFTParams calldata _creation_nft_params, bool _nft_redeem, address _executor) private {
//        require(_match_data.matchId.length > 0, "NFTBattle: match_id is empty");
//        require(_match_data.matchEndTime >= block.timestamp, "NFTBattle: matchEndTime is less than current time");
//        require(_match_data.voteCount >= minimum_vote_amount, "NFTBattle: voteCount is less than minimum_vote_amount");
//        require(_match_data.voteArenaCount != _match_data.voteChallengeCount, "NFTBattle: voteArenaCount is equal to voteChallengeCount");
//        require(_match_data.merkleTreeRoot.length > 0, "NFTBattle: merkleTreeRoot can not be empty");
        _checkMatchData(_match_data);

        _checkExtraSignature(_match_data.merkleTreeRoot, _match_data.extraSignature);

        DistributionStructs.DetermineIncludeJPGVars memory vars;
        bool _arena_win = _match_data.voteArenaCount > _match_data.voteChallengeCount;
        if (_arena_win) {
            if (_match_data.arenaJPGOwner != address(0)) {
                vars.winner_address = _match_data.arenaJPGOwner;
                vars.winner_is_jpg = true;
                vars.winner_jpg = _match_data.arenaJPG;
            } else {
                vars.winner_address = nft_battle_pool.getNFTOwner(_match_data.arenaNFT, _match_data.arenaTokenId);
                vars.winner_nft_address = _match_data.arenaNFT;
                vars.winner_nft_token_id = _match_data.arenaTokenId;
            }

            if (_match_data.challengeJPGOwner != address(0)) {
                vars.loser_is_jpg = true;
                vars.loser_jpg = _match_data.challengeJPG;
            } else {
                vars.loser_address = nft_battle_pool.getNFTOwner(_match_data.challengeNFT, _match_data.challengeTokenId);
                vars.loser_nft_address = _match_data.challengeNFT;
                vars.loser_nft_token_id = _match_data.challengeTokenId;
            }
        } else {
            if (_match_data.challengeJPGOwner != address(0)) {
                vars.winner_address = _match_data.challengeJPGOwner;
                vars.winner_is_jpg = true;
                vars.winner_jpg = _match_data.challengeJPG;
            } else {
                vars.winner_address = nft_battle_pool.getNFTOwner(_match_data.challengeNFT, _match_data.challengeTokenId);
                vars.winner_nft_address = _match_data.challengeNFT;
                vars.winner_nft_token_id = _match_data.challengeTokenId;
            }

            if (_match_data.arenaJPGOwner != address(0)) {
                vars.loser_is_jpg = true;
                vars.loser_jpg = _match_data.arenaJPG;
            } else {
                vars.loser_address = nft_battle_pool.getNFTOwner(_match_data.arenaNFT, _match_data.arenaTokenId);
                vars.loser_nft_address = _match_data.arenaNFT;
                vars.loser_nft_token_id = _match_data.arenaTokenId;
            }
        }

        // deploy creation nft
        if (vars.winner_is_jpg) {
            require(_creation_nft_params.creator != address(0) && bytes(_creation_nft_params.name).length > 0 && bytes(_creation_nft_params.symbol).length > 0 && _creation_nft_params.distribution_policy_address != address(0), "NFTBattle: _creation_nft_params is error");
//            ICreationNFT _nft = _jpgToNFT(_creation_nft_params);
            ICreationNFT _nft = create_nft_contract.jpgToNFT(_creation_nft_params, address(nft_battle_pool), _nft_redeem);
            vars.winner_nft_address = address(_nft);
            vars.winner_nft_token_id = 0;
        }

        if (!vars.loser_is_jpg) {
            nft_battle_pool.burnNFT(vars.loser_address, vars.loser_nft_address, vars.loser_nft_token_id);
        }

        _updateMatchData(_match_data, vars.winner_nft_address, vars.winner_nft_token_id, vars.loser_nft_address, vars.loser_nft_token_id);

        emit DeterminedIncludeJPG(_match_data.matchId, vars.winner_nft_address, vars.winner_nft_token_id, vars.winner_jpg, vars.winner_address, vars.loser_nft_address, vars.loser_nft_token_id, vars.loser_jpg, vars.loser_address, nft_battle_pool.burn_to_address());

        // 由系统执行的时候，需要冻结赢家的NFT
        if (_executor != address(0)) {
            nft_battle_pool.freezeNFT(vars.winner_address, vars.winner_nft_address, vars.winner_nft_token_id, msg.sender);
            return;
        }

        if (_nft_redeem && IERC721(vars.winner_nft_address).ownerOf(vars.winner_nft_token_id) != vars.winner_address) {
            nft_battle_pool.redeemToOwner(vars.winner_address, vars.winner_nft_address, vars.winner_nft_token_id);
        }
    }

    function _checkMatchData(MatchStructs.MatchData calldata _match_data) private view returns (bool) {
        require(_match_data.matchId.length > 0, "NFTBattle: match_id is empty");
        require(_match_data.matchEndTime >= block.timestamp, "NFTBattle: matchEndTime is less than current time");
        require(_match_data.voteCount >= minimum_vote_amount, "NFTBattle: voteCount is less than minimum_vote_amount");
        require(_match_data.voteArenaCount != _match_data.voteChallengeCount, "NFTBattle: voteArenaCount is equal to voteChallengeCount");
        require(_match_data.merkleTreeRoot.length > 0, "NFTBattle: merkleTreeRoot can not be empty");

        (bool _arena_sign, bool _challenge_sign) = _checkArenaAndChallengeSignatures(_match_data);
        require(_arena_sign, "NFTBattle: arenaOwnerSignature is invalid");
        require(_challenge_sign, "NFTBattle: challengeOwnerSignature is invalid");

        return true;
    }

    function _checkExtraSignature(bytes32 _merkle_root, bytes calldata _extra_signature) private view returns (bool) {
//        (address _signer,) = _merkle_root.tryRecover(_extra_signature);
//        return _signer == verifier_address;
        return _merkle_root.recover(_extra_signature) == verifier_address;
    }

    function _updateMatchData(MatchStructs.MatchData calldata _match_data, address _winner_nft_address, uint256 _winner_nft_token_id, address _loser_nft_address, uint256 _loser_nft_token_id) private {

        // update matches result data
        matches[_match_data.matchId] = _match_data;
        matches[_match_data.matchId].burnedAt = block.timestamp;

        // After JPG to NFT, we need to update the new NFT address and tokenId to match_data
        if (_match_data.voteArenaCount > _match_data.voteChallengeCount) {
            if (_match_data.arenaJPGOwner != address(0)) {
                matches[_match_data.matchId].arenaNFT = _winner_nft_address;
                matches[_match_data.matchId].arenaTokenId = _winner_nft_token_id;
            }
        } else {
            if (_match_data.challengeJPGOwner != address(0)) {
                matches[_match_data.matchId].challengeNFT = _winner_nft_address;
                matches[_match_data.matchId].challengeTokenId = _winner_nft_token_id;
            }
        }

        match_ids.push(_match_data.matchId);

        bytes32 _nft_winner_id = _getNFTId(_winner_nft_address, _winner_nft_token_id);
        nft_won_matches[_nft_winner_id].push(_match_data.matchId);

        // update nft ko score
        bytes32 _nft_loser_id = _getNFTId(_loser_nft_address, _loser_nft_token_id);
        nft_ko_scores[_nft_winner_id] = nft_ko_scores[_nft_loser_id] + 1;
    }
}
