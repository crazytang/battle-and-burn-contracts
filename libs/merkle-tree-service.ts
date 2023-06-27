// import {OrderStruct} from "../typechain-types/YsghMarket";
import {StandardMerkleTree} from "@openzeppelin/merkle-tree";
import {keccak256} from "ethereum-cryptography/keccak";
import {hexToBytes} from "ethereum-cryptography/utils";
import {defaultAbiCoder} from "@ethersproject/abi";
import {Bytes} from "@ethersproject/bytes";
import {Structs} from "../typechain-types/test/Test";
import VoteResultStruct = Structs.VoteResultStruct;

export class MerkleTreeService {

    public tree

    constructor(leaves: any[], encodeTypes: string[]) {
        this.tree = StandardMerkleTree.of(leaves, encodeTypes);
    }

    getRoot(): string {
        return this.tree.root
    }

    getProof(leaf: any): string[] {
        return this.tree.getProof(leaf)
    }

    hashLeaf(leaf: any): string {
        return this.tree.leafHash(leaf)
    }

    verify(leaf: any, proof: string[]): boolean {
        return this.tree.verify(leaf, proof)
    }

    static generateVotedResultLeavesAndEncodeTypes = (vote_results: VoteResultStruct[]): [any[], string[]] => {
        const leaves = []
        for (let i = 0; i < vote_results.length; i++) {
            const result = vote_results[i]
            leaves.push(
                [
                    result.matchId,
                    result.voter,
                    result.votedNFT,
                    result.votedTokenId
                ]
            )
        }
        const encode_types = [
            'bytes32',
            'address',
            'address',
            'uint256'
        ]

        return [leaves, encode_types]
    }

    static generateVotedResultLeaf = (vote_results: VoteResultStruct): string => {
        const [leaf_hash, t1] = MerkleTreeService.generateVotedResultLeavesAndEncodeTypes([vote_results])
        return MerkleTreeService.bytesToHexString(keccak256(keccak256(hexToBytes(defaultAbiCoder.encode(t1, leaf_hash)))))

    }
    /*static generateOrderLeaf = (order: OrderStruct): string => {
        const [leaf_hash, t1] = MerkleTreeService.generateOrderLeafAndEncodeTypes(order)
        return MerkleTreeService.bytesToHexString(keccak256(keccak256(hexToBytes(defaultAbiCoder.encode(t1, leaf_hash)))))

    }*/

    private static bytesToHexString(uint8a: Bytes): string {
        // pre-caching improves the speed 6x
        if (!(uint8a instanceof Uint8Array)) throw new Error('Uint8Array expected')
        let hex = ''
        for (let i = 0; i < uint8a.length; i++) {
            hex += MerkleTreeService.hexes[uint8a[i]]
        }
        return '0x' + hex
    }

    private static hexes = Array.from({length: 256}, (v, i) => i.toString(16).padStart(2, '0'))
}
