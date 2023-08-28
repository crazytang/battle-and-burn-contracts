import {Contract, ContractReceipt, ContractTransaction, ethers, Wallet} from "ethers";
import {contract_l2_provider_getter} from "../../helpers/providers/contract_provider_getter";
import {get_admin_wallet} from "../../helpers/wallets/admin_wallet_getter";
import {
    get_user_wallet_114a,
    get_user_wallet_5712, get_user_wallet_5AD8, get_user_wallet_90e2, get_user_wallet_d05a,
    get_user_wallet_e265
} from "../../helpers/wallets/user_wallet_getter";
import {
    AggressiveBidDistribution,
    AggressiveBidDistribution__factory,
    AggressiveBidPool__factory,
    AggressiveBidPoolV2, AggressiveBidPoolV2__factory,
    CreationNFTV2, CreationNFTV2__factory,
    NFTBattlePool__factory, NFTBattlePoolV2__factory
} from "../../typechain-types";
import {
    amount_equal_in_precision, bnToNoPrecisionNumber, bnToNumber, getGasUsedAndGasPriceFromReceipt,
    getGasUsedFromReceipt,
    getTransactionOptions,
    numberToBn,
    setDefaultGasOptions,
    signMessageAndSplitByWallet, signMessageByWallet,
    solidityAbiEncode, solidityAbiEncodePacked
} from "../../helpers/contract/contract-utils";
import AggressiveBidDistribution_data from "../../contract-data/AggressiveBidDistribution-data";
import {expect} from "chai";
import AggressiveBid_data from "../../contract-data/AggressiveBid-data";
import {keccak256} from "@ethersproject/keccak256";
import {nowTimestamp} from "../../helpers/utils";
import {solidityKeccak256} from "ethers/lib/utils";
import {
    ApprovalData,
    BidPoolUserStakedData,
    fetchToBidPoolUserStakedData, fetchToUserNFTStakedData,
    fetchToUserNFTStakedDataList, UserNFTStakedData
} from "../../helpers/contract/structs";
import DistributionPolicyV1_data from "../../contract-data/DistributionPolicyV1-data";
import AggressiveBidPoolV2_data from "../../contract-data/AggressiveBidPoolV2-data";
import CreationNFTV2_data from "../../contract-data/CreationNFTV2-data";
import NFTBattlePoolV2_data from "../../contract-data/NFTBattlePoolV2-data";
import {mintACreationNFT} from "../../helpers/mock-functions";
import {UserStakeStructsV2} from "../../typechain-types/AggressiveBidPoolV2";
import ApprovalDataStruct = UserStakeStructsV2.ApprovalDataStruct;

let tx: ContractTransaction
let receipt: ContractReceipt
const provider = contract_l2_provider_getter()
const admin_wallet: Wallet = get_admin_wallet(provider)
const user1_wallet: Wallet = get_user_wallet_5712(provider)
const user2_wallet: Wallet = get_user_wallet_e265(provider)
const user3_wallet: Wallet = get_user_wallet_114a(provider)
const user4_wallet: Wallet = get_user_wallet_5AD8(provider)
const user5_wallet: Wallet = get_user_wallet_90e2(provider)
const user6_wallet: Wallet = get_user_wallet_d05a(provider)

let aggressive_bid_pool_v2: AggressiveBidPoolV2
let creation_nft_v2: CreationNFTV2
before(async function () {
    await setDefaultGasOptions(provider)
    aggressive_bid_pool_v2 = AggressiveBidPoolV2__factory.connect(AggressiveBidPoolV2_data.address, admin_wallet)
    console.log('aggressive_bid_pool_v2.address', aggressive_bid_pool_v2.address)

    creation_nft_v2 = CreationNFTV2__factory.connect(CreationNFTV2_data.address, admin_wallet)
    console.log('creation_nft_v2.address', creation_nft_v2.address)
})
describe("Creation NFT testing", function () {
    this.timeout(20 * 60 * 1000);

    it('base test', async () => {
        const nft_battle_pool_address = await aggressive_bid_pool_v2.nft_battle_pool_v2()
        console.log('nft_battle_pool_address', nft_battle_pool_address)
        expect(nft_battle_pool_address).equal(NFTBattlePoolV2_data.address)

        const aggressive_bid_address = await aggressive_bid_pool_v2.aggressive_bid()
        console.log('aggressive_bid_address', aggressive_bid_address)
        expect(aggressive_bid_address).equal(AggressiveBid_data.address)
    })

    it('test stakeNFT() and redeemNFT()', async () => {
        const spender = aggressive_bid_pool_v2.address
        const user1_nft_token_id = await mintACreationNFT(user1_wallet)
        const deadline = nowTimestamp() + 60*3
        const method_name_hash = solidityKeccak256(['string'], ['Permit(address owner,address spender,uint256 tokenId,uint256 nonce,uint256 deadline)'])

        const user1_nft_owner = user1_wallet.address
        const nonce = bnToNoPrecisionNumber(await creation_nft_v2.nonces(user1_nft_owner))

        const user1_hash = keccak256(solidityAbiEncode(['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'], [method_name_hash, user1_nft_owner, spender, user1_nft_token_id, nonce, deadline]))
        const user1_signature = signMessageAndSplitByWallet(user1_wallet, user1_hash)
        let r = user1_signature.r
        let v = user1_signature.v
        let s = user1_signature.s

        const user1_approval_data: ApprovalData = {
            userAddress: user1_nft_owner,
            spender: spender,
            tokenId: user1_nft_token_id,
            nonce: nonce,
            deadline: deadline,
            r: r,
            s: s,
            v: v
        }

        const user1_staked_before = await aggressive_bid_pool_v2.isStakedNFT(user1_wallet.address, creation_nft_v2.address, user1_nft_token_id)
        console.log('user1_staked_before', user1_staked_before)
        expect(user1_staked_before).be.false

        const user1_aggressive_bid_pool = AggressiveBidPoolV2__factory.connect(AggressiveBidPoolV2_data.address, user1_wallet)
        // 质押NFT
        tx = await user1_aggressive_bid_pool.stakeNFT(creation_nft_v2.address, user1_approval_data, getTransactionOptions())
        console.log('user1_aggressive_bid_pool.stakeNFT() tx.hash', tx.hash)
        receipt = await tx.wait()
        console.log('user1_aggressive_bid_pool.stakeNFT() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

        const user1_nft_new_owner = await creation_nft_v2.ownerOf(user1_nft_token_id)
        console.log('user1_nft_new_owner', user1_nft_new_owner)
        expect(user1_nft_new_owner).equal(aggressive_bid_pool_v2.address)

        const user1_staked_after = await aggressive_bid_pool_v2.isStakedNFT(user1_wallet.address, creation_nft_v2.address, user1_nft_token_id)
        console.log('user1_staked_after', user1_staked_after)
        expect(user1_staked_after).be.true

        // 赎回NFT
        tx = await user1_aggressive_bid_pool.redeemNFT(creation_nft_v2.address, user1_nft_token_id, getTransactionOptions())
        console.log('aggressive_bid_pool_v2.redeemNFT() tx.hash', tx.hash)
        receipt = await tx.wait()
        console.log('aggressive_bid_pool_v2.redeemNFT() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

        const user1_nft_new_owner2 = await creation_nft_v2.ownerOf(user1_nft_token_id)
        console.log('user1_nft_new_owner2', user1_nft_new_owner2)
        expect(user1_nft_new_owner2).equal(user1_nft_owner)

        const user1_staked_after2 = await aggressive_bid_pool_v2.isStakedNFT(user1_wallet.address, creation_nft_v2.address, user1_nft_token_id)
        console.log('user1_staked_after2', user1_staked_after2)
        expect(user1_staked_after2).be.false
    })

    it('test stakeFromNFTBattlePool()', async () => {
        const spender = aggressive_bid_pool_v2.address
        const user1_nft_token_id = await mintACreationNFT(user1_wallet)
        const deadline = nowTimestamp() + 60*3
        const method_name_hash = solidityKeccak256(['string'], ['Permit(address owner,address spender,uint256 tokenId,uint256 nonce,uint256 deadline)'])

        const user1_nft_battle_pool = NFTBattlePoolV2__factory.connect(NFTBattlePoolV2_data.address, user1_wallet)

        const user1_creation_nft_v2 = CreationNFTV2__factory.connect(CreationNFTV2_data.address, user1_wallet)
        tx = await user1_creation_nft_v2.approve(user1_nft_battle_pool.address, user1_nft_token_id, getTransactionOptions())
        console.log('creation_nft_v2.approve() tx.hash', tx.hash)
        receipt = await tx.wait()

        // 质押NFTbattle pool
        tx = await user1_nft_battle_pool.stakeFrom(user1_wallet.address, creation_nft_v2.address, user1_nft_token_id, getTransactionOptions())
        console.log('user1_nft_battle_pool.stakeFrom() tx.hash', tx.hash)
        receipt = await tx.wait()
        console.log('user1_nft_battle_pool.stakeFrom() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

        const user1_nft_new_owner = await creation_nft_v2.ownerOf(user1_nft_token_id)
        console.log('user1_nft_new_owner', user1_nft_new_owner)
        expect(user1_nft_new_owner).equal(user1_nft_battle_pool.address)

        const user1_nft_owner_in_battle_pool = await user1_nft_battle_pool.getNFTOwner(creation_nft_v2.address, user1_nft_token_id)
        console.log('user1_nft_owner_in_battle_pool', user1_nft_owner_in_battle_pool)
        expect(user1_nft_owner_in_battle_pool).equal(user1_wallet.address)

        // 从battle pool质押NFT
        const user1_aggressive_bid_pool = AggressiveBidPoolV2__factory.connect(AggressiveBidPoolV2_data.address, user1_wallet)
        const nft_battle_pool_v2 = await user1_aggressive_bid_pool.nft_battle_pool_v2()
        console.log('nft_battle_pool_v2', nft_battle_pool_v2)
        expect(nft_battle_pool_v2).equal(user1_nft_battle_pool.address)

        const user1_staked_before = await aggressive_bid_pool_v2.isStakedNFT(user1_wallet.address, creation_nft_v2.address, user1_nft_token_id)
        console.log('user1_staked_before', user1_staked_before)
        expect(user1_staked_before).be.false

        tx = await user1_aggressive_bid_pool.stakeFromNFTBattlePool(creation_nft_v2.address, user1_nft_token_id, getTransactionOptions())
        console.log('user1_aggressive_bid_pool.stakeFromNFTBattlePool() tx.hash', tx.hash)
        receipt = await tx.wait()
        console.log('user1_aggressive_bid_pool.stakeFromNFTBattlePool() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

        const user1_nft_new_owner2 = await creation_nft_v2.ownerOf(user1_nft_token_id)
        console.log('user1_nft_new_owner2', user1_nft_new_owner2)
        expect(user1_nft_new_owner2).equal(user1_aggressive_bid_pool.address)

        const user1_nft_owner_in_aggressive_bid_pool = await user1_aggressive_bid_pool.getNFTOwner(creation_nft_v2.address, user1_nft_token_id)
        console.log('user1_nft_owner_in_aggressive_bid_pool', user1_nft_owner_in_aggressive_bid_pool)
        expect(user1_nft_owner_in_aggressive_bid_pool).equal(user1_wallet.address)

        const user1_staked_after = await aggressive_bid_pool_v2.isStakedNFT(user1_wallet.address, creation_nft_v2.address, user1_nft_token_id)
        console.log('user1_staked_after', user1_staked_after)
        expect(user1_staked_after).be.true

    })
})
