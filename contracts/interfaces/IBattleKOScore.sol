// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./INFTBattleV2.sol";

interface IBattleKOScore {
    event SetNFTBattle(address nft_battle_v2_address);
    event UpdatedBattleKOScore(address nft_address, uint256 tokenId, uint256 score);

    function nft_battle_v2() external view returns (INFTBattleV2);

    function setNFTBattle(address _nft_battle_v2_address) external;
    function updateBattleKOScore(address _nft_address, uint256 _tokenId, uint256 _score) external;
    function getKOScore(address _nft_address, uint256 _tokenId) external view returns (uint256);
}
