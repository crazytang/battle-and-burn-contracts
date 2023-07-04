// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICreationNFT {

    function mint(address _to, uint256 _tokenId) external;

//    function setRoyalty(address _to, uint96 _fee) external;

//    function setBaseURI(string calldata tokenURI) external;

    function baseURI() external view returns (string memory);

    function maxSupply() external view returns (uint256);
}
