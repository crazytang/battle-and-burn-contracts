import {ContractReceipt, ContractTransaction, Wallet} from "ethers";
import {contract_l2_provider_getter} from "../../helpers/providers/contract_provider_getter";
import {get_admin_wallet} from "../../helpers/wallets/admin_wallet_getter";
import {
    amount_equal_in_precision,
    bnToNoPrecisionNumber, bnToNumber, getGasUsedFromReceipt, getLogFromReceipt,
    getTransactionOptions,
    numberToBn,
    setDefaultGasOptions, signMessageAndSplitByWallet, solidityAbiEncode, solidityAbiEncodePacked
} from "../../helpers/contract/contract-utils";
import {
    get_user_wallet_114a,
    get_user_wallet_5712,
    get_user_wallet_d05a
} from "../../helpers/wallets/user_wallet_getter";
import {
    CreationNFT,
    CreationNFT__factory,
    DistributionPolicyV1,
    DistributionPolicyV1__factory
} from "../../typechain-types";
import CreationNFT_data from "../../contract-data/CreationNFT-data";
import {expect} from "chai";
import {
    DistributionData,
    fetchToDistributionData, fetchToRoyaltyInfo,
    fetchToUserRewardData, RoyaltyInfo,
    UserRewardData
} from "../../helpers/contract/structs";
import RoyaltyDistributor_data from "../../contract-data/RoyaltyDistributor-data";
import DistributionPolicyV1_data from "../../contract-data/DistributionPolicyV1-data";
import TreasuryData from "../../contract-data/Treasury-data";
import {keccak256} from "@ethersproject/keccak256";
import {nowTimestamp} from "../../helpers/utils";
import {solidityKeccak256} from "ethers/lib/utils";

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

        const distribution_role: DistributionData = fetchToDistributionData(await creation_nft.getDistributionRole())
        console.log('distribution_role', distribution_role)

        expect(distribution_role.creator).to.equal(admin_wallet.address)
        expect(distribution_role.original_element_creator).to.equal(admin_wallet.address)

        const element_creator1 = get_user_wallet_114a(provider)
        const element_creator2 = get_user_wallet_d05a(provider)
        expect(distribution_role.element_creators).to.deep.equal([element_creator1.address, element_creator2.address])

        expect(distribution_role.element_creators.length).to.equal(distribution_role.element_quote_element_creators.length)

        const user_reward_data: UserRewardData = fetchToUserRewardData(await creation_nft.getUserRewardData(admin_wallet.address))
        console.log('user_reward_data', user_reward_data)

        const royaltyInfo = await creation_nft.royaltyInfo(0, numberToBn(100))
        console.log('royaltyInfo', royaltyInfo)

        const interface_id = '0xc06dfe6c'
        console.log('interface_id', interface_id)

/*        const interface_id_in_contract = await creation_nft.getInterfaceId()
        console.log('interface_id_in_contract', interface_id_in_contract)

        const rs = await creation_nft.supportsInterface(interface_id)
        console.log('rs', rs)
        expect(rs).to.equal(true)*/
    })

    it('royaltyInfo', async () => {
        const distribution_policy_address = await creation_nft.distribution_policy()
        console.log('distribution_policy_address', distribution_policy_address)
        expect(distribution_policy_address).equal(DistributionPolicyV1_data.address)

        const distribution_policy: DistributionPolicyV1 = DistributionPolicyV1__factory.connect(distribution_policy_address, admin_wallet)
        const royalty_fee_in_policy = bnToNoPrecisionNumber(await distribution_policy.royalty_fee())
        console.log('royalty_fee_in_policy', royalty_fee_in_policy)

        const denominator = bnToNoPrecisionNumber(await distribution_policy.DENOMINATOR())
        const royalty_fee_rate = royalty_fee_in_policy / denominator
        console.log('royalty_fee_rate', royalty_fee_rate)

        const amount = 100
        const royaltyInfo: RoyaltyInfo = fetchToRoyaltyInfo(await creation_nft.royaltyInfo(0, numberToBn(amount)))
        console.log('royaltyInfo', royaltyInfo)
        expect(royalty_fee_rate).equal(royaltyInfo.royalty_amount_dec / amount)
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

        // revert
        const user1_creation_nft = CreationNFT__factory.connect(creation_nft.address, user1_wallet)
        tx = await user1_creation_nft.transferFrom(user1_wallet.address, admin_wallet.address, token_id)
        await tx.wait()
    })

    it('test approveBySig()', async () => {
        const tokenId = 0
        const method_name_hash = solidityKeccak256(['string'], ['Permit(address owner,address spender,uint256 tokenId,uint256 nonce,uint256 deadline)'])
        const owner = admin_wallet.address
        const spender = user1_wallet.address
        const nonce = await creation_nft.nonces(owner)
        const deadline = nowTimestamp() + 60*3

        const old_approved = await creation_nft.getApproved(tokenId)
        console.log('old_approved', old_approved)
        // expect(old_approved).to.equal(owner)

        const hash = keccak256(solidityAbiEncode(['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'], [method_name_hash, owner, spender, tokenId, nonce, deadline]))
        console.log('hash', hash)

        const signature = signMessageAndSplitByWallet(admin_wallet, hash)
        const r = signature.r
        const v = signature.v
        const s = signature.s

        tx = await creation_nft.approveBySig(owner, spender, tokenId, nonce, deadline, v, r, s, getTransactionOptions())
        console.log('creation_nft.approveBySig() tx', tx.hash)
        await tx.wait()

        const new_approved = await creation_nft.getApproved(tokenId)
        console.log('new_approved', new_approved)
        expect(new_approved).to.equal(spender)
    })

    it('test setDistributionPolicy()', async () => {
        const distribution_policy_address = await creation_nft.distribution_policy()
        console.log('distribution_policy_address', distribution_policy_address)
        // expect(distribution_policy_address).equal(DistributionPolicyV1_data.address)

        const new_distribution_policy = '0x259e132C4f175b48805BCd4ae4889df81D19ebD4'
        tx = await creation_nft.setDistributionPolicy(new_distribution_policy, getTransactionOptions())
        console.log('creation_nft.setDistributionPolicy() tx', tx.hash)
        await tx.wait()

        const new_distribution_policy_address = await creation_nft.distribution_policy()
        console.log('new_distribution_policy_address', new_distribution_policy_address)
        expect(new_distribution_policy_address).equal(new_distribution_policy)

        // revert
        tx = await creation_nft.setDistributionPolicy(DistributionPolicyV1_data.address, getTransactionOptions())
        await tx.wait()
    })

    it('test distribute', async () => {
        const distribution_policy_address = await creation_nft.distribution_policy()
        if (distribution_policy_address != DistributionPolicyV1_data.address) {
            throw new Error('distribution_policy_address != DistributionPolicyV1_data.address')
        }

        const royalty_amount = 0.1

        const old_treasury_balance = bnToNumber(await provider.getBalance(TreasuryData.address))
        console.log('old_treasury_balance', old_treasury_balance)

        const old_user_balance = bnToNumber(await provider.getBalance(admin_wallet.address))
        console.log('old_user_balance', old_user_balance)

        const old_balance_in_nft = bnToNumber(await provider.getBalance(creation_nft.address))
        console.log('old_balance_in_nft', old_balance_in_nft)

        const tx_data = {...getTransactionOptions(), value: numberToBn(royalty_amount), to: creation_nft.address}
        tx = await admin_wallet.sendTransaction(tx_data)
        console.log('admin_wallet.sendTransaction() tx', tx.hash)
        receipt = await tx.wait()
        const gas_fee = getGasUsedFromReceipt(receipt)

        const [treasury_address, to_treasury_amount_bn] = getLogFromReceipt(receipt, creation_nft, 'RemainingRewardToTreasury')
        const to_treasury_amount = bnToNumber(to_treasury_amount_bn)
        console.log('to_treasury_amount', to_treasury_amount)

        const new_treasury_balance = bnToNumber(await provider.getBalance(TreasuryData.address))
        console.log('new_treasury_balance', new_treasury_balance)
        expect(amount_equal_in_precision(new_treasury_balance, old_treasury_balance + to_treasury_amount)).to.equal(true)

        const new_user_balance = bnToNumber(await provider.getBalance(admin_wallet.address))
        console.log('new_user_balance', new_user_balance)
        expect(amount_equal_in_precision(new_user_balance, old_user_balance - gas_fee - royalty_amount)).to.equal(true)

        const new_balance_in_nft = bnToNumber(await provider.getBalance(creation_nft.address))
        console.log('new_balance_in_nft', new_balance_in_nft)
        expect(amount_equal_in_precision(new_balance_in_nft, old_balance_in_nft + royalty_amount - to_treasury_amount)).to.equal(true)
    })
})