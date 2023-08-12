// ##deployed index: 8
// ##deployed at: 2023/08/11 19:06:23
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./dependencies/ERC1155Supply.sol";
import "./dependencies/Ownable.sol";
import "./dependencies/Strings.sol";
import "./interfaces/IMagnifierNFT.sol";

contract MagnifierNFT is IMagnifierNFT, ERC1155Supply, Ownable {

    using Strings for uint256;

    string public override name;
    string public override symbol;

    string token_base_URI;
    uint256[] public all_token_ids;

    constructor(string memory _name, string memory _symbol, string memory _baseURI, uint8 _range, uint96 _pre_mint) ERC1155(''){
        name = _name;
        symbol = _symbol;
        token_base_URI = _baseURI;
        uint256 _tokenId = 0;
        for (uint8 i = 0; i < _range; i++) {
            _mint(msg.sender, _tokenId, _pre_mint, '');
            _addTokenIds(_tokenId);
            _tokenId++;
        }
    }

    function _addTokenIds(uint256 _tokenId) private {
        for (uint256 i = 0; i < all_token_ids.length; i++) {
            if (all_token_ids[i] == _tokenId) {
                return;
            }
        }
        all_token_ids.push(_tokenId);
    }

    function mint(address _to, uint256 _tokenId, uint256 _quantity) external onlyOwner {
        _mint(_to, _tokenId, _quantity, '');

        _addTokenIds(_tokenId);

        emit Minted(_to, _tokenId, _quantity);
    }

    /**
     * @notice 返回baseURI
     */
    function baseURI() external view override returns (string memory) {
        return token_base_URI;
    }

    function uri(uint256 _id) public view virtual override returns (string memory) {
        require(exists(_id), "SggcdNFT: URI query for nonexistent token");
        return bytes(token_base_URI).length > 0 ? string(abi.encodePacked(token_base_URI, _id.toString())) : "";
    }

    function totalSupply() external view override returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < all_token_ids.length; i++) {
            uint256 _sggc_tokenId = all_token_ids[i];
            count += totalSupply(_sggc_tokenId);
        }

        return count;
    }

}
