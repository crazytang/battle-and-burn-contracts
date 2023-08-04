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
    setDefaultGasOptions
} from "../../helpers/contract/contract-utils";
import {
    AggressiveBidDistribution,
    AggressiveBidDistribution__factory,
    DistributionPolicyV1__factory
} from "../../typechain-types";
import DistributionPolicyV1_data from "../../contract-data/DistributionPolicyV1-data";
import AggressiveBidDistribution_data from "../../contract-data/AggressiveBidDistribution-data";
import {expect} from "chai";


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
    })

    it('transfer eth to contract', async ()=>{
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