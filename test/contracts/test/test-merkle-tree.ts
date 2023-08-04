import {
    numberToBn,
    recoverAddressFromSignedMessage, recoverAddressFromSignedMessageAndSplit,
    setDefaultGasOptions, signMessageAndSplitByWallet,
    signMessageByWallet
} from "../../../helpers/contract/contract-utils";
import {ContractReceipt, ContractTransaction, ethers, Signature, Wallet} from "ethers";
import {contract_l2_provider_getter} from "../../../helpers/providers/contract_provider_getter";
import {get_admin_wallet} from "../../../helpers/wallets/admin_wallet_getter";
import {TestMerkleTree, TestMerkleTree__factory} from "../../../typechain-types";
import TestMerkleTree_data from "../../../contract-data/TestMerkleTree-data";
import {MatchStructs} from "../../../typechain-types/test/TestMerkleTree";
import {randomAddress, randomHash} from "hardhat/internal/hardhat-network/provider/utils/random";
import {get_user_wallet_5AD8} from "../../../helpers/wallets/user_wallet_getter";
import SggcNFT_data from "../../../contract-data/SggcNFT-data";
import {MerkleTreeService} from "../../../libs/merkle-tree-service";
import UserVoteStruct = MatchStructs.UserVoteStruct;
import {nowTimestamp} from "../../../helpers/utils";
import {expect} from "chai";

let tx: ContractTransaction
let receipt: ContractReceipt
const provider = contract_l2_provider_getter()
const admin_wallet: Wallet = get_admin_wallet(provider)
const user1_wallet: Wallet = get_user_wallet_5AD8(provider)

let test_merkle_tree: TestMerkleTree
before(async function () {
    await setDefaultGasOptions(provider)
    test_merkle_tree = TestMerkleTree__factory.connect(TestMerkleTree_data.address, admin_wallet)
    console.log('test_merkle_tree.address', test_merkle_tree.address)
})

describe("TestSign testing", function () {
    this.timeout(20 * 60 * 1000);

    it('test getUserVoteHash()', async () => {
        const user_vote = get_random_user_vote_data()
        console.log('user_vote', user_vote)

        const encoded_user_vote = MerkleTreeService.generateVotedResultLeaf(user_vote)
        console.log('encoded_user_vote', encoded_user_vote)

        const hash_user_vote = await test_merkle_tree.getUserVoteHash(user_vote)
        console.log('hash_user_vote', hash_user_vote)
        expect(encoded_user_vote).to.equal(hash_user_vote)

        /*const t1 = [
            'bytes',
            'address',
            'address',
            'uint256',
            'bytes'
        ]
        const leaf = [
            user_vote.matchId,
            user_vote.voter,
            user_vote.votedNFT,
            user_vote.votedTokenId,
            user_vote.voteHash
        ]

        const leaf2 = [
            user_vote.matchId,
            user_vote.voter,
            user_vote.votedNFT,
            user_vote.votedTokenId.toString(),
            user_vote.voteHash
        ]

        const pack_user_vote2 = ethers.utils.solidityPack(t1, leaf2)
        console.log('pack_user_vote2', pack_user_vote2)

        const pack_user_vote3 = defaultAbiCoder.encode(t1, leaf)
        console.log('pack_user_vote3', pack_user_vote3)
        expect(pack_user_vote2).to.equal(pack_user_vote3)

        const encode_user_vote2 = keccak256(keccak256(hexToBytes(pack_user_vote2)))
        console.log('encode_user_vote2', encode_user_vote2)
        expect(encoded_user_vote).to.equal(encode_user_vote2)*/
    })

    it('test signed', async () => {
        const user_vote = get_random_user_vote_data()
        const encoded_user_vote = MerkleTreeService.generateVotedResultLeaf(user_vote)
        console.log('encoded_user_vote', encoded_user_vote)

        const signed_user_vote = signMessageByWallet(user1_wallet, encoded_user_vote)
        console.log('signed_user_vote', signed_user_vote)

        const recovered_address = recoverAddressFromSignedMessage(encoded_user_vote, signed_user_vote)
        console.log('recovered_address', recovered_address)
        expect(recovered_address).to.equal(user1_wallet.address)

        const recovered_address2 = await test_merkle_tree.testSignOrder(user_vote, signed_user_vote)
        console.log('recovered_address2', recovered_address2)
        expect(recovered_address2).to.equal(user1_wallet.address)

        const user_vote_signature: Signature = signMessageAndSplitByWallet(user1_wallet, encoded_user_vote)
        console.log('signed_user_vote2', user_vote_signature)
        const recovered_address3 = recoverAddressFromSignedMessageAndSplit(encoded_user_vote, user_vote_signature.r, user_vote_signature.s, user_vote_signature.v)
        expect(recovered_address3).to.equal(user1_wallet.address)

        const recovered_address4 = await test_merkle_tree.testSignOrder2(user_vote, user_vote_signature.v, user_vote_signature.r, user_vote_signature.s)
        console.log('recovered_address4', recovered_address4)
        expect(recovered_address4).to.equal(user1_wallet.address)
    })
})

export const get_random_user_vote_data = (): UserVoteStruct => {
    const matchId = randomHash()
    const voter = user1_wallet.address
    const votedNFT = SggcNFT_data.address
    const votedTokenId = numberToBn(0, 0)
    const voterNonce = numberToBn(123, 0)
    const votedAt = numberToBn(nowTimestamp(),0)
    return {
        matchId: matchId,
        voter: voter,
        votedNFT: votedNFT,
        votedTokenId: votedTokenId,
        votedJPG: '',
        votedJPGOwner: ethers.constants.AddressZero,
        votedAt: votedAt
    }
}