// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/UserStakeStructsV2.sol";
import "./IAggressiveBid.sol";
import "./INFTBattlePoolV2.sol";

interface IAggressiveBidPoolV2 {
    event SetNFTBattlePool(address nft_battle_pool_address);
    event SetAggressiveBid(address aggressive_bid_address);
    event TransferedETHFrom(address indexed from, address indexed to, uint256 amount, address royalty_receiver, uint256 royalty_amount);
    event TransferedNFTFrom(address indexed from, address to, address nft_address, uint256 tokenId, uint256 amount);
    event Withdrawed(address indexed sender, uint256 amount);
    event Deposited(address indexed sender, uint256 amount);
    event RedeemedNFT(address indexed owner_address, address nft_address, uint256 tokenId, uint256 amount);
    event StakedNFT(address indexed sender, address nft_address, uint256 tokenId, uint256 amount);
    event StakedFromNFTBattlePool(address indexed sender, address nft_address, uint256 tokenId, uint256 amount);

    function nft_battle_pool_v2() external view returns (INFTBattlePoolV2);
    function aggressive_bid() external view returns (IAggressiveBid);

    function setNFTBattlePool(address _nft_battle_pool_address) external;
    function setAggressiveBid(address _aggressive_bid_address) external;
    function stakeNFT(address _nft_address, UserStakeStructsV2.ApprovalData calldata _approve_data) external;
    function stakeFromNFTBattlePool(address _nft_address, uint256 _tokenId) external;
    function redeemNFT(address _nft_address, uint256 _tokenId) external;
    function transferNFTFrom(address _from, address _to, address _nft_address, uint256 _tokenId, uint256 _amount) external;
    function isStakedNFT(address _user_address, address _nft_address, uint256 _tokenId) external view  returns (bool);
    function getNFTOwner(address _nft_address, uint256 _tokenId) external view returns (address);
}
