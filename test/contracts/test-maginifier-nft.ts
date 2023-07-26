import {ContractReceipt, ContractTransaction, ethers, Wallet} from "ethers";
import {contract_l2_provider_getter} from "../../helpers/providers/contract_provider_getter";
import {get_admin_wallet} from "../../helpers/wallets/admin_wallet_getter";
import {
    get_user_wallet_114a,
    get_user_wallet_5712, get_user_wallet_5AD8,
    get_user_wallet_d05a
} from "../../helpers/wallets/user_wallet_getter";
import {CreationNFT, CreationNFT__factory, MagnifierNFT, MagnifierNFT__factory} from "../../typechain-types";
import {
    bnToNoPrecisionNumber,
    getTransactionOptions,
    numberToBn,
    setDefaultGasOptions
} from "../../helpers/contract/contract-utils";
import CreationNFT_data from "../../contract-data/CreationNFT-data";
import {expect} from "chai";
import {
    DistributionData,
    fetchToDistributionData,
    fetchToUserRewardData,
    UserRewardData
} from "../../helpers/contract/structs";
import MagnifierNFT_data from "../../contract-data/MagnifierNFT-data";

let tx: ContractTransaction
let receipt: ContractReceipt
const provider = contract_l2_provider_getter()
const admin_wallet: Wallet = get_admin_wallet(provider)
const user1_wallet: Wallet = get_user_wallet_5712(provider)
const user2_wallet: Wallet = get_user_wallet_5AD8(provider)
let magnifier_nft: MagnifierNFT

before(async function () {
    await setDefaultGasOptions(provider)
    magnifier_nft = MagnifierNFT__factory.connect(MagnifierNFT_data.address, admin_wallet)
    console.log('magnifier_nft.address', magnifier_nft.address)
})
describe("Creation NFT testing", function () {
    this.timeout(20 * 60 * 1000);

    it('base test', async () => {
        const name = await magnifier_nft.name()
        console.log('name', name)
        expect(name).to.equal('Magnifier NFT')

        const symbol = await magnifier_nft.symbol()
        console.log('symbol', symbol)
        expect(symbol).to.equal('MAGNIFIER')

        const base_uri = await magnifier_nft.baseURI()
        console.log('base_uri', base_uri)
        expect(base_uri).not.empty

        const owner = await magnifier_nft.owner()
        console.log('owner', owner)
        expect(owner).to.equal(admin_wallet.address)

        const total_supply = bnToNoPrecisionNumber(await magnifier_nft["totalSupply()"]())
        console.log('total_supply', total_supply)
    })

    it('mint', async () => {
        const old_total_supply = bnToNoPrecisionNumber(await magnifier_nft["totalSupply()"]())
        console.log('old_total_supply', old_total_supply)

        const token_id = 1
        console.log('token_id', token_id)
        const quantity = 9
        const old_total_supply_in_token_id = bnToNoPrecisionNumber(await magnifier_nft["totalSupply(uint256)"](token_id))
        console.log('old_total_supply_in_token_id', old_total_supply_in_token_id)

        const old_user1_nft_balance = bnToNoPrecisionNumber(await magnifier_nft.balanceOf(user1_wallet.address, token_id))
        console.log('old_user1_nft_balance', old_user1_nft_balance)

        tx = await magnifier_nft.mint(user1_wallet.address, token_id, quantity, getTransactionOptions())
        console.log('magnifier_nft.mint() tx', tx.hash)
        receipt = await tx.wait()

        const new_total_supply = bnToNoPrecisionNumber(await magnifier_nft["totalSupply()"]())
        console.log('new_total_supply', new_total_supply)
        expect(new_total_supply).to.equal(old_total_supply + quantity)

        const new_total_supply_in_token_id = bnToNoPrecisionNumber(await magnifier_nft["totalSupply(uint256)"](token_id))
        console.log('new_total_supply_in_token_id', new_total_supply_in_token_id)
        expect(new_total_supply_in_token_id).to.equal(old_total_supply_in_token_id + quantity)

        const new_user1_nft_balance = bnToNoPrecisionNumber(await magnifier_nft.balanceOf(user1_wallet.address, token_id))
        console.log('new_user1_nft_balance', new_user1_nft_balance)
        expect(new_user1_nft_balance).to.equal(old_user1_nft_balance + quantity)
    })

    it('test transfer', async () => {
        const token_id = 1
        const quantity = 1

        const user1_maginifier_nft = MagnifierNFT__factory.connect(MagnifierNFT_data.address, user1_wallet)
        const old_user1_nft_balance = bnToNoPrecisionNumber(await user1_maginifier_nft.balanceOf(user1_wallet.address, token_id))
        console.log('old_user1_nft_balance', old_user1_nft_balance)

        const old_user2_nft_balance = bnToNoPrecisionNumber(await user1_maginifier_nft.balanceOf(user2_wallet.address, token_id))
        console.log('old_user2_nft_balance', old_user2_nft_balance)

        tx = await user1_maginifier_nft.safeTransferFrom(user1_wallet.address, user2_wallet.address, token_id, quantity, ethers.constants.HashZero, getTransactionOptions())
        console.log('magnifier_nft.safeTransferFrom() tx', tx.hash)
        receipt = await tx.wait()

        const new_user1_nft_balance = bnToNoPrecisionNumber(await user1_maginifier_nft.balanceOf(user1_wallet.address, token_id))
        console.log('new_user1_nft_balance', new_user1_nft_balance)
        expect(new_user1_nft_balance).to.equal(old_user1_nft_balance - token_id)

        const new_user2_nft_balance = bnToNoPrecisionNumber(await user1_maginifier_nft.balanceOf(user2_wallet.address, token_id))
        console.log('new_user2_nft_balance', new_user2_nft_balance)
        expect(new_user2_nft_balance).to.equal(old_user2_nft_balance + token_id)

        // revert
        const user2_maginifier_nft = MagnifierNFT__factory.connect(MagnifierNFT_data.address, user2_wallet)
        tx = await user2_maginifier_nft.safeTransferFrom(user2_wallet.address, user1_wallet.address, token_id, quantity, ethers.constants.HashZero, getTransactionOptions())
        await tx.wait()
    })
})
