// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../libraries/MatchStructs.sol";
import "./INFTBattlePool.sol";

interface INFTBattle {
    event SetNFTBattlePool(address new_nft_battle_pool);
    event Determined(bytes32 match_id, address winner_nft, uint256 winner_tokenId, address loser_nft, uint256 loser_tokenId, address burned_to_address);

    function nft_battle_pool() external view returns (INFTBattlePool);

    function setNFTBattlePool(address _nft_battle_pool) external;
    function determine(MatchStructs.MatchData calldata _match_data, bool _redeem_nft) external;
    function determineBySys(MatchStructs.MatchData calldata _match_data) external;

    function hashMatchData(bytes32 _match_id, uint256 _match_start_time, uint256 _match_end_time, address _nft_address, uint256 _token_id) external pure returns (bytes32);
    function checkSign(bytes32 _hash, address _signer, bytes calldata _signature) external pure returns (bool);
    function checkArenaAndChallengeSignatures(MatchStructs.MatchData calldata _match_data) external view returns (bool, bool);
    function getUserNonce(address _user) external view returns (uint256);
    function getMatchData(bytes32 _match_id) external view returns (MatchStructs.MatchData memory);
    function getUserVoteHash(MatchStructs.UserVote calldata _user_vote) external pure returns (bytes32);
    function getNFTWonMatches(address _nft_address, uint256 _nft_tokenId) external view returns (bytes32[] memory);
    function getNFTKOScore(address _nft_address, uint256 _nft_tokenId) external view returns (uint256);
    function getNFTId(address _nft_address, uint256 _nft_tokenId) external pure returns (bytes32);
}
