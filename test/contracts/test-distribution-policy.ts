import {
    bnToNoPrecisionNumber,
    getTransactionOptions,
    numberToBn,
    setDefaultGasOptions
} from "../../helpers/contract/contract-utils";
import {CreationNFT__factory, DistributionPolicyV1, DistributionPolicyV1__factory} from "../../typechain-types";
import CreationNFT_data from "../../contract-data/CreationNFT-data";
import {expect} from "chai";
import {
    DistributionData, fetchToDistributedResult,
    fetchToDistributionData,
    fetchToUserRewardData,
    UserRewardData
} from "../../helpers/contract/structs";
import {
    get_user_wallet_114a,
    get_user_wallet_5712, get_user_wallet_5AD8, get_user_wallet_90e2,
    get_user_wallet_d05a, get_user_wallet_e265
} from "../../helpers/wallets/user_wallet_getter";
import {ContractReceipt, ContractTransaction, Wallet} from "ethers";
import {contract_l2_provider_getter} from "../../helpers/providers/contract_provider_getter";
import {get_admin_wallet} from "../../helpers/wallets/admin_wallet_getter";
import DistributionPolicyV1_data from "../../contract-data/DistributionPolicyV1-data";
import Treasury_data from "../../contract-data/Treasury-data";


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

let distribution_poilicy: DistributionPolicyV1 = DistributionPolicyV1__factory.connect(DistributionPolicyV1_data.address, admin_wallet)

before(async function () {
    await setDefaultGasOptions(provider)
    distribution_poilicy = DistributionPolicyV1__factory.connect(DistributionPolicyV1_data.address, admin_wallet)
    console.log('distribution_poilicy.address', distribution_poilicy.address)
})
describe("Creation NFT testing", function () {
    this.timeout(20 * 60 * 1000);

    it('base test', async () => {
        const denominator = bnToNoPrecisionNumber(await distribution_poilicy.DENOMINATOR())

        const royalty_fee = bnToNoPrecisionNumber(await distribution_poilicy.royalty_fee())
        console.log('royalty_fee', royalty_fee)
        const royalty_fee_percentage = royalty_fee / denominator
        console.log('royalty_fee_percentage', royalty_fee_percentage)
        expect(royalty_fee_percentage).to.equal(0.05)

        const original_creator_rate = bnToNoPrecisionNumber(await distribution_poilicy.original_creator_rate())
        console.log('original_creator_rate', original_creator_rate)

        const element_creators_rate = bnToNoPrecisionNumber(await distribution_poilicy.element_creators_rate())
        console.log('element_creators_rate', element_creators_rate)
        expect((element_creators_rate+ original_creator_rate)/denominator).to.equal(1)

        const element_direct_quote_element_creator_rate = bnToNoPrecisionNumber(await distribution_poilicy.element_direct_quote_element_creator_rate())
        console.log('element_direct_quote_element_creator_rate', element_direct_quote_element_creator_rate)

        const element_superior_quote_element_creator_rate = bnToNoPrecisionNumber(await distribution_poilicy.element_superior_quote_element_creator_rate())
        console.log('element_superior_quote_element_creator_rate', element_superior_quote_element_creator_rate)

        const element_original_quote_element_creator_rate = bnToNoPrecisionNumber(await distribution_poilicy.element_original_quote_element_creator_rate())
        console.log('element_original_quote_element_creator_rate', element_original_quote_element_creator_rate)
        expect((element_direct_quote_element_creator_rate+element_superior_quote_element_creator_rate+element_original_quote_element_creator_rate)/denominator).to.equal(1)

        const treasury_address = await distribution_poilicy.treasury()
        console.log('treasury_address', treasury_address)
        expect(treasury_address).to.equal(Treasury_data.address)

    })

    it('test setOriginalCreatorAndElementsRate()', async () => {

        const creator = user1_wallet.address
        console.log('creator', creator)

        const original_element_creator = user2_wallet.address
        console.log('original_element_creator', original_element_creator)

        const element_creators = [user3_wallet.address, user4_wallet.address]
        console.log('element_creators', element_creators)

        const element_quote_element_creators = [user5_wallet.address, user6_wallet.address]
        console.log('element_quote_element_creators', element_quote_element_creators)

        let distribution_role: DistributionData = {
            creator: creator,
            original_element_creator: original_element_creator,
            element_creators: element_creators,
            element_quote_element_creators: element_quote_element_creators
        }

        await test_distribution_result(distribution_role, creator, original_element_creator, element_creators, element_quote_element_creators)

        const denominator = bnToNoPrecisionNumber(await distribution_poilicy.DENOMINATOR())

        let original_creator_rate = 6000 // 60%
        let element_creators_rate = 3000 // 30%

        expect(original_creator_rate + element_creators_rate).not.equal(denominator)
        try {
            tx = await distribution_poilicy.setOriginalCreatorAndElementsRate(numberToBn(original_creator_rate,0), numberToBn(element_creators_rate,0), getTransactionOptions())
            console.log('distribution_poilicy.setOriginalCreatorAndElementsRate() tx', tx.hash)
            console.log('should be getten error')
            await tx.wait()
            expect(false).to.equal(true)
        } catch (error : any) {
            // console.log('error', error)
            expect(error.code).to.equal('CALL_EXCEPTION')
        }

        element_creators_rate = 4000 // 40%
        expect(original_creator_rate + element_creators_rate).equal(denominator)
        tx = await distribution_poilicy.setOriginalCreatorAndElementsRate(numberToBn(original_creator_rate,0), numberToBn(element_creators_rate,0), getTransactionOptions())
        console.log('distribution_poilicy.setOriginalCreatorAndElementsRate() tx', tx.hash)
        await tx.wait()

        element_creators.push(original_element_creator)
        element_quote_element_creators.push(admin_wallet.address)
        distribution_role = {
            creator: creator,
            original_element_creator: creator,
            element_creators: element_creators,
            element_quote_element_creators: element_quote_element_creators
        }
        await test_distribution_result(distribution_role, creator, creator, element_creators, element_quote_element_creators)

        // revert
        original_creator_rate = 5000 // 50%
        element_creators_rate = 5000 // 50%
        expect(original_creator_rate + element_creators_rate).equal(denominator)
        tx = await distribution_poilicy.setOriginalCreatorAndElementsRate(numberToBn(original_creator_rate,0), numberToBn(element_creators_rate,0), getTransactionOptions())
        await tx.wait()
    })

    it('test setElementCreatersRate()', async ()=>{
        const denominator = bnToNoPrecisionNumber(await distribution_poilicy.DENOMINATOR())

        let direct_element_rate = 5000 // 50%
        let superior_element_rate = 3000 // 30%
        let original_element_rate = 4000 // 40%

        expect(direct_element_rate + superior_element_rate + original_element_rate).not.equal(denominator)
        try {
            tx = await distribution_poilicy.setElementCreatersRate(numberToBn(direct_element_rate,0), numberToBn(superior_element_rate,0), numberToBn(original_element_rate,0), getTransactionOptions())
            console.log('distribution_poilicy.setElementCreatersRate() tx', tx.hash)
            console.log('should be getten error')
            await tx.wait()
            expect(false).to.equal(true)
        } catch (error : any) {
            // console.log('error', error)
            expect(error.code).to.equal('CALL_EXCEPTION')
        }

        original_element_rate = 2000 // 20%
        expect(direct_element_rate + superior_element_rate + original_element_rate).equal(denominator)
        tx = await distribution_poilicy.setElementCreatersRate(numberToBn(direct_element_rate,0), numberToBn(superior_element_rate,0), numberToBn(original_element_rate,0), getTransactionOptions())
        console.log('distribution_poilicy.setElementCreatersRate() tx', tx.hash)
        await tx.wait()


        const creator = user1_wallet.address
        console.log('creator', creator)

        const original_element_creator = user2_wallet.address
        console.log('original_element_creator', original_element_creator)

        const element_creators = [user3_wallet.address, user4_wallet.address]
        console.log('element_creators', element_creators)

        const element_quote_element_creators = [user5_wallet.address, user6_wallet.address]
        console.log('element_quote_element_creators', element_quote_element_creators)

        let distribution_role: DistributionData = {
            creator: creator,
            original_element_creator: original_element_creator,
            element_creators: element_creators,
            element_quote_element_creators: element_quote_element_creators
        }

        await test_distribution_result(distribution_role, creator, original_element_creator, element_creators, element_quote_element_creators)

        // revert
        direct_element_rate = 5000 // 50%
        superior_element_rate = 2500 // 25%
        original_element_rate = 2500 // 25%
        expect(direct_element_rate + superior_element_rate + original_element_rate).equal(denominator)
        tx = await distribution_poilicy.setElementCreatersRate(numberToBn(direct_element_rate,0), numberToBn(superior_element_rate,0), numberToBn(original_element_rate,0), getTransactionOptions())
        await tx.wait()
    })

    it('test royalty fee percentage', async () => {
        const old_royalty_fee = bnToNoPrecisionNumber(await distribution_poilicy.royalty_fee())
        console.log('old_royalty_fee', old_royalty_fee)

        const new_royalty_fee = 1000 // 10%
        tx = await distribution_poilicy.setRoyaltyFee(numberToBn(new_royalty_fee,0), getTransactionOptions())
        console.log('distribution_poilicy.setRoyaltyFee() tx', tx.hash)
        await tx.wait()

        const royalty_fee_percentage = bnToNoPrecisionNumber(await distribution_poilicy.royalty_fee())
        expect(new_royalty_fee).to.equal(royalty_fee_percentage)

        // revert
        tx = await distribution_poilicy.setRoyaltyFee(numberToBn(500,0), getTransactionOptions())
        await tx.wait()
    })
})

const test_distribution_result = async (distribution_role: DistributionData, creator: string, original_element_creator: string, element_creators:string[], element_quote_element_creators: string[]) => {
    const denominator = bnToNoPrecisionNumber(await distribution_poilicy.DENOMINATOR())

    const amount = 100
    const distribution_result = fetchToDistributedResult(await distribution_poilicy.getDistributedResult(distribution_role, numberToBn(amount)))
    console.log('distribution_result', distribution_result)

    // 创作者的收益比例
    const original_creator_rate = bnToNoPrecisionNumber(await distribution_poilicy.original_creator_rate())
    // console.log('original_creator_rate', original_creator_rate)
    const original_creator_amount = amount * original_creator_rate / denominator
    expect(checkDistributionResult(distribution_result, creator, original_creator_amount)).to.equal(true)

    // 二创使用的元素收益比例
    const element_creators_rate = bnToNoPrecisionNumber(await distribution_poilicy.element_creators_rate())
    // console.log('element_creators_rate', element_creators_rate)
    const element_direct_quote_element_creator_rate = bnToNoPrecisionNumber(await distribution_poilicy.element_direct_quote_element_creator_rate())
    console.log('element_direct_quote_element_creator_rate', element_direct_quote_element_creator_rate)
    expect(checkDistributionResult(distribution_result, element_creators[0], amount * element_creators_rate *  element_direct_quote_element_creator_rate / denominator / denominator /distribution_role.element_creators.length)).to.equal(true)

    // 二创使用的元素的上一个元素收益比例
    const element_superior_quote_element_creator_rate = bnToNoPrecisionNumber(await distribution_poilicy.element_superior_quote_element_creator_rate())
    expect(checkDistributionResult(distribution_result, element_quote_element_creators[0], amount * element_creators_rate * element_superior_quote_element_creator_rate / denominator / denominator /distribution_role.element_quote_element_creators.length)).to.equal(true)

    // 二创使用的元素的最原始的元素收益比例
    const element_original_quote_element_creator_rate = bnToNoPrecisionNumber(await distribution_poilicy.element_original_quote_element_creator_rate())
    expect(checkDistributionResult(distribution_result, original_element_creator, amount * element_creators_rate * element_original_quote_element_creator_rate / denominator / denominator)).to.equal(true)
}
const checkDistributionResult = (distribution_result: any , user_address: String, reward_amount: number): boolean => {
    let result: boolean = false
    for (let i=0;i<distribution_result.length; i++ ){
        if (distribution_result[i].address == user_address) {
            if (distribution_result[i].amount == reward_amount) {
                result = true
                break
            }
        }
    }

    return result
}