// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../libraries/MatchStructs.sol";

interface INFTBattlePool {
    event SetNFTBattle(address new_nft_battle_address);
    event Staked(address indexed owner, address nft_address, uint256 tokenId);
    event Redeemed(address indexed to, address nft_address, uint256 tokenId);
    event BurnedNFT(address indexed loser, address nft_address, uint256 tokenId);
    event FrozenNFT(address indexed owner, address nft_address, uint256 tokenId, address beneficiary);
    event UnfrozenNFT(address indexed owner, address nft_address, uint256 tokenId, address beneficiary, uint256 amount);

    function nft_battle_address() external view returns (address);

    function burn_to_address() external view returns (address);

    function setNFTBattle(address _nft_battle_address) external;

    function stake(address _nft_address, MatchStructs.ApprovalData calldata _approve_data) external;

    function stakeFrom(address _owner_address, address _nft_address, uint256 _tokenId) external;

    function redeem(address _nft_address, uint256 _tokenId) external;

    function redeemToOwner(address _owner_address, address _nft_address, uint256 _tokenId) external;

    function burnNFT(address _loser_address, address _nft_address, uint256 _tokenId) external;

    function freezeNFT(address _nft_owner, address _nft_address, uint256 _tokenId, address _beneficiary_address) external ;

    function unfreezeNFT(address _nft_address, uint256 _tokenId, bool _nft_redeem) external payable;

    function getUserStakedData(address _user, address _nft_address, uint256 _tokenId) external view returns (MatchStructs.NFTData memory);

    function getUserAllStatkedData(address _user) external view returns (MatchStructs.NFTData[] memory);

    function getNFTOwner(address _nft_address, uint256 _tokenId) external view returns (address);
}
