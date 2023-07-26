// ##deployed index: 64
// ##deployed at: 2023/07/20 13:47:33
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../dependencies/MerkleProof.sol";
import "../libraries/Utils.sol";
import "../libraries/MatchStructs.sol";
import "../dependencies/ECDSA.sol";

contract TestMerkleTree {

    using ECDSA for bytes32;

    /// @notice 验证merkle tree
    /// @param proof merkle tree proof
    /// @param root merkle tree root
    /// @param leaf merkle tree leaf
    /// @return bool
    function verify(bytes32[] memory proof, bytes32 root, bytes32 leaf) public pure returns (bool) {
        return MerkleProof.verify(proof, root, leaf);
    }

    function verfiyFromStr(bytes32[] memory proof, bytes32 root, string memory leaf) public pure returns (bool) {
        return MerkleProof.verify(proof, root, keccak256(bytes.concat(keccak256(abi.encode(leaf)))));
    }

    function getUserVoteHash(MatchStructs.UserVote calldata _user_vote) public pure returns (bytes32) {
        return keccak256(bytes.concat(keccak256(abi.encode(
            _user_vote.matchId,
            _user_vote.voter,
            _user_vote.votedNFT,
            _user_vote.votedTokenId,
            _user_vote.voterNonce,
            _user_vote.votedAt
        ))));
    }

/*    function verifyOrderMerkleProof(Order calldata order, MerkleTree calldata merkle_tree) public pure returns (bool) {
        bytes32 leaf = getOrderHash(order);
        //        revert(Utils.bytes32ToHexString(leaf));
        return MerkleProof.verify(merkle_tree.proof, merkle_tree.root, leaf);
    }*/

    function getKeccak256(string memory a) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(a));
    }

    function getKeccak2562(string memory a, string memory b) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(a, b));
    }

    function compareBytes32(bytes32 a, bytes32 b) public pure returns (int8) {
        if (a > b) {
            return 1;
        } else if (a < b) {
            return - 1;
        }
        return 0;
    }

    function testSignOrder(MatchStructs.UserVote calldata _user_vote, bytes memory _signature) public pure returns (address) {
        bytes32 userVoteHash = getUserVoteHash(_user_vote);
        return userVoteHash.recover(_signature);
    }

    function testSignOrder2(MatchStructs.UserVote calldata _user_vote, uint8 v, bytes32 r, bytes32 s) public pure returns (address) {
        bytes32 userVoteHash = getUserVoteHash(_user_vote);
        return userVoteHash.recover(v, r, s);
    }

}
