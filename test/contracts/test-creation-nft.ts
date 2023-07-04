import {ContractReceipt, ContractTransaction, Wallet} from "ethers";
import {contract_l2_provider_getter} from "../../helpers/providers/contract_provider_getter";
import {get_admin_wallet} from "../../helpers/wallets/admin_wallet_getter";
import {bnToNoPrecisionNumber, numberToBn, setDefaultGasOptions} from "../../helpers/contract/contract-utils";
import {get_user_wallet_5712} from "../../helpers/wallets/user_wallet_getter";
import {CreationNFT, CreationNFT__factory} from "../../typechain-types";
import CreationNFT_data from "../../contract-data/CreationNFT-data";
import {expect} from "chai";
import RoyaltyDistributor_data from "../../contract-data/RoyaltyDistributor-data";

let tx: ContractTransaction
let receipt: ContractReceipt
const provider = contract_l2_provider_getter()
const admin_wallet: Wallet = get_admin_wallet(provider)
const user1_wallet: Wallet = get_user_wallet_5712(provider)
let creation_nft: CreationNFT

before(async function () {
    await setDefaultGasOptions(provider)
    creation_nft = CreationNFT__factory.connect(CreationNFT_data.address, admin_wallet)
    console.log('creation_nft.address', creation_nft.address)
})
describe("Creation NFT testing", function () {
    this.timeout(20 * 60 * 1000);

    it('base test', async () => {
        const name = await creation_nft.name()
        console.log('name', name)
        expect(name).to.equal('Creation NFT')

        const symbol = await creation_nft.symbol()
        console.log('symbol', symbol)
        expect(symbol).to.equal('CREATION')

        const base_uri = await creation_nft.baseURI()
        console.log('base_uri', base_uri)
        expect(base_uri).not.empty

        const nft_owner = await creation_nft.ownerOf(0)
        console.log('nft_owner', nft_owner)
        expect(nft_owner).to.equal(admin_wallet.address)
    })

    it('set base uri', async () => {
        const old_base_uri = await creation_nft.baseURI()
        console.log('old_base_uri', old_base_uri)
        expect(old_base_uri).not.empty

        const new_base_uri = 'ipfs://bafybeibqw4pkqemew3dfef24qmh2hnekevniuheattyfp666txfmeh3uta/'
        tx = await creation_nft.setBaseURI(new_base_uri)
        console.log('creation_nft.setBaseURI() tx', tx.hash)
        await tx.wait()

        const base_uri = await creation_nft.baseURI()
        expect(base_uri).to.equal(new_base_uri)

        // revert
        tx = await creation_nft.setBaseURI(old_base_uri)
        await tx.wait()
    })

    it('mint and transfer', async () => {
        const old_nft_balance = bnToNoPrecisionNumber(await creation_nft.balanceOf(admin_wallet.address))
        console.log('old_nft_balance', old_nft_balance)

        const token_id = bnToNoPrecisionNumber(await creation_nft.totalSupply())
        console.log('token_id', token_id)

        tx = await creation_nft.mint(admin_wallet.address, token_id)
        console.log('creation_nft.mint() tx', tx.hash)
        await tx.wait()

        const nft_owner = await creation_nft.ownerOf(token_id)
        console.log('nft_owner', nft_owner)
        expect(nft_owner).to.equal(admin_wallet.address)

        const new_nft_balance = bnToNoPrecisionNumber(await creation_nft.balanceOf(admin_wallet.address))
        console.log('new_nft_balance', new_nft_balance)
        expect(new_nft_balance).to.equal(old_nft_balance + 1)

        // transfer
        const user1_old_nft_balance = bnToNoPrecisionNumber(await creation_nft.balanceOf(user1_wallet.address))
        console.log('user1_old_nft_balance', user1_old_nft_balance)

        tx = await creation_nft.connect(admin_wallet).transferFrom(admin_wallet.address, user1_wallet.address, token_id)
        console.log('creation_nft.transferFrom() tx', tx.hash)
        await tx.wait()

        const user1_new_nft_balance = bnToNoPrecisionNumber(await creation_nft.balanceOf(user1_wallet.address))
        console.log('user1_new_nft_balance', user1_new_nft_balance)
        expect(user1_new_nft_balance).to.equal(user1_old_nft_balance + 1)
    })

    it('set royalty', async () => {
        const tokenId = 0
        const amount = 100
        const [old_royalty_address, royalty_fee_bn] = await creation_nft.royaltyInfo(numberToBn(tokenId), amount)
        const royalty_fee = bnToNoPrecisionNumber(royalty_fee_bn)
        console.log('old_royalty_address', old_royalty_address)
        console.log('royalty_fee', royalty_fee)

        expect(old_royalty_address).equal(RoyaltyDistributor_data.address)

        console.log('royalty fee rate', royalty_fee/amount)

        tx = await creation_nft.setRoyalty(user1_wallet.address,1000)
        console.log('creation_nft.setRoyalty() tx', tx.hash)
        await tx.wait()

        const [new_royalty_address, new_royalty_fee_bn] = await creation_nft.royaltyInfo(numberToBn(tokenId), amount)
        const new_royalty_fee = bnToNoPrecisionNumber(new_royalty_fee_bn)
        console.log('new_royalty_address', new_royalty_address)
        console.log('new_royalty_fee', new_royalty_fee)
        const new_royalty_fee_rate = new_royalty_fee/amount
        console.log('new_royalty_fee_rate', new_royalty_fee_rate)

        expect(new_royalty_address).not.equal(RoyaltyDistributor_data.address)
        expect(new_royalty_fee).equal(amount*new_royalty_fee_rate)

        // revert
        tx = await creation_nft.setRoyalty(RoyaltyDistributor_data.address, royalty_fee_bn)
        await tx.wait()

        await creation_nft.estimateGas.setRoyalty(user1_wallet.address,1000)
    })
})