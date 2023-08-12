// ##deployed index: 8
// ##deployed at: 2023/08/11 03:07:03
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./libraries/DistributionStructs.sol";
import "./libraries/MatchStructs.sol";
import "./CreationNFT.sol";
import "./interfaces/INFTBattlePool.sol";

contract CreateNFTContract {
    event CreatedNFT(address indexed creator, address indexed nft_address, uint256 indexed tokenId);
    constructor(){

    }

    function jpgToNFT(DistributionStructs.CreationNFTParams calldata _creation_nft_params, address _nft_battle_pool_address, bool nft_redeem) public returns (CreationNFT) {
        CreationNFT _nft = new CreationNFT(_creation_nft_params.name, _creation_nft_params.symbol, _creation_nft_params.baseURI, _creation_nft_params.distribution_role_params, _creation_nft_params.distribution_policy_address);

        uint256 _tokenId = 0;
        if (nft_redeem) {
            _nft.transferOwnership(_creation_nft_params.creator);
            _nft.transferFrom(address(this), _creation_nft_params.creator, _tokenId);
        } else {
            _nft.approve(_nft_battle_pool_address, _tokenId);
            INFTBattlePool(_nft_battle_pool_address).stakeFrom(_creation_nft_params.creator, address(_nft), _tokenId);
        }

        emit CreatedNFT(_creation_nft_params.creator, address(_nft), _tokenId);
        return _nft;
    }
}
