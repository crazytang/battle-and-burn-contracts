import { ContractReceipt, ContractTransaction, ethers, Wallet} from "ethers";
import {contract_l2_provider_getter} from "../../helpers/providers/contract_provider_getter";
import {get_admin_wallet} from "../../helpers/wallets/admin_wallet_getter";
import {
    get_user_wallet_5712,
    get_user_wallet_e265,
    get_user_wallet_114a,
    get_user_wallet_5AD8
} from "../../helpers/wallets/user_wallet_getter";
import {
    amount_equal_in_precision,
    bnToNoPrecisionNumber,
    bnToNumber, getGasUsedAndGasPriceFromReceipt,
    getTransactionOptions,
    numberToBn,
    setDefaultGasOptions, signMessageAndSplitByWallet, signMessageByWallet, solidityAbiEncode
} from "../../helpers/contract/contract-utils";
import {expect} from "chai";
import {
    makeInputData,
    makeInputDataFromOrdersWithMerkleTree,
    makeNewOrder, mintACreationNFT
} from "../../helpers/mock-functions";
import {
    AggressiveBidV2,
    AggressiveBidV2__factory,
    AggressiveBidDistribution,
    AggressiveBidDistribution__factory,
    AggressiveBidPoolV2,
    AggressiveBidPoolV2__factory,
    IYsghPool,
    IYsghPool__factory,
    CreationNFTV2,
    CreationNFTV2__factory
} from "../../typechain-types";
import AggressiveBidPoolV2_data from "../../contract-data/AggressiveBidPoolV2-data";
import AggressiveBidV2_data from "../../contract-data/AggressiveBidV2-data";
import AggressiveBidDistribution_data from "../../contract-data/AggressiveBidDistribution-data";
import {UserStakeStructs} from "../../typechain-types/NFTBattlePool";
import ApprovalDataStruct = UserStakeStructs.ApprovalDataStruct;
import {nowTimestamp} from "../../helpers/utils";
import {keccak256} from "@ethersproject/keccak256";
import {solidityKeccak256} from "ethers/lib/utils";
import {
    AssetType,
    InputData,
    OrderSide,
    OrderType
} from "../../helpers/contract/structs";
import YsghPool_data from "../../contract-data/YsghPool-data";
import CreationNFTV2_data from "../../contract-data/CreationNFTV2-data";


let tx: ContractTransaction
let receipt: ContractReceipt
const provider = contract_l2_provider_getter()
const admin_wallet: Wallet = get_admin_wallet(provider)
const user0_wallet: Wallet = admin_wallet
const user1_wallet: Wallet = get_user_wallet_5712(provider)
const user2_wallet: Wallet = get_user_wallet_e265(provider)
const user3_wallet: Wallet = get_user_wallet_114a(provider)

let aggressive_bid_v2: AggressiveBidV2
let aggressive_bid_pool_v2: AggressiveBidPoolV2
let aggressive_bid_distribution: AggressiveBidDistribution
let ysgh_pool: IYsghPool
let creation_nft_v2: CreationNFTV2

before(async function () {
    await setDefaultGasOptions(provider)

    aggressive_bid_v2 = AggressiveBidV2__factory.connect(AggressiveBidV2_data.address, admin_wallet)
    console.log('aggressive_bid_v2.address', aggressive_bid_v2.address)

    aggressive_bid_pool_v2 = AggressiveBidPoolV2__factory.connect(AggressiveBidPoolV2_data.address, admin_wallet)
    console.log('aggressive_bid_pool_v2.address', aggressive_bid_pool_v2.address)

    aggressive_bid_distribution = AggressiveBidDistribution__factory.connect(AggressiveBidDistribution_data.address, admin_wallet)
    console.log('aggressive_bid_distribution.address', aggressive_bid_distribution.address)

    ysgh_pool = IYsghPool__factory.connect(YsghPool_data.address, admin_wallet)
    console.log('ysgh_pool.address', ysgh_pool.address)

    creation_nft_v2 = CreationNFTV2__factory.connect(CreationNFTV2_data.address, admin_wallet)
    console.log('creation_nft_v2.address', creation_nft_v2.address)
})

describe("Ysgh Market testing", function () {
    this.timeout(20 * 60 * 1000);

    it('base test', async () => {
        const verifier_address = await aggressive_bid_v2.verifier_address()
        console.log('verifier_address', verifier_address)
        expect(verifier_address).equal(admin_wallet.address)

        const aggressive_bid_pool_address = await aggressive_bid_v2.aggressive_bid_pool_v2()
        console.log('aggressive_bid_pool_address', aggressive_bid_pool_address)
        expect(aggressive_bid_pool_address).equal(AggressiveBidPoolV2_data.address)

        const aggressive_bid_distribution_address = await aggressive_bid_v2.aggressive_bid_distribution()
        console.log('aggressive_bid_distribution_address', aggressive_bid_distribution_address)
        expect(aggressive_bid_distribution_address).equal(AggressiveBidDistribution_data.address)

        const ysgh_pool_address = await aggressive_bid_v2.ysgh_pool()
        console.log('ysgh_pool_address', ysgh_pool_address)
        expect(ysgh_pool_address).equal(YsghPool_data.address)
    })


    it('test ERC721 execute() with fixed price', async () => {
        const sell_token_id = await mintACreationNFT(user1_wallet)
        console.log('sell_token_id', sell_token_id)

        const sell_token_amount = 1

        // 1) 先将NFT授权和质押给合约

        const method_name_hash = solidityKeccak256(['string'], ['Permit(address owner,address spender,uint256 tokenId,uint256 nonce,uint256 deadline)'])

        const user1_nft_owner_before = user1_wallet.address
        const spender = aggressive_bid_pool_v2.address
        const user1_nft_token_id = sell_token_id
        const nonce = await creation_nft_v2.nonces(user1_wallet.address)
        const deadline = nowTimestamp() + 60;

        const user1_hash = keccak256(solidityAbiEncode(['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'], [method_name_hash, user1_nft_owner_before, spender, user1_nft_token_id, nonce, deadline]))
        const user1_signature = signMessageAndSplitByWallet(user1_wallet, user1_hash)
        let r = user1_signature.r
        let v = user1_signature.v
        let s = user1_signature.s

        const user1_approval_data: ApprovalDataStruct = {
            userAddress: user1_nft_owner_before,
            spender: spender,
            tokenId: numberToBn(user1_nft_token_id, 0),
            nonce: nonce,
            deadline: numberToBn(deadline, 0),
            r: r,
            s: s,
            v: v
        }

        const user1_aggressive_bid_pool = AggressiveBidPoolV2__factory.connect(AggressiveBidPoolV2_data.address, user1_wallet)
        tx = await user1_aggressive_bid_pool.stakeNFT(creation_nft_v2.address, user1_approval_data, getTransactionOptions())
        console.log('user1_aggressive_bid_pool.stakeNFT() tx hash', tx.hash)
        receipt = await tx.wait()
        console.log('user1_aggressive_bid_pool.stakeNFT() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

        const user1_staked_before = await user1_aggressive_bid_pool.isStakedNFT(user1_wallet.address, creation_nft_v2.address, user1_nft_token_id)
        console.log('user1_staked_before', user1_staked_before)
        expect(user1_staked_before).be.true
        
        const user2_staked_before = await user1_aggressive_bid_pool.isStakedNFT(user2_wallet.address, creation_nft_v2.address, user1_nft_token_id)
        console.log('user2_staked_before', user2_staked_before)
        expect(user2_staked_before).be.false

        const user1_nft_owner_in_aggressive_bid_pool_before = await user1_aggressive_bid_pool.getNFTOwner(creation_nft_v2.address, user1_nft_token_id)
        console.log('user1_nft_owner_in_aggressive_bid_pool_before', user1_nft_owner_in_aggressive_bid_pool_before)
        expect(user1_nft_owner_in_aggressive_bid_pool_before).equal(user1_nft_owner_before)

        // 2) user2存入eth
        const user2_eth_balance = bnToNumber(await user2_wallet.getBalance())
        console.log('user2_eth_balance', user2_eth_balance)

        if (user2_eth_balance < 1) {
            console.log('send eht to user2')
            const send_eht_amount = 10
            console.log('send_eht_amount', send_eht_amount)
            tx = await admin_wallet.sendTransaction({
                ...getTransactionOptions(),
                to: user2_wallet.address,
                value: numberToBn(send_eht_amount)
            })
            console.log('admin_wallet.sendTransaction() tx hash', tx.hash)
            receipt = await tx.wait()
            console.log('admin_wallet.sendTransaction() gas used', getGasUsedAndGasPriceFromReceipt(receipt))
        }

        const user1_eth_balance_in_ysgh_pool_before = bnToNumber(await ysgh_pool.getUserBalance(user1_wallet.address))
        console.log('user1_eth_balance_in_ysgh_pool_before', user1_eth_balance_in_ysgh_pool_before)

        let user2_eth_balance_in_ysgh_pool_before = bnToNumber(await ysgh_pool.getUserBalance(user2_wallet.address))
        console.log('user2_eth_balance_in_ysgh_pool_before', user2_eth_balance_in_ysgh_pool_before)

        if (user2_eth_balance_in_ysgh_pool_before < 0.1) {
            console.log('user2 deposit eth to ysgh pool')

            const user2_ysgh_pool: IYsghPool = IYsghPool__factory.connect(YsghPool_data.address, user2_wallet)
            tx = await user2_ysgh_pool.deposit({
                ...getTransactionOptions(),
                value: numberToBn(1)
            })
            console.log('ysgh_pool.deposit() tx hash', tx.hash)
            receipt = await tx.wait()
            console.log('ysgh_pool.deposit() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

            user2_eth_balance_in_ysgh_pool_before = bnToNumber(await ysgh_pool.getUserBalance(user2_wallet.address))
            console.log('user2_eth_balance_in_ysgh_pool_before 2', user2_eth_balance_in_ysgh_pool_before)
        }

        // 3) 生成一口价订单
        console.log('生成一口价订单')
        const sell_nonce = bnToNoPrecisionNumber(await aggressive_bid_v2.nonces(user1_wallet.address))
        const sell_price = 0.01
        console.log('sell_price', sell_price)

        const sell_order = makeNewOrder(
            user1_wallet.address,
            OrderSide.SELL,
            OrderType.FixedPrice,
            creation_nft_v2.address,
            AssetType.ERC721,
            sell_token_id,
            sell_token_amount,
            sell_price,
            sell_nonce
        )

        const sell_input_data: InputData = await makeInputDataFromOrdersWithMerkleTree(sell_order, [sell_order], user1_wallet, admin_wallet)

        const buy_nonce = bnToNoPrecisionNumber(await aggressive_bid_v2.nonces(user2_wallet.address))
        const buy_order = makeNewOrder(
            user2_wallet.address,
            OrderSide.BUY,
            OrderType.FixedPrice,
            creation_nft_v2.address,
            AssetType.ERC721,
            sell_token_id,
            sell_token_amount,
            sell_price,
            buy_nonce
        )

        const buy_input_data: InputData = await makeInputDataFromOrdersWithMerkleTree(buy_order, [buy_order], user2_wallet, admin_wallet)

        const total_price = sell_price * sell_token_amount
        console.log('total_price', total_price)

        if (user2_eth_balance_in_ysgh_pool_before < total_price) {
            console.log('dfdsfsdfsd', user2_eth_balance_in_ysgh_pool_before , total_price)
            throw new Error('user2_staked_before.balance < total_price')
        }

        const eth_balance_in_distribution_contract_before = bnToNumber(await provider.getBalance(aggressive_bid_distribution.address))
        console.log('eth_balance_in_distribution_contract_before', eth_balance_in_distribution_contract_before)

        console.log('sell_input_data', sell_input_data)
        console.log('buy_input_data', buy_input_data)

        const user2_aggressive_bid = AggressiveBidV2__factory.connect(AggressiveBidV2_data.address, user2_wallet)

        tx = await user2_aggressive_bid.execute(sell_input_data, buy_input_data, getTransactionOptions())
        console.log('user2_aggressive_bid.execute() tx hash', tx.hash)
        receipt = await tx.wait()
        console.log('user2_aggressive_bid.execute() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

        // 4) 检查结果
        console.log('检查结果')
        // 交易费用
        const bid_transfer_fee_rate = bnToNumber(await aggressive_bid_distribution.bid_royalty_rate()) / bnToNumber(await aggressive_bid_distribution.denominator())
        console.log('bid_transfer_fee_rate', bid_transfer_fee_rate)
        const bid_transfer_fee = total_price * bid_transfer_fee_rate
        console.log('bid_transfer_fee', bid_transfer_fee)

        const receive_amount = total_price - bid_transfer_fee
        const user1_eth_balance_in_ysgh_pool_after = bnToNumber(await ysgh_pool.getUserBalance(user1_wallet.address))
        console.log('user1_eth_balance_in_ysgh_pool_after', user1_eth_balance_in_ysgh_pool_after)
        expect(amount_equal_in_precision(user1_eth_balance_in_ysgh_pool_after, user1_eth_balance_in_ysgh_pool_before + receive_amount)).be.true


        const user1_staked_after = await user1_aggressive_bid_pool.isStakedNFT(user1_wallet.address, creation_nft_v2.address, user1_nft_token_id)
        console.log('user1_staked_after', user1_staked_after)
        expect(user1_staked_after).be.false

        const user2_eth_balance_in_ysgh_pool_after = bnToNumber(await ysgh_pool.getUserBalance(user2_wallet.address))
        console.log('user2_eth_balance_in_ysgh_pool_after', user2_eth_balance_in_ysgh_pool_after)
        expect(amount_equal_in_precision(user2_eth_balance_in_ysgh_pool_after, user2_eth_balance_in_ysgh_pool_before - total_price)).be.true

        const user2_staked_after = await aggressive_bid_pool_v2.isStakedNFT(user2_wallet.address, creation_nft_v2.address, sell_token_id)
        console.log('user2_staked_after', user2_staked_after)
        expect(user2_staked_after).be.true

        const user1_nft_owner_in_aggressive_bid_pool_after = await aggressive_bid_pool_v2.getNFTOwner(creation_nft_v2.address, sell_token_id)
        console.log('user1_nft_owner_in_aggressive_bid_pool_after', user1_nft_owner_in_aggressive_bid_pool_after)
        expect(user1_nft_owner_in_aggressive_bid_pool_after).equal(user2_wallet.address)

        const eth_balance_in_distribution_contract_after = bnToNumber(await provider.getBalance(aggressive_bid_distribution.address))
        console.log('eth_balance_in_distribution_contract_after', eth_balance_in_distribution_contract_after)
        expect(amount_equal_in_precision(eth_balance_in_distribution_contract_after,eth_balance_in_distribution_contract_before + bid_transfer_fee)).be.true
    })

})