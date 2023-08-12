import {ContractReceipt, ContractTransaction, ethers, Wallet} from "ethers";
import {contract_l2_provider_getter} from "../../helpers/providers/contract_provider_getter";
import {get_admin_wallet} from "../../helpers/wallets/admin_wallet_getter";
import {
    get_user_wallet_5712,
    get_user_wallet_5AD8,
    get_user_wallet_d05a
} from "../../helpers/wallets/user_wallet_getter";
import {
    MagnifierNFT,
    MagnifierNFT__factory,
    MagnifierNFTAirDrop,
    MagnifierNFTAirDrop__factory
} from "../../typechain-types";
import {
    bnToNoPrecisionNumber,
    getTransactionOptions,
    numberToBn,
    setDefaultGasOptions
} from "../../helpers/contract/contract-utils";
import MagnifierNFT_data from "../../contract-data/MagnifierNFT-data";
import {expect} from "chai";
import MagnifierNFTAirDrop_data from "../../contract-data/MagnifierNFTAirDrop-data";

let tx: ContractTransaction
let receipt: ContractReceipt
const provider = contract_l2_provider_getter()
const admin_wallet: Wallet = get_admin_wallet(provider)
const user1_wallet: Wallet = get_user_wallet_5712(provider)
const user2_wallet: Wallet = get_user_wallet_5AD8(provider)
const user3_wallet: Wallet = get_user_wallet_d05a(provider)
let magnifier_nft: MagnifierNFT
let magnifier_nft_air_drop: MagnifierNFTAirDrop


before(async function () {
    await setDefaultGasOptions(provider)
    magnifier_nft_air_drop = MagnifierNFTAirDrop__factory.connect(MagnifierNFTAirDrop_data.address, admin_wallet)
    console.log('magnifier_nft_air_drop.address', magnifier_nft_air_drop.address)

    magnifier_nft = MagnifierNFT__factory.connect(MagnifierNFT_data.address, admin_wallet)
    console.log('magnifier_nft.address', magnifier_nft.address)
})
describe("Creation NFT testing", function () {
    this.timeout(20 * 60 * 1000);

    it('base test', async () => {

        const magnifier_nft_address = await magnifier_nft_air_drop.magnifier_nft()
        console.log('magnifier_nft_address', magnifier_nft_address)
        expect(magnifier_nft_address).to.equal(magnifier_nft.address)

        const deadline = bnToNoPrecisionNumber(await magnifier_nft_air_drop.deadline())
        console.log('deadline', deadline, (new Date(deadline*1000)).toString())
        expect(deadline).to.greaterThan(0)
    })

    it.skip('transfer magnifier nft to airdrop contract', async () => {
        const tokenId = 0
        const magnifier_nft_in_airdrop_contract = bnToNoPrecisionNumber(await magnifier_nft.balanceOf(magnifier_nft_air_drop.address, tokenId))
        console.log('magnifier_nft_in_airdrop_contract', magnifier_nft_in_airdrop_contract)
        if (magnifier_nft_in_airdrop_contract > 0) {
            console.log('the airdrop contract has magnifier nft, skip transfer')
            return
        }

        // transfer MagnifierNFT to airdrop contract
        const airdrop_amount = bnToNoPrecisionNumber(await magnifier_nft_air_drop.MAX_SUPPLY())
        console.log('airdrop_amount', airdrop_amount)
        expect(airdrop_amount).to.equal(100)

        const admin_nft_balance = bnToNoPrecisionNumber(await magnifier_nft.balanceOf(admin_wallet.address, numberToBn(tokenId, 0)))
        console.log('admin_nft_balance', admin_nft_balance)
        expect(admin_nft_balance).to.greaterThan(airdrop_amount)

        tx = await magnifier_nft.safeTransferFrom(admin_wallet.address, magnifier_nft_air_drop.address, numberToBn(tokenId, 0),  numberToBn(airdrop_amount, 0), ethers.constants.HashZero, getTransactionOptions())
        console.log('magnifier_nft.safeTransferFrom()', tx.hash)
        receipt = await tx.wait()

        const magnifier_nft_token_id = bnToNoPrecisionNumber(await magnifier_nft_air_drop.magnifier_nft_token_id())
        console.log('magnifier_nft_token_id', magnifier_nft_token_id)
        expect(magnifier_nft_token_id).to.equal(tokenId)

        const refund_address = await magnifier_nft_air_drop.refund_address()
        console.log('refund_address', refund_address)
        expect(refund_address).to.equal(admin_wallet.address)

        const airdrop_balance = bnToNoPrecisionNumber(await magnifier_nft.balanceOf(magnifier_nft_air_drop.address, tokenId))
        console.log('airdrop_balance', airdrop_balance)
        expect(airdrop_balance).to.equal(airdrop_amount)

    })

    it('test claim airdrop', async () => {
        const magnifier_nft_token_id = bnToNoPrecisionNumber(await magnifier_nft_air_drop.magnifier_nft_token_id())
        console.log('magnifier_nft_token_id', magnifier_nft_token_id)

        const old_user1_balance = bnToNoPrecisionNumber(await magnifier_nft.balanceOf(user1_wallet.address, magnifier_nft_token_id))
        console.log('old_user1_balance', old_user1_balance)

        const old_user2_balance = bnToNoPrecisionNumber(await magnifier_nft.balanceOf(user2_wallet.address, magnifier_nft_token_id))
        console.log('old_user2_balance', old_user2_balance)

        const user1_magnifier_nft_air_drop = MagnifierNFTAirDrop__factory.connect(MagnifierNFTAirDrop_data.address, user3_wallet)

        const user1_claimed = await user1_magnifier_nft_air_drop.user_claimed(user1_wallet.address)
        console.log('user1_claimed', user1_claimed)

        try {
            tx = await user1_magnifier_nft_air_drop.claim(await getTransactionOptions(user1_magnifier_nft_air_drop, 'claim',[]))
            console.log('user1_magnifier_nft_air_drop.claim()', tx.hash)
            receipt = await tx.wait()

            const new_user1_balance = bnToNoPrecisionNumber(await magnifier_nft.balanceOf(user1_wallet.address, magnifier_nft_token_id))
            console.log('new_user1_balance', new_user1_balance)
            expect(new_user1_balance).to.equal(old_user1_balance + 1)

        } catch (e : any) {
            if (user1_claimed) {
                throw e
            } else {
                throw e
            }
        }

        const user2_magnifier_nft_air_drop = MagnifierNFTAirDrop__factory.connect(MagnifierNFTAirDrop_data.address, user2_wallet)
        const user2_claimed = await user2_magnifier_nft_air_drop.user_claimed(user2_wallet.address)
        console.log('user2_claimed', user2_claimed)
        try {
            tx = await user2_magnifier_nft_air_drop.claim(getTransactionOptions())
            console.log('user2_magnifier_nft_air_drop.claim()', tx.hash)
            receipt = await tx.wait()

            const new_user2_balance = bnToNoPrecisionNumber(await magnifier_nft.balanceOf(user2_wallet.address, magnifier_nft_token_id))
            console.log('new_user2_balance', new_user2_balance)
            expect(new_user2_balance).to.equal(old_user2_balance + 1)
        } catch (e : any) {
            if (user2_claimed) {
                throw e
            } else {
                throw e
            }
        }
    })
})