import {ContractReceipt, ContractTransaction, ethers, Wallet} from "ethers";
import {contract_l2_provider_getter} from "../../helpers/providers/contract_provider_getter";
import {get_admin_wallet} from "../../helpers/wallets/admin_wallet_getter";
import {
    get_user_wallet_4871,
    get_user_wallet_5712,
    get_user_wallet_5AD8
} from "../../helpers/wallets/user_wallet_getter";
import {
    CreationNFT, CreationNFT__factory, IERC721, IERC721__factory,
    NFTBattle,
    NFTBattle__factory, NFTBattlePoolV2, NFTBattlePoolV2__factory, NFTBattleV2, NFTBattleV2__factory
} from "../../typechain-types";
import {
    bnToNoPrecisionNumber, getGasUsedAndGasPriceFromReceipt,
    getTransactionOptions,
    numberToBn,
    setDefaultGasOptions,
    signMessageAndSplitByWallet,
    solidityAbiEncode
} from "../../helpers/contract/contract-utils";
import NFTBattle_data from "../../contract-data/NFTBattle-data";
import CreationNFT_data from "../../contract-data/CreationNFT-data";
import {solidityKeccak256} from "ethers/lib/utils";
import {nowTimestamp} from "../../helpers/utils";
import {keccak256} from "@ethersproject/keccak256";
import {expect} from "chai";
import NFTBattlePool_data from "../../contract-data/NFTBattlePool-data";
import {fetchToNFTData} from "../../helpers/contract/structs";
import {randomInt} from "crypto";
import {UserStakeStructs} from "../../typechain-types/NFTBattlePool";
import ApprovalDataStruct = UserStakeStructs.ApprovalDataStruct;
import AggressiveBidPool_data from "../../contract-data/AggressiveBidPool-data";
import {deployCreationNFT} from "../../helpers/mock-functions";
import {DistributionStructs} from "../../typechain-types/NFTBattle";
import DistributionRoleParamsStruct = DistributionStructs.DistributionRoleParamsStruct;
import NFTBattlePoolV2_data from "../../contract-data/NFTBattlePoolV2-data";
import NFTBattleV2_data from "../../contract-data/NFTBattleV2-data";


let tx: ContractTransaction
let receipt: ContractReceipt
const provider = contract_l2_provider_getter()
const admin_wallet: Wallet = get_admin_wallet(provider)
const user1_wallet: Wallet = get_user_wallet_5712(provider)
const user2_wallet: Wallet = get_user_wallet_5AD8(provider)
const user3_wallet: Wallet = get_user_wallet_4871(provider)
let nft_battle_v2: NFTBattleV2
let creation_nft: CreationNFT
let nft_battle_pool_v2: NFTBattlePoolV2


before(async function () {
    await setDefaultGasOptions(provider)
    nft_battle_v2 = NFTBattleV2__factory.connect(NFTBattleV2_data.address, admin_wallet)
    console.log('nft_battle_v2.address', nft_battle_v2.address)

    nft_battle_pool_v2 = NFTBattlePoolV2__factory.connect(NFTBattlePoolV2_data.address, admin_wallet)
    console.log('nft_battle_pool_v2.address', nft_battle_pool_v2.address)

    creation_nft = CreationNFT__factory.connect(CreationNFT_data.address, admin_wallet)
    console.log('creation_nft.address', creation_nft.address)
})

describe("NFTBattle.sol testing", function () {
    this.timeout(20 * 60 * 1000);

    it('test base', async () => {
        const nft_battle_address = await nft_battle_pool_v2.nft_battle_address()
        console.log('nft_battle_address', nft_battle_address)
        expect(nft_battle_address).to.be.equal(nft_battle_v2.address)

        const aggressive_bid_pool_address = await nft_battle_pool_v2.aggressive_bid_pool_address()
        console.log('aggressive_bid_pool_address', aggressive_bid_pool_address)
        expect(aggressive_bid_pool_address).to.be.equal(AggressiveBidPool_data.address)
    })

    it('test stake() and redeem()', async () => {
        const tokenId = 0

        // approve and stake
        const method_name_hash = solidityKeccak256(['string'], ['Permit(address owner,address spender,uint256 tokenId,uint256 nonce,uint256 deadline)'])
        const distributionParams: DistributionRoleParamsStruct = {
            original_element_creator: ethers.constants.AddressZero,
            element_creators: [],
            element_quote_element_creators: []
        }
        const owner_creation_nft = await deployCreationNFT(admin_wallet, 'test', 'test', 'ipfs://test', distributionParams)
        const owner = admin_wallet.address
        const spender = nft_battle_pool_v2.address
        const nonce = await owner_creation_nft.nonces(owner)
        const deadline = nowTimestamp() + 60*3

        const old_user_nft_balance = bnToNoPrecisionNumber(await owner_creation_nft.balanceOf(admin_wallet.address))
        console.log('old_user_nft_balance', old_user_nft_balance)

        const old_pool_nft_balance = bnToNoPrecisionNumber(await owner_creation_nft.balanceOf(nft_battle_pool_v2.address))
        console.log('old_pool_nft_balance', old_pool_nft_balance)

        const old_user_staked_data = fetchToNFTData(await nft_battle_pool_v2.getUserStakedData(admin_wallet.address, owner_creation_nft.address, tokenId))
        console.log('old_user_staked_data', old_user_staked_data)

        // sign to approve
        const hash = keccak256(solidityAbiEncode(['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'], [method_name_hash, owner, spender, tokenId, nonce, deadline]))
        console.log('hash', hash)

        const signature = signMessageAndSplitByWallet(admin_wallet, hash)
        const r = signature.r
        const v = signature.v
        const s = signature.s

        const approval_data: ApprovalDataStruct = {
            userAddress: owner,
            spender: spender,
            tokenId: numberToBn(tokenId, 0),
            nonce: nonce,
            deadline: numberToBn(deadline, 0),
            r: r,
            s: s,
            v: v
        }

        /*        tx = await creation_nft.approveBySig(owner, spender, tokenId, nonce, deadline, v, r, s, getTransactionOptions())
                console.log('creation_nft.approveBySig() tx', tx.hash)
                await tx.wait()*/

        tx = await nft_battle_pool_v2.stake(owner_creation_nft.address, approval_data, getTransactionOptions())
        console.log('nft_battle_pool_v2.stake() tx', tx.hash)
        receipt = await tx.wait()
        console.log('nft_battle_pool_v2.stake() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

        const new_user_nft_balance = bnToNoPrecisionNumber(await owner_creation_nft.balanceOf(admin_wallet.address))
        console.log('new_user_nft_balance', new_user_nft_balance)
        expect(new_user_nft_balance).to.equal(old_user_nft_balance - 1)

        const new_pool_nft_balance = bnToNoPrecisionNumber(await owner_creation_nft.balanceOf(nft_battle_pool_v2.address))
        console.log('new_pool_nft_balance', new_pool_nft_balance)
        expect(new_pool_nft_balance).to.equal(old_pool_nft_balance + 1)

        const new_user_staked_data = fetchToNFTData(await nft_battle_pool_v2.getUserStakedData(admin_wallet.address, owner_creation_nft.address, tokenId))
        console.log('new_user_staked_data', new_user_staked_data)
        expect(new_user_staked_data.nftAddress).to.equal(owner_creation_nft.address)
        expect(new_user_staked_data.tokenId).to.equal(tokenId)
        expect(new_user_staked_data.amount).to.equal(1)

        // redeem
        tx = await nft_battle_pool_v2.redeem(owner_creation_nft.address, tokenId, getTransactionOptions())
        console.log('nft_battle_pool_v2.redeem() tx', tx.hash)
        receipt = await tx.wait()
        console.log('nft_battle_pool_v2.redeem() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

        const new_user_nft_balance2 = bnToNoPrecisionNumber(await owner_creation_nft.balanceOf(admin_wallet.address))
        console.log('new_user_nft_balance2', new_user_nft_balance2)
        expect(new_user_nft_balance2).to.equal(new_user_nft_balance + 1)

        const new_pool_nft_balance2 = bnToNoPrecisionNumber(await owner_creation_nft.balanceOf(nft_battle_pool_v2.address))
        console.log('new_pool_nft_balance2', new_pool_nft_balance2)
        expect(new_pool_nft_balance2).to.equal(new_pool_nft_balance - 1)

        const new_user_staked_data2 = fetchToNFTData(await nft_battle_pool_v2.getUserStakedData(admin_wallet.address, owner_creation_nft.address, tokenId))
        console.log('new_user_staked_data2', new_user_staked_data2)
        expect(new_user_staked_data2.amount).to.equal(0)

        const user2_staked_data_before = fetchToNFTData(await nft_battle_pool_v2.getUserStakedData(user2_wallet.address, owner_creation_nft.address, tokenId))
        console.log('user2_staked_data_before', user2_staked_data_before)

        tx = await owner_creation_nft.approve(nft_battle_pool_v2.address, tokenId, getTransactionOptions())
        console.log('owner_creation_nft.approve() tx', tx.hash)
        receipt = await tx.wait()
        console.log('owner_creation_nft.approve() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

        tx = await nft_battle_pool_v2.stakeFrom(user2_wallet.address, owner_creation_nft.address, tokenId, getTransactionOptions())
        console.log('nft_battle_pool_v2.stakeFrom() tx', tx.hash)
        receipt = await tx.wait()
        console.log('nft_battle_pool_v2.stakeFrom() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

        const user2_staked_data_after = fetchToNFTData(await nft_battle_pool_v2.getUserStakedData(user2_wallet.address, owner_creation_nft.address, tokenId))
        console.log('user2_staked_data_after', user2_staked_data_after)
        expect(user2_staked_data_after.amount).equal(1)

        // revert
        const user2_nft_battle_pool_v2 = NFTBattlePoolV2__factory.connect(NFTBattlePoolV2_data.address, user2_wallet)
        tx = await user2_nft_battle_pool_v2.redeem(owner_creation_nft.address, tokenId, getTransactionOptions())
        console.log('user2_nft_battle_pool_v2.redeem() tx', tx.hash)
        receipt = await tx.wait()
        console.log('user2_nft_battle_pool_v2.redeem() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

        const user2_creation_nft = CreationNFT__factory.connect(owner_creation_nft.address, user2_wallet)
        tx = await user2_creation_nft.transferFrom(user2_wallet.address, admin_wallet.address, tokenId, getTransactionOptions())
        console.log('user2_creation_nft.transferFrom() tx', tx.hash)
        receipt = await tx.wait()
        console.log('user2_creation_nft.transferFrom() gas used', getGasUsedAndGasPriceFromReceipt(receipt))
    })

    it.skip('test burnNFT()', async () => {
        throw new Error('用例测试已跑通，如需重新测试，请将onlyNFTBattle的modifier注释掉')

        const burn_to_address = await nft_battle_pool_v2.burn_to_address()
        console.log('burn_to_address', burn_to_address)

        // mint a nft to burn
        const tokenId = bnToNoPrecisionNumber(await creation_nft.totalSupply())
        console.log('tokenId', tokenId)

        tx = await creation_nft.mint(admin_wallet.address, tokenId, getTransactionOptions())
        console.log('creation_nft.mint() tx', tx.hash)
        receipt = await tx.wait()
        console.log('creation_nft.mint() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

        // approve and stake
// approve and stake
        const method_name_hash = solidityKeccak256(['string'], ['Permit(address owner,address spender,uint256 tokenId,uint256 nonce,uint256 deadline)'])
        const owner = admin_wallet.address
        const spender = nft_battle_pool_v2.address
        const nonce = await creation_nft.nonces(owner)
        const deadline = nowTimestamp() + 60*3

        // sign to approve
        const hash = keccak256(solidityAbiEncode(['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'], [method_name_hash, owner, spender, tokenId, nonce, deadline]))
        console.log('hash', hash)

        const signature = signMessageAndSplitByWallet(admin_wallet, hash)
        const r = signature.r
        const v = signature.v
        const s = signature.s

        const approval_data: ApprovalDataStruct = {
            userAddress: owner,
            spender: spender,
            tokenId: numberToBn(tokenId, 0),
            nonce: nonce,
            deadline: numberToBn(deadline, 0),
            r: r,
            s: s,
            v: v
        }

        /*        tx = await creation_nft.approveBySig(owner, spender, tokenId, nonce, deadline, v, r, s, getTransactionOptions())
                console.log('creation_nft.approveBySig() tx', tx.hash)
                await tx.wait()*/

        const old_user_staked_data = fetchToNFTData(await nft_battle_pool_v2.getUserStakedData(admin_wallet.address, creation_nft.address, tokenId))
        console.log('old_user_staked_data', old_user_staked_data)

        tx = await nft_battle_pool_v2.stake(creation_nft.address, approval_data, getTransactionOptions())
        console.log('nft_battle_pool_v2.stake() tx', tx.hash)
        receipt = await tx.wait()
        console.log('nft_battle_pool_v2.stake() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

        const new_user_staked_data = fetchToNFTData(await nft_battle_pool_v2.getUserStakedData(admin_wallet.address, creation_nft.address, tokenId))
        console.log('new_user_staked_data', new_user_staked_data)
        expect(new_user_staked_data.nftAddress).to.equal(creation_nft.address)
        expect(new_user_staked_data.tokenId).to.equal(tokenId)
        expect(new_user_staked_data.amount).to.equal(1)

        // burn
        tx = await nft_battle_pool_v2.burnNFT(admin_wallet.address, creation_nft.address, tokenId, getTransactionOptions())
        console.log('nft_battle_pool_v2.burnNFT() tx', tx.hash)
        receipt = await tx.wait()
        console.log('nft_battle_pool_v2.burnNFT() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

        const new_user_staked_data2 = fetchToNFTData(await nft_battle_pool_v2.getUserStakedData(admin_wallet.address, creation_nft.address, tokenId))
        console.log('new_user_staked_data2', new_user_staked_data2)
        expect(new_user_staked_data2.amount).to.equal(0)

        const new_owner = await creation_nft.ownerOf(tokenId)
        console.log('new_owner', new_owner)
        expect(new_owner).to.equal(burn_to_address)
    })
})