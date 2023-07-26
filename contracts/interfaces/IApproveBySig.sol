// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IApproveBySig {
    function approveBySig(address _owner, address _spender, uint256 _tokenId, uint256 nonce, uint256 _deadline, uint8 _v, bytes32 _r, bytes32 _s) external;
}
