import {ContractReceipt, ContractTransaction, ethers, Wallet} from "ethers";
import {contract_l2_provider_getter} from "../../helpers/providers/contract_provider_getter";
import {get_admin_wallet} from "../../helpers/wallets/admin_wallet_getter";
import {
    get_user_wallet_114a,
    get_user_wallet_5712, get_user_wallet_5AD8, get_user_wallet_90e2, get_user_wallet_d05a,
    get_user_wallet_e265
} from "../../helpers/wallets/user_wallet_getter";
import {
    bnToNoPrecisionNumber, bnToNumber,
    getTransactionOptions, numberToBn,
    setDefaultGasOptions, signMessageByWallet
} from "../../helpers/contract/contract-utils";
import {
    AggressiveBidDistribution,
    AggressiveBidDistribution__factory,
    DistributionPolicyV1__factory
} from "../../typechain-types";
import DistributionPolicyV1_data from "../../contract-data/DistributionPolicyV1-data";
import AggressiveBidDistribution_data from "../../contract-data/AggressiveBidDistribution-data";
import {expect} from "chai";
import {AggressiveBidDistributionStructs} from "../../typechain-types/AggressiveBidDistribution";
import ClaimRewardParamsStruct = AggressiveBidDistributionStructs.ClaimRewardParamsStruct;


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

let aggressive_bid_distribution: AggressiveBidDistribution

before(async function () {
    await setDefaultGasOptions(provider)
    aggressive_bid_distribution = AggressiveBidDistribution__factory.connect(AggressiveBidDistribution_data.address, admin_wallet)
    console.log('aggressive_bid_distribution.address', aggressive_bid_distribution.address)
})
describe("Creation NFT testing", function () {
    this.timeout(20 * 60 * 1000);

    it('base test', async () => {
        const denominator = bnToNoPrecisionNumber(await aggressive_bid_distribution.denominator())
        console.log('denominator', denominator)

        const bid_royalty_rate = bnToNoPrecisionNumber(await aggressive_bid_distribution.bid_royalty_rate())
        console.log('bid_royalty_rate', bid_royalty_rate)

        expect(bid_royalty_rate/denominator).equal(0.0401)

        const eth_balance_in_contract = await provider.getBalance(aggressive_bid_distribution.address).toString()
        console.log('eth_balance_in_contract', eth_balance_in_contract)

        const date = 20230810
        const reward_amount_daily = bnToNumber(await aggressive_bid_distribution.getRewardAmountDaily(numberToBn(date, 0)))
        console.log('reward_amount_daily', reward_amount_daily)
    })

    it.skip('transfer eth to contract', async ()=>{
        const transfer_amount = 0.01
        console.log('transfer_amount', transfer_amount)

        const eth_balance_in_contract_before = bnToNumber(await provider.getBalance(aggressive_bid_distribution.address))
        console.log('eth_balance_in_contract_before', eth_balance_in_contract_before)

        const date = toDate()
        console.log('date', date)

        const reward_amount_daily_before = bnToNumber(await aggressive_bid_distribution.getRewardAmountDaily(numberToBn(date, 0)))
        console.log('reward_amount_daily_before', reward_amount_daily_before)

        const zero_address_claimable_amount_before = bnToNumber(await aggressive_bid_distribution.getUserClaimableAmount(ethers.constants.AddressZero))
        console.log('zero_address_claimable_amount_before', zero_address_claimable_amount_before)

        const tx_data = {...getTransactionOptions(), value: numberToBn(transfer_amount), to: aggressive_bid_distribution.address}

        tx = await admin_wallet.sendTransaction(tx_data)
        console.log('admin_wallet.sendTransaction() tx', tx.hash)
        receipt = await tx.wait()

        const eth_balance_in_contract_after = bnToNumber(await provider.getBalance(aggressive_bid_distribution.address))
        console.log('eth_balance_in_contract_after', eth_balance_in_contract_after)
        expect(eth_balance_in_contract_after).equal(eth_balance_in_contract_before + transfer_amount)

        const reward_amount_daily_after = bnToNumber(await aggressive_bid_distribution.getRewardAmountDaily(numberToBn(date, 0)))
        console.log('reward_amount_daily_after', reward_amount_daily_after)
        expect(reward_amount_daily_after).equal(reward_amount_daily_before + transfer_amount)

        const zero_address_claimable_amount_after = bnToNumber(await aggressive_bid_distribution.getUserClaimableAmount(ethers.constants.AddressZero))
        console.log('zero_address_claimable_amount_after', zero_address_claimable_amount_after)
        expect(zero_address_claimable_amount_after).equal(zero_address_claimable_amount_before + transfer_amount)
    })

    it('test distributeDaily()', async ()=>{
        /*
        20230809
["0xC32C4D9a03D84c3e331C6Aa5669b3226cA432FA3","0x9F57DB42e2f0503A7545072977952bCfd37cC998"]
[1250000000000000,8498400000000]

0x07ca3b293b87e52b918c6843d3e396c9d5316f18d4ea79edaaab7f332ebe32631431f96762dc243c99b5514f9a4981d3b4f3545d4c7cdc98c3c4f953002895e31c
ipfs://QmPfBDLKHYYpDZe8Kn5xxctesvyd64dUvMwi4PEU1EkoAa/
         */
        const user1 = "0xC32C4D9a03D84c3e331C6Aa5669b3226cA432FA3"
        const user2 = "0x9F57DB42e2f0503A7545072977952bCfd37cC998"
        const user1_amount = bnToNumber(numberToBn(1250000000000000, 0))
        const user2_amount = bnToNumber(numberToBn(8498400000000, 0))
        console.log('user1_amount', user1_amount, user2_amount)
        const date = 20230809
        const reward_users = [user1,user2]
        const reward_amounts = [numberToBn(user1_amount), numberToBn(user2_amount)]
        const merkle_root = '0x8ee1513a7146a4ebb04a6af1f0ce99acd080e59f060970e125e7024f605802d7'
        const signature2 = signMessageByWallet(admin_wallet, merkle_root)
        console.log('signature2', signature2)
        const signature = '0x07ca3b293b87e52b918c6843d3e396c9d5316f18d4ea79edaaab7f332ebe32631431f96762dc243c99b5514f9a4981d3b4f3545d4c7cdc98c3c4f953002895e31c'
        // expect(signature).equal(signature2)
        const ipfs_url = 'ipfs://QmPfBDLKHYYpDZe8Kn5xxctesvyd64dUvMwi4PEU1EkoAa/'

        const user1_claimable_amount_before = bnToNumber(await aggressive_bid_distribution.getUserClaimableAmount(user1))
        console.log('user1_claimable_amount_before', user1_claimable_amount_before)

        const user2_claimable_amount_before = bnToNumber(await aggressive_bid_distribution.getUserClaimableAmount(user2))
        console.log('user2_claimable_amount_before', user2_claimable_amount_before)

        const reward_amount_daily_before = bnToNumber(await aggressive_bid_distribution.getRewardAmountDaily(numberToBn(date, 0)))
        console.log('reward_amount_daily_before', reward_amount_daily_before)

        if (reward_amount_daily_before == 0) {
            console.log('reward_amount_daily_before is 0')
            return
        }
        expect(reward_amount_daily_before).equal(user1_amount + user2_amount)

        const claim_reward_params: ClaimRewardParamsStruct = {
            date: date,
            reward_users: reward_users,
            reward_amounts: reward_amounts,
            merkle_root: merkle_root,
            extra_signature: signature2,
            merkle_ipfs_uri: ipfs_url
        }
        console.log('claim_reward_params', claim_reward_params)

        tx = await aggressive_bid_distribution.distributeDaily(claim_reward_params, getTransactionOptions())
        console.log('aggressive_bid_distribution.distributeDaily() tx', tx.hash)
        receipt = await tx.wait()

        const user1_claimable_amount_after = bnToNumber(await aggressive_bid_distribution.getUserClaimableAmount(user1))
        console.log('user1_claimable_amount_after', user1_claimable_amount_after)
        expect(user1_claimable_amount_after).equal(user1_claimable_amount_before + user1_amount)

        const user2_claimable_amount_after = bnToNumber(await aggressive_bid_distribution.getUserClaimableAmount(user2))
        console.log('user2_claimable_amount_after', user2_claimable_amount_after)
        expect(user2_claimable_amount_after).equal(user2_claimable_amount_before + user2_amount)

        const reward_amount_daily_after = bnToNumber(await aggressive_bid_distribution.getRewardAmountDaily(numberToBn(date, 0)))
        console.log('reward_amount_daily_after', reward_amount_daily_after)
        expect(reward_amount_daily_after).equal(0)
    })
})

const toDate = (): number => {
    let date = new Date(); // 获取当前日期和时间

    let year = date.getFullYear(); // 获取年份

    let month: string | number = date.getMonth() + 1; // 获取月份，注意 JavaScript 中的月份是从 0 开始计数的，所以需要 +1
    month = month < 10 ? '0' + month : month; // 如果月份小于10，前面补0

    let day: string | number = date.getDate(); // 获取日期
    day = day < 10 ? '0' + day : day; // 如果日期小于10，前面补0

    return  parseInt('' + year + month + day); // 将年、月、日拼接成字符串


}