// import {OrderStruct} from "../typechain-types/YsghMarket";
import {StandardMerkleTree} from "@openzeppelin/merkle-tree";
import {keccak256} from "ethereum-cryptography/keccak";
import {hexToBytes} from "ethereum-cryptography/utils";
import {defaultAbiCoder} from "@ethersproject/abi";
import {Bytes} from "@ethersproject/bytes";
import {MatchStructs} from "../typechain-types/test/TestMerkleTree";
import UserVoteStruct = MatchStructs.UserVoteStruct;

export interface StandardMerkleTreeData<T extends any[]> {
    format: 'standard-v1';
    tree: string[];
    values: {
        value: T;
        treeIndex: number;
    }[];
    leafEncoding: string[];
}

export class MerkleTreeService {

    private last_tree_uri: string = ''
    public tree

    constructor(leaves: any[], encodeTypes: string[]) {
        this.tree = StandardMerkleTree.of(leaves, encodeTypes);
    }

    static load(data: string): MerkleTreeService {
        const d = JSON.parse(data)
        if (d.values === undefined) {
            throw new Error('Invalid data')
        }

        const leaves: string[] = []

        // d.values.reverse()
        for (let i = 0; i < d.values.length; i++) {
            leaves.push(d.values[i].value)
        }

        const types = d.leafEncoding

        return new MerkleTreeService(leaves, types)
    }

    static leavesLoadFromJson(data: string): string[] {
        const d = JSON.parse(data)
        if (d.values === undefined) {
            return []
        }

        const leaves: string[] = []

        // d.values.reverse()
        for (let i = 0; i < d.values.length; i++) {
            leaves.push(d.values[i].value)
        }

        return leaves.length > 0 ? leaves : []
    }

    setLastTreeUri(uri: string): void {
        this.last_tree_uri = uri
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

    render(): string {
        return this.tree.render()
    }

    dump(): any {
        const d:any = {...this.tree.dump()}
        d.last_tree_uri = this.last_tree_uri
        return d
    }

    static generateUserVoteLeafAndEncodeTypes = (user_vote: UserVoteStruct): [any[], string[]] => {
        const leaf = [
            user_vote.matchId,
            user_vote.voter,
            user_vote.votedNFT,
            user_vote.votedTokenId,
            user_vote.votedJPG,
            user_vote.votedJPGOwner,
            user_vote.votedAt
        ]

        const encode_types = [
            'bytes',
            'address',
            'address',
            'uint256',
            'string',
            'address',
            'uint256'
        ]

        return [leaf, encode_types]
    }

    static generateUserVoteLeavesAndEncodeTypes = (user_results: UserVoteStruct[]): [any[], string[]] => {
        const leaves = []
        for (let i = 0; i < user_results.length; i++) {
            const result = user_results[i]
            leaves.push(
                [
                    result.matchId,
                    result.voter,
                    result.votedNFT,
                    result.votedTokenId,
                    result.votedJPG,
                    result.votedJPGOwner,
                    result.votedAt
                ]
            )
        }
        const encode_types = [
            'bytes',
            'address',
            'address',
            'uint256',
            'string',
            'address',
            'uint256'
        ]

        return [leaves, encode_types]
    }

    static generateVotedResultLeaf = (user_result: UserVoteStruct): string => {
        const [leaf, t1] = MerkleTreeService.generateUserVoteLeafAndEncodeTypes(user_result)
        // console.log("leaf", leaf, t1)
        return MerkleTreeService.bytesToHexString(keccak256(keccak256(hexToBytes(defaultAbiCoder.encode(t1, leaf)))))
    }

    static hashUserVote = (user_vote: UserVoteStruct): string => {
        return MerkleTreeService.generateVotedResultLeaf(user_vote)
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
