// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/UserStakeStructs.sol";
import "./IAggressiveBid.sol";
import "./INFTBattlePool.sol";

interface IAggressiveBidPool {
    event SetNFTBattlePool(address nft_battle_pool_address);
    event SetAggressiveBid(address aggressive_bid_address);
    event TransferedETHFrom(address indexed from, address indexed to, uint256 amount, address royalty_receiver, uint256 royalty_amount);
    event TransferedNFTFrom(address indexed from, address to, address nft_address, uint256 tokenId, uint256 amount);
    event Withdrawed(address indexed sender, uint256 amount);
    event Deposited(address indexed sender, uint256 amount);
    event RedeemedNFT(address indexed owner_address, address nft_address, uint256 tokenId, uint256 amount);
    event StakedNFT(address indexed sender, address nft_address, uint256 tokenId, uint256 amount);
    event StakedFromNFTBattlePool(address indexed sender, address nft_address, uint256 tokenId, uint256 amount);

    function nft_battle_pool() external view returns (INFTBattlePool);
    function aggressive_bid() external view returns (IAggressiveBid);

    function setNFTBattlePool(address _nft_battle_pool_address) external;
    function setAggressiveBid(address _aggressive_bid_address) external;
    function stakeNFT(address _nft_address, UserStakeStructs.ApprovalData calldata _approve_data) external;
    function stakeFromNFTBattlePool(address _nft_address, uint256 _tokenId) external;
    function redeemNFT(address _nft_address, uint256 _tokenId) external;
    function transferNFTFrom(address _from, address _to, address _nft_address, uint256 _tokenId, uint256 _amount) external;

//    function getUserStakedData(address _user) external view returns (UserStakeStructs.BidPoolUserStakedData memory);
    function getNFTOwner(address _nft_address, uint256 _tokenId) external view returns (address);
    function getUserNFTStakedData(address _user_address, address _nft_address, uint256 _tokenId) external view returns (UserStakeStructs.UserNFTStakedData memory);
    function getUserNFTStakedDataList(address _user_address) external view returns (UserStakeStructs.UserNFTStakedData[] memory);
}
