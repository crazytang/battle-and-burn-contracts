import {ContractReceipt, ContractTransaction, ethers, Wallet} from "ethers";
import {contract_l2_provider_getter} from "../../helpers/providers/contract_provider_getter";
import {get_admin_wallet} from "../../helpers/wallets/admin_wallet_getter";
import {
    get_user_wallet_114a,
    get_user_wallet_5712,
    get_user_wallet_d05a
} from "../../helpers/wallets/user_wallet_getter";
import {CreationNFT__factory, CreationNFTV2, CreationNFTV2__factory} from "../../typechain-types";
import {
    bnToNoPrecisionNumber,
    getGasUsedAndGasPriceFromReceipt, getTransactionOptions,
    setDefaultGasOptions
} from "../../helpers/contract/contract-utils";
import CreationNFTV2_data from "../../contract-data/CreationNFTV2-data";
import {expect} from "chai";
import DistributionPolicyV1_data from "../../contract-data/DistributionPolicyV1-data";
import {DistributionStructs} from "../../typechain-types/NFTBattle";
import DistributionRoleParamsStruct = DistributionStructs.DistributionRoleParamsStruct;
import {IpfsService} from "../../libs/ipfs-service";
import {keccak256} from "@ethersproject/keccak256";
import fs from "fs";
import NFTBattlePool_data from "../../contract-data/NFTBattlePool-data";
import CreationRewardPool_data from "../../contract-data/CreationRewardPool-data";


let tx: ContractTransaction
let receipt: ContractReceipt
const provider = contract_l2_provider_getter()
const admin_wallet: Wallet = get_admin_wallet(provider)
const user1_wallet: Wallet = get_user_wallet_5712(provider)
const user2_wallet: Wallet = get_user_wallet_d05a(provider)
let creation_nft_v2: CreationNFTV2

before(async function () {
    await setDefaultGasOptions(provider)

    creation_nft_v2 = CreationNFTV2__factory.connect(CreationNFTV2_data.address, admin_wallet)
    console.log('creation_nft_v2.address', creation_nft_v2.address)
})
describe("Creation NFT V2 testing", function () {
    this.timeout(20 * 60 * 1000);

    it('test base', async () => {
        const name = await creation_nft_v2.name()
        console.log('name', name)
        expect(name).to.equal('Creation NFT V2')

        const symbol = await creation_nft_v2.symbol()
        console.log('symbol', symbol)
        expect(symbol).to.equal('CRNV2')

        const creation_reward_pool = await creation_nft_v2.creation_reward_pool()
        console.log('creation_reward_pool', creation_reward_pool)
        // expect(creation_reward_pool).to.equal(CreationRE.address)
    })

    it('test setCreationRewardPool()', async () => {
        let creation_reward_pool_addresss = NFTBattlePool_data.address
        tx = await creation_nft_v2.setCreationRewardPool(creation_reward_pool_addresss, getTransactionOptions())
        console.log('creation_nft_v2.setCreationRewardPool() tx', tx.hash)
        receipt = await tx.wait()
        console.log('creation_nft_v2.setCreationRewardPool() gas used', getGasUsedAndGasPriceFromReceipt(receipt))
        const creation_reward_pool_addresss_after = await creation_nft_v2.creation_reward_pool()
        console.log('creation_reward_pool_addresss_after', creation_reward_pool_addresss_after)
        expect(creation_reward_pool_addresss_after).to.equal(creation_reward_pool_addresss)

        // revert
        console.log('revert...')
        creation_reward_pool_addresss = CreationRewardPool_data.address
        tx = await creation_nft_v2.setCreationRewardPool(creation_reward_pool_addresss, getTransactionOptions())
        receipt = await tx.wait()
        console.log('creation_nft_v2.setCreationRewardPool() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

    })

    it('test mint and transfer', async () => {
        const old_nft_balance = bnToNoPrecisionNumber(await creation_nft_v2.balanceOf(admin_wallet.address))
        console.log('old_nft_balance', old_nft_balance)

        const total_supply_before = bnToNoPrecisionNumber(await creation_nft_v2.totalSupply())
        console.log('total_supply_before', total_supply_before)

        const token_id = total_supply_before

        // 随便选两个用户作为element_creator
        const element_creator1 = get_user_wallet_114a(provider)
        const element_creator2 = get_user_wallet_d05a(provider)

        const distribution_params: DistributionRoleParamsStruct = {
            original_element_creator: admin_wallet.address,
            element_creators: [element_creator1.address, element_creator2.address],
            element_quote_element_creators:[ethers.constants.AddressZero, ethers.constants.AddressZero]
        }

        const meta_content = fs.readFileSync(__dirname + '/../../data/creation-nft-v2-meta.json').toString()
        const token_meta_hash = ethers.utils.id(meta_content)
        tx = await creation_nft_v2.mint(token_id, token_meta_hash)
        console.log('creation_nft_v2.mint() tx', tx.hash)
        receipt = await tx.wait()
        console.log('creation_nft_v2.mint() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

/*        if (true) {
            const user2_creation_nft_v2 = CreationNFTV2__factory.connect(CreationNFTV2_data.address, user2_wallet)
            tx = await user2_creation_nft_v2.mint2(token_id+1, ipfs_uri)
            console.log('user2_creation_nft_v2.mint2() tx', tx.hash)
            receipt = await tx.wait()
            console.log('user2_creation_nft_v2.mint2() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

            tx = await user2_creation_nft_v2.mint3(token_id+2, ethers.utils.id('test'))
            console.log('user2_creation_nft_v2.mint3() tx', tx.hash)
            receipt = await tx.wait()
            console.log('user2_creation_nft_v2.mint3() gas used', getGasUsedAndGasPriceFromReceipt(receipt))
        }*/

        const nft_owner = await creation_nft_v2.ownerOf(token_id)
        console.log('nft_owner', nft_owner)
        expect(nft_owner).to.equal(admin_wallet.address)

        const new_nft_balance = bnToNoPrecisionNumber(await creation_nft_v2.balanceOf(admin_wallet.address))
        console.log('new_nft_balance', new_nft_balance)
        expect(new_nft_balance).to.equal(old_nft_balance + 1)

        const total_supply_after = bnToNoPrecisionNumber(await creation_nft_v2.totalSupply())
        console.log('total_supply_after', total_supply_after)
        // expect(total_supply_after).to.equal(total_supply_before + 1)

        // transfer
        const user1_old_nft_balance = bnToNoPrecisionNumber(await creation_nft_v2.balanceOf(user1_wallet.address))
        console.log('user1_old_nft_balance', user1_old_nft_balance)

        tx = await creation_nft_v2.connect(admin_wallet).transferFrom(admin_wallet.address, user1_wallet.address, token_id)
        console.log('creation_nft_v2.transferFrom() tx', tx.hash)
        receipt = await tx.wait()
        console.log('creation_nft_v2.transferFrom() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

        const user1_new_nft_balance = bnToNoPrecisionNumber(await creation_nft_v2.balanceOf(user1_wallet.address))
        console.log('user1_new_nft_balance', user1_new_nft_balance)
        expect(user1_new_nft_balance).to.equal(user1_old_nft_balance + 1)

        // revert
        console.log('revert...')
        const user1_creation_nft = CreationNFT__factory.connect(creation_nft_v2.address, user1_wallet)
        tx = await user1_creation_nft.transferFrom(user1_wallet.address, admin_wallet.address, token_id)
        receipt = await tx.wait()
        console.log('creation_nft_v2.transferFrom() gas used', getGasUsedAndGasPriceFromReceipt(receipt))
    })
})