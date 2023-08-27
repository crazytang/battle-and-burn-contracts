// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./INFTBattlePoolV2.sol";
import "../CreateNFTContract.sol";
import "./ICreationNFTV2.sol";
import "../libraries/MatchStructsV2.sol";

interface INFTBattleV2 {
    event SetNFTBattlePool(address new_nft_battle_pool);
    event SetCreationNFTContract(address creation_nft_address);
    event SetVerifierAddress(address new_verifier_address);
    event SetCreateNFTContract(address create_nft_contract);
    event Determined(bytes32 indexed match_id, address winner_nft, uint256 winner_tokenId, address loser_nft, uint256 loser_tokenId, string merkleTreeURI, bytes32 merkleTreeRoot);
    event MatchDataSignatures(bytes arena_owner_signature, bytes challenge_owner_signature, bytes extra_signature);
    event DeterminedIncludeJPG(bytes32 indexed match_id, address winner_nft, uint256 winner_tokenId, string winner_jpg, address loser_nft, uint256 loser_tokenId, string loser_jgp, string merkleTreeURI, bytes32 merkleTreeRoot);

    function nft_battle_pool_v2() external view returns (INFTBattlePoolV2);
    function creation_nft_v2 () external view returns (ICreationNFTV2);
    function verifier_address() external view returns (address);

    function setNFTBattlePool(address _nft_battle_pool) external;
    function setCreationNFT(address _create_nft_contract) external;
    function setVerifierAddress(address _verifier_address) external;
    function determine(MatchStructsV2.MatchDataParam calldata _match_data_param, bool _redeem_nft) external;
    function determineBySys(MatchStructsV2.MatchDataParam calldata _match_data_param) external;
    function determineIncludeJPG(MatchStructsV2.MatchDataParam calldata _match_data_param, bytes32 _token_meta_hash, bool _nft_redeem) external;
    function determineIncludeJPGBySys(MatchStructsV2.MatchDataParam calldata _match_data_param, bytes32 _token_meta_hash) external;

    function hashMatchData(bytes32 _match_id, address _nft_address, uint256 _token_id, string calldata _jpg, address _jpg_owner) external pure returns (bytes32);
    function checkSign(bytes32 _hash, address _signer, bytes calldata _signature) external pure returns (bool);
    function checkArenaAndChallengeSignatures(MatchStructsV2.MatchDataParam calldata _match_data_param) external view returns (bool, bool);
    function getUserNonce(address _user) external view returns (uint256);
    function getMatchData(bytes32 _match_id) external view returns (MatchStructsV2.MatchData memory);
    function getUserVoteHash(MatchStructsV2.UserVote calldata _user_vote) external pure returns (bytes32);
    function getNFTWonMatches(address _nft_address, uint256 _nft_tokenId) external view returns (bytes32[] memory);
    function getNFTKOScore(address _nft_address, uint256 _nft_tokenId) external view returns (uint256);
    function checkUserVote(MatchStructsV2.UserVote calldata _user_vote, bytes calldata _signature) external view returns (bool);
}
