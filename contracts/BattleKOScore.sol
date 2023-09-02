// ##deployed index: 2
// ##deployed at: 2023/09/02 10:19:41
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./dependencies/Initializable.sol";
import "./dependencies/OwnableUpgradeable.sol";
import "./interfaces/IBattleKOScore.sol";
import "./interfaces/INFTBattleV2.sol";

contract BattleKOScore is IBattleKOScore, Initializable, OwnableUpgradeable {

    INFTBattleV2 public override nft_battle_v2;

    // NFT address => (tokenId => ko score)
    mapping(address => mapping(uint256 => uint256)) private nft_ko_scores;

    modifier onlyNFTBattle() {
        require(msg.sender == address(nft_battle_v2), "BattleKO: caller is not the NFTBattleV2 contract");
        _;
    }

    /// @notice This method is called by the proxy contract to initialize the contract.
    function initialize(address _nft_battle_v2_address) public initializer {
        __Ownable_init();

        require(Address.isContract(_nft_battle_v2_address), "BattleKO: NFTBattleV2 address is not a contract");
        nft_battle_v2 = INFTBattleV2(_nft_battle_v2_address);
    }

    function setNFTBattle(address _nft_battle_v2_address) external override onlyOwner {
        require(Address.isContract(_nft_battle_v2_address), "BattleKO: NFTBattleV2 address is not a contract");
        nft_battle_v2 = INFTBattleV2(_nft_battle_v2_address);
        emit SetNFTBattle(_nft_battle_v2_address);
    }

    function updateBattleKOScore(address _nft_address, uint256 _tokenId, uint256 _score) external onlyNFTBattle {
        nft_ko_scores[_nft_address][_tokenId] = _score;
        emit UpdatedBattleKOScore(_nft_address, _tokenId, _score);
    }

    function getKOScore(address _nft_address, uint256 _tokenId) external view override returns (uint256) {
        return nft_ko_scores[_nft_address][_tokenId];
    }
}
