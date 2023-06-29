// ##deployed index: 6
// ##deployed at: 2023/06/29 10:36:20
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/Structs.sol";
import "../CreationNFT.sol";

contract TestContract {

    event CreatedContract(address indexed contract_address, address indexed owner, string name, string symbol, string baseURI);
    function hashVoteResult(Structs.VoteResult calldata _result) public pure returns (bytes32) {
        return keccak256(bytes.concat(keccak256(abi.encode(_result.matchId, _result.voter, _result.votedNFT, _result.votedTokenId))));
    }

    function createContract() public {
        CreationNFT createNFT = new CreationNFT("test name", "testSymbol", "ipfs://xxxx");
        createNFT.transferFrom(address(this), msg.sender, 0);
        createNFT.transferOwnership(msg.sender);
        emit CreatedContract(address(createNFT), createNFT.owner(), createNFT.name(), createNFT.symbol(), createNFT.baseURI());
    }
}
