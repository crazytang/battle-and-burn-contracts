// ##deployed index: 2
// ##deployed at: 2023/06/02 14:01:07
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/Structs.sol";

contract TestContract {

    function hashVoteResult(Structs.VoteResult calldata _result) public pure returns (bytes32) {
        return keccak256(bytes.concat(keccak256(abi.encode(_result.matchId, _result.voter, _result.votedNFT, _result.votedTokenId))));
    }
}
