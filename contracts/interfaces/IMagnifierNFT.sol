// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../dependencies/IERC1155.sol";

interface IMagnifierNFT is IERC1155 {
    event Minted(address indexed to, uint256 ssg_token_id, uint256 quantity);

    function name() external view returns(string memory);
    function symbol() external view returns(string memory);
    function baseURI() external view returns (string memory);
    function totalSupply() external view returns (uint256);
}
