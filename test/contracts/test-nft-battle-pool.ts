import {ContractReceipt, ContractTransaction, ethers, Wallet} from "ethers";
import {contract_l2_provider_getter} from "../../helpers/providers/contract_provider_getter";
import {get_admin_wallet} from "../../helpers/wallets/admin_wallet_getter";
import {
    get_user_wallet_4871,
    get_user_wallet_5712,
    get_user_wallet_5AD8
} from "../../helpers/wallets/user_wallet_getter";
import {
    CreationNFT, CreationNFT__factory,
    NFTBattle,
    NFTBattle__factory, NFTBattlePool, NFTBattlePool__factory
} from "../../typechain-types";
import {
    bnToNoPrecisionNumber,
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
import {MatchStructs} from "../../typechain-types/NFTBattlePool";
import ApprovalDataStruct = MatchStructs.ApprovalDataStruct;
import NFTBattlePool_data from "../../contract-data/NFTBattlePool-data";
import {fetchToNFTData} from "../../helpers/contract/structs";
import {randomInt} from "crypto";


let tx: ContractTransaction
let receipt: ContractReceipt
const provider = contract_l2_provider_getter()
const admin_wallet: Wallet = get_admin_wallet(provider)
const user1_wallet: Wallet = get_user_wallet_5712(provider)
const user2_wallet: Wallet = get_user_wallet_5AD8(provider)
const user3_wallet: Wallet = get_user_wallet_4871(provider)
let nft_battle: NFTBattle
let creation_nft: CreationNFT
let nft_battle_pool: NFTBattlePool

before(async function () {
    await setDefaultGasOptions(provider)
    nft_battle = NFTBattle__factory.connect(NFTBattle_data.address, admin_wallet)
    console.log('nft_battle.address', nft_battle.address)

    nft_battle_pool = NFTBattlePool__factory.connect(NFTBattlePool_data.address, admin_wallet)
    console.log('nft_battle_pool.address', nft_battle_pool.address)

    creation_nft = CreationNFT__factory.connect(CreationNFT_data.address, admin_wallet)
    console.log('creation_nft.address', creation_nft.address)
})

describe("NFTBattle.sol testing", function () {
    this.timeout(20 * 60 * 1000);

    it('test stake() and redeem()', async () => {
        const tokenId = 0

        // approve and stake
        const method_name_hash = solidityKeccak256(['string'], ['Permit(address owner,address spender,uint256 tokenId,uint256 nonce,uint256 deadline)'])
        const owner = admin_wallet.address
        const spender = nft_battle_pool.address
        const nonce = await creation_nft.nonces(owner)
        const deadline = nowTimestamp() + 60*3

        const old_user_nft_balance = bnToNoPrecisionNumber(await creation_nft.balanceOf(admin_wallet.address))
        console.log('old_user_nft_balance', old_user_nft_balance)

        const old_pool_nft_balance = bnToNoPrecisionNumber(await creation_nft.balanceOf(nft_battle_pool.address))
        console.log('old_pool_nft_balance', old_pool_nft_balance)

        const old_user_staked_data = fetchToNFTData(await nft_battle_pool.getUserStakedData(admin_wallet.address, creation_nft.address, tokenId))
        console.log('old_user_staked_data', old_user_staked_data)

        // sign to approve
        const hash = keccak256(solidityAbiEncode(['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'], [method_name_hash, owner, spender, tokenId, nonce, deadline]))
        console.log('hash', hash)

        const signature = signMessageAndSplitByWallet(admin_wallet, hash)
        const r = signature.r
        const v = signature.v
        const s = signature.s

        const approval_data: ApprovalDataStruct = {
            owner: owner,
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

        tx = await nft_battle_pool.stake(creation_nft.address, approval_data, getTransactionOptions())
        console.log('nft_battle_pool.stake() tx', tx.hash)
        await tx.wait()

        const new_user_nft_balance = bnToNoPrecisionNumber(await creation_nft.balanceOf(admin_wallet.address))
        console.log('new_user_nft_balance', new_user_nft_balance)
        expect(new_user_nft_balance).to.equal(old_user_nft_balance - 1)

        const new_pool_nft_balance = bnToNoPrecisionNumber(await creation_nft.balanceOf(nft_battle_pool.address))
        console.log('new_pool_nft_balance', new_pool_nft_balance)
        expect(new_pool_nft_balance).to.equal(old_pool_nft_balance + 1)

        const new_user_staked_data = fetchToNFTData(await nft_battle_pool.getUserStakedData(admin_wallet.address, creation_nft.address, tokenId))
        console.log('new_user_staked_data', new_user_staked_data)
        expect(new_user_staked_data.nftAddress).to.equal(creation_nft.address)
        expect(new_user_staked_data.tokenId).to.equal(tokenId)
        expect(new_user_staked_data.amount).to.equal(1)

        // redeem
        tx = await nft_battle_pool.redeem(creation_nft.address, tokenId, getTransactionOptions())
        console.log('nft_battle_pool.redeem() tx', tx.hash)
        await tx.wait()

        const new_user_nft_balance2 = bnToNoPrecisionNumber(await creation_nft.balanceOf(admin_wallet.address))
        console.log('new_user_nft_balance2', new_user_nft_balance2)
        expect(new_user_nft_balance2).to.equal(new_user_nft_balance + 1)

        const new_pool_nft_balance2 = bnToNoPrecisionNumber(await creation_nft.balanceOf(nft_battle_pool.address))
        console.log('new_pool_nft_balance2', new_pool_nft_balance2)
        expect(new_pool_nft_balance2).to.equal(new_pool_nft_balance - 1)

        const new_user_staked_data2 = fetchToNFTData(await nft_battle_pool.getUserStakedData(admin_wallet.address, creation_nft.address, tokenId))
        console.log('new_user_staked_data2', new_user_staked_data2)
        expect(new_user_staked_data2.amount).to.equal(0)
    })

    it.skip('test burnNFT()', async () => {
        throw new Error('用例测试已跑通，如需重新测试，请将onlyNFTBattle的modifier注释掉')

        const burn_to_address = await nft_battle_pool.burn_to_address()
        console.log('burn_to_address', burn_to_address)

        // mint a nft to burn
        const tokenId = bnToNoPrecisionNumber(await creation_nft.totalSupply())
        console.log('tokenId', tokenId)

        tx = await creation_nft.mint(admin_wallet.address, tokenId, getTransactionOptions())
        console.log('creation_nft.mint() tx', tx.hash)
        await tx.wait()

        // approve and stake
// approve and stake
        const method_name_hash = solidityKeccak256(['string'], ['Permit(address owner,address spender,uint256 tokenId,uint256 nonce,uint256 deadline)'])
        const owner = admin_wallet.address
        const spender = nft_battle_pool.address
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
            owner: owner,
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

        const old_user_staked_data = fetchToNFTData(await nft_battle_pool.getUserStakedData(admin_wallet.address, creation_nft.address, tokenId))
        console.log('old_user_staked_data', old_user_staked_data)

        tx = await nft_battle_pool.stake(creation_nft.address, approval_data, getTransactionOptions())
        console.log('nft_battle_pool.stake() tx', tx.hash)
        await tx.wait()

        const new_user_staked_data = fetchToNFTData(await nft_battle_pool.getUserStakedData(admin_wallet.address, creation_nft.address, tokenId))
        console.log('new_user_staked_data', new_user_staked_data)
        expect(new_user_staked_data.nftAddress).to.equal(creation_nft.address)
        expect(new_user_staked_data.tokenId).to.equal(tokenId)
        expect(new_user_staked_data.amount).to.equal(1)

        // burn
        tx = await nft_battle_pool.burnNFT(admin_wallet.address, creation_nft.address, tokenId, getTransactionOptions())
        console.log('nft_battle_pool.burnNFT() tx', tx.hash)
        await tx.wait()

        const new_user_staked_data2 = fetchToNFTData(await nft_battle_pool.getUserStakedData(admin_wallet.address, creation_nft.address, tokenId))
        console.log('new_user_staked_data2', new_user_staked_data2)
        expect(new_user_staked_data2.amount).to.equal(0)

        const new_owner = await creation_nft.ownerOf(tokenId)
        console.log('new_owner', new_owner)
        expect(new_owner).to.equal(burn_to_address)
    })
})