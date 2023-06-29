// ##deployed index: 3
// ##deployed at: 2023/06/28 17:49:19
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./dependencies/ERC721Enumerable.sol";
import "./dependencies/Ownable.sol";
import "./interfaces/ICreationNFT.sol";

contract CreationNFT is ICreationNFT, ERC721Enumerable, Ownable {

    /// @notice Track the max supply.
    uint256 constant max_supply = 10000;

    /// @notice Track the base URI for token metadata.
    string token_base_URI;

    /// @notice 构造函数
    /// @param _name NFT名称
    /// @param _symbol NFT符号
    /// @param __baseURI baseURI
    constructor(string memory _name, string memory _symbol, string memory __baseURI) ERC721(_name, _symbol){
        token_base_URI = __baseURI;
        _mint(msg.sender, 0);
    }

    /// @notice 铸造
    /// @param _to 接收用户地址
    /// @param _tokenId tokenId
    function mint(address _to, uint256 _tokenId) external override onlyOwner {
        require(_tokenId < maxSupply(), "SggcNFT: tokenId must be less than max supply");
        require(_tokenId == totalSupply(), 'SggcNFT: tokenId is need to equal totalSupply()');

        _mint(_to, _tokenId);
    }

    /**
     * @notice 设定baseURI
     * @dev 该方法只能由owner调用
     * @param _new_base_URI The new base URI.
     */
    function setBaseURI(string calldata _new_base_URI) external override onlyOwner {
        require(keccak256(abi.encodePacked(_new_base_URI)) != keccak256(abi.encodePacked(token_base_URI)),
            'SggcNFT: The new base URI is the same as the current one');

        // Set the new base URI.
        token_base_URI = _new_base_URI;

    }

    /**
     * @notice 返回baseURI
     */
    function baseURI() external view override returns (string memory) {
        return _baseURI();
    }

    /**
     * @notice 返回baseURI
     * @return string baseURI
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return token_base_URI;
    }

    /**
     * @notice 返回最大的供应量
     * @return uint256 max_supply 最大的供应量
     */
    function maxSupply() public pure returns (uint256) {
        return max_supply;
    }
}
