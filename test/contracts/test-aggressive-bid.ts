import {BigNumber, ContractReceipt, ContractTransaction, ethers, Wallet} from "ethers";
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
    bnToNumber, getGasUsedFromReceipt,
    getTransactionOptions,
    numberToBn,
    setDefaultGasOptions, signMessageAndSplitByWallet, signMessageByWallet, solidityAbiEncode
} from "../../helpers/contract/contract-utils";
import {expect} from "chai";
import {
    deployCreationNFT,
    makeInputData,
    makeInputDataFromOrdersWithMerkleTree,
    makeNewOrder
} from "../../helpers/mock-functions";
import {
    AggressiveBid,
    AggressiveBid__factory,
    AggressiveBidDistribution, AggressiveBidDistribution__factory,
    AggressiveBidPool, AggressiveBidPool__factory, IYsghPool, IYsghPool__factory
} from "../../typechain-types";
import AggressiveBidPool_data from "../../contract-data/AggressiveBidPool-data";
import AggressiveBid_data from "../../contract-data/AggressiveBid-data";
import AggressiveBidDistribution_data from "../../contract-data/AggressiveBidDistribution-data";
import {UserStakeStructs} from "../../typechain-types/NFTBattlePool";
import ApprovalDataStruct = UserStakeStructs.ApprovalDataStruct;
import {nowTimestamp} from "../../helpers/utils";
import {keccak256} from "@ethersproject/keccak256";
import {solidityKeccak256} from "ethers/lib/utils";
import {
    AssetType,
    fetchToBidPoolUserStakedData,
    fetchToUserNFTStakedDataList,
    InputData,
    OrderSide,
    OrderType
} from "../../helpers/contract/structs";
import {exec} from "child_process";
import YsghPool_data from "../../contract-data/YsghPool-data";
import {AggressiveBidStructs} from "../../typechain-types/AggressiveBid";
import OrderStruct = AggressiveBidStructs.OrderStruct;


let tx: ContractTransaction
let receipt: ContractReceipt
const provider = contract_l2_provider_getter()
const admin_wallet: Wallet = get_admin_wallet(provider)
const user0_wallet: Wallet = admin_wallet
const user1_wallet: Wallet = get_user_wallet_5712(provider)
const user2_wallet: Wallet = get_user_wallet_e265(provider)
const user3_wallet: Wallet = get_user_wallet_114a(provider)

let aggressive_bid: AggressiveBid
let aggressive_bid_pool: AggressiveBidPool
let aggressive_bid_distribution: AggressiveBidDistribution
let ysgh_pool: IYsghPool

before(async function () {
    await setDefaultGasOptions(provider)

    aggressive_bid = AggressiveBid__factory.connect(AggressiveBid_data.address, admin_wallet)
    console.log('aggressive_bid.address', aggressive_bid.address)

    aggressive_bid_pool = AggressiveBidPool__factory.connect(AggressiveBidPool_data.address, admin_wallet)
    console.log('aggressive_bid_pool.address', aggressive_bid_pool.address)

    aggressive_bid_distribution = AggressiveBidDistribution__factory.connect(AggressiveBidDistribution_data.address, admin_wallet)
    console.log('aggressive_bid_distribution.address', aggressive_bid_distribution.address)

    ysgh_pool = IYsghPool__factory.connect(YsghPool_data.address, admin_wallet)
    console.log('ysgh_pool.address', ysgh_pool.address)
})

describe("Ysgh Market testing", function () {
    this.timeout(20 * 60 * 1000);

    it('base test', async () => {
        const verifier_address = await aggressive_bid.verifier_address()
        console.log('verifier_address', verifier_address)
        expect(verifier_address).equal(admin_wallet.address)

        const aggressive_bid_pool_address = await aggressive_bid.aggressive_bid_pool()
        console.log('aggressive_bid_pool_address', aggressive_bid_pool_address)
        expect(aggressive_bid_pool_address).equal(AggressiveBidPool_data.address)

        const aggressive_bid_distribution_address = await aggressive_bid.aggressive_bid_distribution()
        console.log('aggressive_bid_distribution_address', aggressive_bid_distribution_address)
        expect(aggressive_bid_distribution_address).equal(AggressiveBidDistribution_data.address)

        const ysgh_pool_address = await aggressive_bid.ysgh_pool()
        console.log('ysgh_pool_address', ysgh_pool_address)
        expect(ysgh_pool_address).equal(YsghPool_data.address)
    })


    it('test ERC721 execute() with fixed price', async () => {
        const user1_nft = await deployCreationNFT(user1_wallet, 'user1_nft', 'user1_nft', 'ipfs://', {
            original_element_creator: ethers.constants.AddressZero,
            element_creators: [],
            element_quote_element_creators: []
        });
        console.log('user1_nft.address', user1_nft.address)

        const sell_token_id = 0
        console.log('sell_token_id', sell_token_id)

        const sell_token_amount = 1

        // 1) 先将NFT授权和质押给合约

        const method_name_hash = solidityKeccak256(['string'], ['Permit(address owner,address spender,uint256 tokenId,uint256 nonce,uint256 deadline)'])

        const user1_nft_owner_before = user1_wallet.address
        const spender = aggressive_bid_pool.address
        const user1_nft_token_id = sell_token_id
        const nonce = await user1_nft.nonces(user1_wallet.address)
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

        const user1_aggressive_bid_pool = AggressiveBidPool__factory.connect(AggressiveBidPool_data.address, user1_wallet)
        tx = await user1_aggressive_bid_pool.stakeNFT(user1_nft.address, user1_approval_data, getTransactionOptions())
        console.log('user1_aggressive_bid_pool.stakeNFT() tx hash', tx.hash)
        receipt = await tx.wait()

        const user1_nft_staked_data_list_before = fetchToUserNFTStakedDataList(await user1_aggressive_bid_pool.getUserNFTStakedDataList(user1_wallet.address))
        console.log('user1_nft_staked_data_list_before', user1_nft_staked_data_list_before)
        const cc = user1_nft_staked_data_list_before.length
        expect(user1_nft_staked_data_list_before[cc-1].nftAddress).equal(user1_nft.address)
        expect(user1_nft_staked_data_list_before[cc-1].tokenId).equal(user1_nft_token_id)
        expect(user1_nft_staked_data_list_before[cc-1].amount).equal(1)

        const user1_nft_owner_in_aggressive_bid_pool_before = await user1_aggressive_bid_pool.getNFTOwner(user1_nft.address, user1_nft_token_id)
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

            user2_eth_balance_in_ysgh_pool_before = bnToNumber(await ysgh_pool.getUserBalance(user2_wallet.address))
            console.log('user2_eth_balance_in_ysgh_pool_before 2', user2_eth_balance_in_ysgh_pool_before)
        }

        // 3) 生成一口价订单
        console.log('生成一口价订单')
        const sell_nonce = bnToNoPrecisionNumber(await aggressive_bid.nonces(user1_wallet.address))
        const sell_price = 0.01
        console.log('sell_price', sell_price)

        const sell_order = makeNewOrder(
            user1_wallet.address,
            OrderSide.SELL,
            OrderType.FixedPrice,
            user1_nft.address,
            AssetType.ERC721,
            sell_token_id,
            sell_token_amount,
            sell_price,
            sell_nonce
        )

        const sell_input_data: InputData = await makeInputDataFromOrdersWithMerkleTree(sell_order, [sell_order], user1_wallet, admin_wallet)

        const buy_nonce = bnToNoPrecisionNumber(await aggressive_bid.nonces(user2_wallet.address))
        const buy_order = makeNewOrder(
            user2_wallet.address,
            OrderSide.BUY,
            OrderType.FixedPrice,
            user1_nft.address,
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
            throw new Error('user2_staked_data_list_before.balance < total_price')
        }

        const eth_balance_in_distribution_contract_before = bnToNumber(await provider.getBalance(aggressive_bid_distribution.address))
        console.log('eth_balance_in_distribution_contract_before', eth_balance_in_distribution_contract_before)

        console.log('sell_input_data', sell_input_data)
        console.log('buy_input_data', buy_input_data)

        const user2_aggressive_bid = AggressiveBid__factory.connect(AggressiveBid_data.address, user2_wallet)
        const rs = await user2_aggressive_bid.checkInput(sell_input_data)
        // console.log('rs', rs)
        expect(rs).equal(true)
        const rs2 = await user2_aggressive_bid.checkInput(buy_input_data)
        // console.log('rs2', rs2)
        expect(rs2).equal(true)

        tx = await user2_aggressive_bid.execute(sell_input_data, buy_input_data, getTransactionOptions())
        console.log('user2_aggressive_bid.execute() tx hash', tx.hash)
        receipt = await tx.wait()

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


        const user1_staked_data_list_after = fetchToUserNFTStakedDataList(await user1_aggressive_bid_pool.getUserNFTStakedDataList(user1_wallet.address))
        console.log('user1_staked_data_list_after', user1_staked_data_list_after)
        expect(user1_staked_data_list_after.length).equal(user1_nft_staked_data_list_before.length - 1)

        let user1_has_nft = false
        for (let i = 0; i < user1_staked_data_list_after.length; i++) {
            const nftStakedData = user1_staked_data_list_after[i]
            if (nftStakedData.userAddress == user1_wallet.address && nftStakedData.nftAddress == user1_nft.address &&  nftStakedData.tokenId === sell_token_id && nftStakedData.amount > 0) {
                user1_has_nft = true
                break
            }
        }
        expect(user1_has_nft).equal(false)

        const user2_eth_balance_in_ysgh_pool_after = bnToNumber(await ysgh_pool.getUserBalance(user2_wallet.address))
        console.log('user2_eth_balance_in_ysgh_pool_after', user2_eth_balance_in_ysgh_pool_after)
        expect(amount_equal_in_precision(user2_eth_balance_in_ysgh_pool_after, user2_eth_balance_in_ysgh_pool_before - total_price)).be.true

        const user2_staked_data_list_after = fetchToUserNFTStakedDataList(await aggressive_bid_pool.getUserNFTStakedDataList(user2_wallet.address))
        console.log('user2_staked_data_list_after', user2_staked_data_list_after)

        let user2_has_nft = false
        for (let i = 0; i < user2_staked_data_list_after.length; i++) {
            const nftStakedData = user2_staked_data_list_after[i]
            if (nftStakedData.nftAddress == user1_nft.address &&  nftStakedData.tokenId === sell_token_id && nftStakedData.amount > 0) {
                user2_has_nft = true
                break
            }
        }
        expect(user2_has_nft).equal(true)

        const user1_nft_owner_in_aggressive_bid_pool_after = await aggressive_bid_pool.getNFTOwner(user1_nft.address, sell_token_id)
        console.log('user1_nft_owner_in_aggressive_bid_pool_after', user1_nft_owner_in_aggressive_bid_pool_after)
        expect(user1_nft_owner_in_aggressive_bid_pool_after).equal(user2_wallet.address)

        const eth_balance_in_distribution_contract_after = bnToNumber(await provider.getBalance(aggressive_bid_distribution.address))
        console.log('eth_balance_in_distribution_contract_after', eth_balance_in_distribution_contract_after)
        expect(amount_equal_in_precision(eth_balance_in_distribution_contract_after,eth_balance_in_distribution_contract_before + bid_transfer_fee)).be.true
    })

})