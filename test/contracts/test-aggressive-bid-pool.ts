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
    AggressiveBidPool,
    AggressiveBidPool__factory, CreationNFT, CreationNFT__factory
} from "../../typechain-types";
import {
    amount_equal_in_precision, bnToNumber,
    getGasUsedFromReceipt,
    getTransactionOptions,
    numberToBn,
    setDefaultGasOptions,
    signMessageAndSplitByWallet, signMessageByWallet,
    solidityAbiEncode, solidityAbiEncodePacked
} from "../../helpers/contract/contract-utils";
import AggressiveBidDistribution_data from "../../contract-data/AggressiveBidDistribution-data";
import AggressiveBidPool_data from "../../contract-data/AggressiveBidPool-data";
import {expect} from "chai";
import NFTBattlePool_data from "../../contract-data/NFTBattlePool-data";
import AggressiveBid_data from "../../contract-data/AggressiveBid-data";
import {keccak256} from "@ethersproject/keccak256";
import CreationNFT_data from "../../contract-data/CreationNFT-data";
import {nowTimestamp} from "../../helpers/utils";
import {solidityKeccak256} from "ethers/lib/utils";
import {UserStakeStructs} from "../../typechain-types/NFTBattlePool";
import ApprovalDataStruct = UserStakeStructs.ApprovalDataStruct;
import {
    BidPoolUserStakedData,
    fetchToBidPoolUserStakedData, fetchToUserNFTStakedData,
    fetchToUserNFTStakedDataList, UserNFTStakedData
} from "../../helpers/contract/structs";
import DistributionPolicyV1_data from "../../contract-data/DistributionPolicyV1-data";
import {DistributionStructs} from "../../typechain-types/CreationNFT";
import DistributionRoleParamsStruct = DistributionStructs.DistributionRoleParamsStruct;
import {deployCreationNFT} from "../../helpers/mock-functions";

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

let aggressive_bid_pool: AggressiveBidPool
let creation_nft: CreationNFT

before(async function () {
    await setDefaultGasOptions(provider)
    aggressive_bid_pool = AggressiveBidPool__factory.connect(AggressiveBidPool_data.address, admin_wallet)
    console.log('aggressive_bid_pool.address', aggressive_bid_pool.address)

    creation_nft = CreationNFT__factory.connect(CreationNFT_data.address, admin_wallet)
    console.log('creation_nft.address', creation_nft.address)
})
describe("Creation NFT testing", function () {
    this.timeout(20 * 60 * 1000);

    it('base test', async () => {

        // const signed = signMessageByWallet(new Wallet('0xe62248374af86aa480f9cebd44f04cd02b915130d4fbda885a201488257b0a17', provider), keccak256(solidityAbiEncodePacked(['string'], ['Hello World!'])))
        // console.log('fssdfsd', keccak256(solidityAbiEncodePacked(['string'], ['Hello World!'])))
        // console.log('signed', signed)
        // return

        const nft_battle_pool_address = await aggressive_bid_pool.nft_battle_pool()
        console.log('nft_battle_pool_address', nft_battle_pool_address)
        expect(nft_battle_pool_address).equal(NFTBattlePool_data.address)

        const aggressive_bid_address = await aggressive_bid_pool.aggressive_bid()
        console.log('aggressive_bid_address', aggressive_bid_address)
        expect(aggressive_bid_address).equal(AggressiveBid_data.address)
    })

    it('test stakeNFT() and redeemNFT()', async () => {
        const spender = aggressive_bid_pool.address
        const user1_nft_token_id = 0
        const deadline = nowTimestamp() + 60*3
        const method_name_hash = solidityKeccak256(['string'], ['Permit(address owner,address spender,uint256 tokenId,uint256 nonce,uint256 deadline)'])

        const user1_nft = await deployCreationNFT(user1_wallet, 'user1_nft', 'user1_nft', 'ipfs://', {
            original_element_creator: ethers.constants.AddressZero,
            element_creators: [],
            element_quote_element_creators: []
        });
        console.log('user1_nft.address', user1_nft.address)

        const user1_nft_owner = user1_wallet.address
        const nonce = await creation_nft.nonces(user1_nft_owner)

        const user1_hash = keccak256(solidityAbiEncode(['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'], [method_name_hash, user1_nft_owner, spender, user1_nft_token_id, nonce, deadline]))
        const user1_signature = signMessageAndSplitByWallet(user1_wallet, user1_hash)
        let r = user1_signature.r
        let v = user1_signature.v
        let s = user1_signature.s

        const user1_approval_data: ApprovalDataStruct = {
            userAddress: user1_nft_owner,
            spender: spender,
            tokenId: numberToBn(user1_nft_token_id, 0),
            nonce: nonce,
            deadline: numberToBn(deadline, 0),
            r: r,
            s: s,
            v: v
        }

        const user1_staked_data_list_before:UserNFTStakedData[] = fetchToUserNFTStakedDataList(await aggressive_bid_pool.getUserNFTStakedDataList(user1_wallet.address))
        console.log('user1_staked_data_list_before', user1_staked_data_list_before)

        const user1_aggressive_bid_pool = AggressiveBidPool__factory.connect(AggressiveBidPool_data.address, user1_wallet)
        // 质押NFT
        tx = await user1_aggressive_bid_pool.stakeNFT(user1_nft.address, user1_approval_data, getTransactionOptions())
        console.log('user1_aggressive_bid_pool.stakeNFT() tx.hash', tx.hash)
        receipt = await tx.wait()

        const user1_nft_new_owner = await user1_nft.ownerOf(user1_nft_token_id)
        console.log('user1_nft_new_owner', user1_nft_new_owner)
        expect(user1_nft_new_owner).equal(aggressive_bid_pool.address)

        const user1_staked_data_list_after:UserNFTStakedData[] = fetchToUserNFTStakedDataList(await aggressive_bid_pool.getUserNFTStakedDataList(user1_wallet.address))
        console.log('user1_staked_data_list_after', user1_staked_data_list_after)
        expect(user1_staked_data_list_after.length).equal(user1_staked_data_list_before.length + 1)
        expect(user1_staked_data_list_after[user1_staked_data_list_after.length-1].nftAddress).equal(user1_nft.address)
        expect(user1_staked_data_list_after[user1_staked_data_list_after.length-1].tokenId).equal(user1_nft_token_id)
        expect(user1_staked_data_list_after[user1_staked_data_list_after.length-1].amount).equal(1)

        // 赎回NFT
        tx = await user1_aggressive_bid_pool.redeemNFT(user1_nft.address, user1_nft_token_id, getTransactionOptions())
        console.log('aggressive_bid_pool.redeemNFT() tx.hash', tx.hash)
        receipt = await tx.wait()

        const user1_nft_new_owner2 = await user1_nft.ownerOf(user1_nft_token_id)
        console.log('user1_nft_new_owner2', user1_nft_new_owner2)
        expect(user1_nft_new_owner2).equal(user1_nft_owner)

        const user1_staked_data_list_after2:UserNFTStakedData[] = fetchToUserNFTStakedDataList(await aggressive_bid_pool.getUserNFTStakedDataList(user1_wallet.address))
        console.log('user1_staked_data_list_after2', user1_staked_data_list_after2)
        expect(user1_staked_data_list_after2.length).equal(user1_staked_data_list_after.length -1)
    })
})
