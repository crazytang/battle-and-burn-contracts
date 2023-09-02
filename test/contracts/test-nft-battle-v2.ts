import {Contract, ContractReceipt, ContractTransaction, Wallet} from "ethers";
import {ethers} from "ethers"
import {contract_l2_provider_getter} from "../../helpers/providers/contract_provider_getter";
import {get_admin_wallet} from "../../helpers/wallets/admin_wallet_getter";
import {
    get_user_wallet_4871,
    get_user_wallet_5712,
    get_user_wallet_5AD8
} from "../../helpers/wallets/user_wallet_getter";
import {
    amount_equal_in_precision,
    bnToNoPrecisionNumber, bnToNumber, getGasUsedAndGasPriceFromReceipt, getLogFromReceipt,
    getTransactionOptions,
    numberToBn,
    recoverAddressFromSignedMessage,
    setDefaultGasOptions, signMessageAndSplitByWallet,
    signMessageByWallet, sleep, solidityAbiEncode, solidityAbiEncodeAndKeccak256
} from "../../helpers/contract/contract-utils";
import {
    BattleKOScore, BattleKOScore__factory,
    CreationNFT,
    CreationNFT__factory,
    CreationNFTV2,
    CreationNFTV2__factory,
    NFTBattlePoolV2,
    NFTBattlePoolV2__factory,
    NFTBattleV2,
    NFTBattleV2__factory
} from "../../typechain-types";
import {MerkleTreeService} from "../../libs/merkle-tree-service";
import {expect} from "chai";
import {nowTimestamp} from "../../helpers/utils";
import {keccak256} from "@ethersproject/keccak256";
import {sha256, solidityKeccak256} from "ethers/lib/utils";
import fs from "fs";
import {IpfsService} from "../../libs/ipfs-service";
import DistributionPolicyV1_data from "../../contract-data/DistributionPolicyV1-data";
import {
    ApprovalData,
    fetchToMatchData, fetchToMatchDataV2,
    fetchToNFTData,
    MatchData,
    MatchDataParam,
    NFTData,
    UserVote
} from "../../helpers/contract/structs";
import {deployCreationNFT, mintACreationNFT} from "../../helpers/mock-functions";
import NFTBattleV2_data from "../../contract-data/NFTBattleV2-data";
import NFTBattlePoolV2_data from "../../contract-data/NFTBattlePoolV2-data";
import CreationNFTV2_data from "../../contract-data/CreationNFTV2-data";
import BattleKOScore_data from "../../contract-data/BattleKOScore-data";
import {TransactionReceipt} from "@ethersproject/abstract-provider";


let tx: ContractTransaction
let receipt: TransactionReceipt
const provider = contract_l2_provider_getter()
const admin_wallet: Wallet = get_admin_wallet(provider)
const user1_wallet: Wallet = get_user_wallet_5712(provider)
const user2_wallet: Wallet = get_user_wallet_5AD8(provider)
const user3_wallet: Wallet = get_user_wallet_4871(provider)
let nft_battle_v2: NFTBattleV2
let nft_battle_pool_v2: NFTBattlePoolV2
let creation_nft_v2: CreationNFTV2
let battle_ko_score: BattleKOScore
let burn_to_address: string
const ipfs_service = new IpfsService()

before(async function () {
    await setDefaultGasOptions(provider)
    nft_battle_v2 = NFTBattleV2__factory.connect(NFTBattleV2_data.address, admin_wallet)
    console.log('nft_battle_v2.address', nft_battle_v2.address)

    nft_battle_pool_v2 = NFTBattlePoolV2__factory.connect(NFTBattlePoolV2_data.address, admin_wallet)
    console.log('nft_battle_pool_v2.address', nft_battle_pool_v2.address)
    burn_to_address = await nft_battle_pool_v2.burn_to_address()

    creation_nft_v2 = CreationNFTV2__factory.connect(CreationNFTV2_data.address, admin_wallet)
    console.log('creation_nft_v2.address', creation_nft_v2.address)

    battle_ko_score = BattleKOScore__factory.connect(BattleKOScore_data.address, admin_wallet)
    console.log('battle_ko_score.address', battle_ko_score.address)
})

describe("NFTBattle.sol testing", function () {
    this.timeout(20 * 60 * 1000);
    it('base test', async () => {
        const nft_battle_pool_address = await nft_battle_v2.nft_battle_pool_v2()
        console.log('nft_battle_pool_address', nft_battle_pool_address)
        expect(nft_battle_pool_address).to.equal(NFTBattlePoolV2_data.address)

        const battle_ko_address = await nft_battle_v2.battle_ko()
        console.log('battle_ko_address', battle_ko_address)
        expect(battle_ko_address).to.equal(BattleKOScore_data.address)

        const creation_nft_v2_address = await nft_battle_v2.creation_nft_v2()
        console.log('creation_nft_v2_address', creation_nft_v2_address)
        expect(creation_nft_v2_address).to.equal(CreationNFTV2_data.address)

        const verifier_address = await nft_battle_v2.verifier_address()
        console.log('verifier_address', verifier_address)
        expect(verifier_address).to.equal(admin_wallet.address)
    })

    it.skip('test determine()', async () => {
        const user1_nft_owner = user1_wallet.address
        const user2_nft_owner = user2_wallet.address

        const match_data_param = await makeMatchDataParam(user1_wallet, user2_wallet)

        const user1_nft_battle_pool = NFTBattlePoolV2__factory.connect(NFTBattlePoolV2_data.address, user1_wallet)

        // 5) 结束比赛
        const arena_nft_owner = await nft_battle_pool_v2.getNFTOwner(match_data_param.arenaNFT, match_data_param.arenaTokenId)
        console.log('arena_nft_owner', arena_nft_owner)
        expect(arena_nft_owner).to.equal(user1_nft_owner)
        const challenge_nft_owner = await nft_battle_pool_v2.getNFTOwner(match_data_param.challengeNFT, match_data_param.challengeTokenId)
        console.log('challenge_nft_owner', challenge_nft_owner)
        expect(challenge_nft_owner).to.equal(user2_nft_owner)

        expect(match_data_param.voteArenaCount != match_data_param.voteChallengeCount).to.equal(true)

        let winner_nft, winner_token_id, loser_nft, loser_token_id, winner_address
        if (match_data_param.voteArenaCount > match_data_param.voteChallengeCount) {
            winner_address = match_data_param.arenaOwner
            winner_nft = match_data_param.arenaNFT
            winner_token_id = match_data_param.arenaTokenId
            loser_nft = match_data_param.challengeNFT
            loser_token_id = match_data_param.challengeTokenId
        } else {
            winner_address = match_data_param.challengeOwner
            winner_nft = match_data_param.challengeNFT
            winner_token_id = match_data_param.challengeTokenId
            loser_nft = match_data_param.arenaNFT
            loser_token_id = match_data_param.arenaTokenId
        }

        const old_winner_ko_score = bnToNoPrecisionNumber(await battle_ko_score.getKOScore(winner_nft, winner_token_id))
        console.log('old_winner_ko_score', old_winner_ko_score)

        const old_loser_ko_score = bnToNoPrecisionNumber(await battle_ko_score.getKOScore(loser_nft, loser_token_id))
        console.log('old_loser_ko_score', old_loser_ko_score)

        await sleep(10000) // wait for 10 seconds
        // to redeem nft or not
        const redeem_nft = true
        tx = await nft_battle_v2.determine(match_data_param, redeem_nft, getTransactionOptions())
        console.log('nft_battle_v2.determine() tx', tx.hash)
        receipt = await tx.wait()
        console.log('nft_battle_v2.determine() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

        if (match_data_param.challengeNFT != ethers.constants.AddressZero) {
            const new_loser_nft_owner = await creation_nft_v2.ownerOf(loser_token_id)
            console.log('new_loser_nft_owner', new_loser_nft_owner)
            expect(new_loser_nft_owner).to.equal(burn_to_address)
        }

        const new_winner_ko_score = bnToNoPrecisionNumber(await battle_ko_score.getKOScore(winner_nft, winner_token_id))
        console.log('new_winner_ko_score', new_winner_ko_score)
        expect(new_winner_ko_score).to.equal(old_winner_ko_score + old_loser_ko_score + 1)

        if (redeem_nft) {
            const new_winner_nft_owner = await creation_nft_v2.ownerOf(match_data_param.arenaTokenId)
            console.log('new_winner_nft_owner', new_winner_nft_owner)
            expect(new_winner_nft_owner).to.equal(user1_nft_owner)
        } else {
            const new_winner_nft_owner_in_pool = await user1_nft_battle_pool.getNFTOwner(match_data_param.arenaNFT, match_data_param.arenaTokenId)
            console.log('new_winner_nft_owner_in_pool', new_winner_nft_owner_in_pool)
            expect(new_winner_nft_owner_in_pool).to.equal(user1_nft_owner)
        }
    })

    it.skip('test determineBySys()', async () => {
        const user1_nft_owner = user1_wallet.address
        const user2_nft_owner = user2_wallet.address
        const match_data_param = await makeMatchDataParam(user1_wallet, user2_wallet)

        let winner, winner_nft, winner_token_id, loser, loser_nft, loser_token_id
        if (match_data_param.voteArenaCount > match_data_param.voteChallengeCount) {
            winner = user1_wallet
            winner_nft = match_data_param.arenaNFT
            winner_token_id = match_data_param.arenaTokenId
            loser = user2_wallet
            loser_nft = match_data_param.challengeNFT
            loser_token_id = match_data_param.challengeTokenId
        } else {
            winner = user2_wallet
            winner_nft = match_data_param.challengeNFT
            winner_token_id = match_data_param.challengeTokenId
            loser = user1_wallet
            loser_nft = match_data_param.arenaNFT
            loser_token_id = match_data_param.arenaTokenId
        }

        const old_winner_user_staked = await nft_battle_pool_v2.isStakedNFT(winner.address, winner_nft, winner_token_id)
        console.log('old_winner_user_staked', old_winner_user_staked)
        expect(old_winner_user_staked).to.true

        // 5) 由系统决定胜负，冻结胜利者的NFT
        await sleep(10000) // wait for 10 seconds

        tx = await nft_battle_v2.determineBySys(match_data_param, getTransactionOptions())
        console.log('nft_battle_v2.determineBySys() tx', tx.hash)
        receipt = await tx.wait()
        console.log('nft_battle_v2.determineBySys() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

        const new_winner_user_staked = await nft_battle_pool_v2.isStakedNFT(winner.address, winner_nft, winner_token_id)
        console.log('new_winner_user_staked', new_winner_user_staked)
        expect(new_winner_user_staked).to.true

        const new_winner_user_nft_frozen = await nft_battle_pool_v2.isFrozenNFT(winner.address, winner_nft, winner_token_id)
        console.log('new_winner_user_nft_frozen', new_winner_user_nft_frozen)
        expect(new_winner_user_nft_frozen).to.true

        // 6) 解冻胜利者的NFT
        // 冻结的NFT不可以赎回
        const winner_nft_battle_pool = NFTBattlePoolV2__factory.connect(NFTBattlePoolV2_data.address, winner)

        try {
            tx = await winner_nft_battle_pool.redeem(winner_nft, winner_token_id, getTransactionOptions())
            console.log('nft_battle_pool_v2.redeem() tx', tx.hash)
            receipt = await tx.wait()
            console.log('nft_battle_pool_v2.redeem() gas used', getGasUsedAndGasPriceFromReceipt(receipt))
            expect(false).to.equal(true)
        } catch (error : any) {
            // console.log('error', error)
            expect(error.code).to.equal('CALL_EXCEPTION')
        }

        const eth_amount = 0.011
        const winner_eth_balance = bnToNumber(await winner.getBalance())
        console.log('winner_eth_balance', winner_eth_balance)
        if (winner_eth_balance < eth_amount) {
            throw new Error('winner_eth_balance < eth_amount')
        }

        const tx_data = {...getTransactionOptions(), value: numberToBn(eth_amount)}
        const nft_redeem = true

        const old_admin_eth_balance = bnToNumber(await admin_wallet.getBalance())
        console.log('old_admin_eth_balance', old_admin_eth_balance)

        tx = await winner_nft_battle_pool.unfreezeNFT(winner_nft, winner_token_id, nft_redeem, tx_data)
        console.log('nft_battle_pool_v2.unfreezeNFT() tx', tx.hash)
        receipt = await tx.wait()
        console.log('nft_battle_pool_v2.unfreezeNFT() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

        const new_winner_user_staked2 = await nft_battle_pool_v2.isStakedNFT(winner.address, winner_nft, winner_token_id)
        console.log('new_winner_user_staked2', new_winner_user_staked2)

        if (nft_redeem) {
            expect(new_winner_user_staked2).be.false

            const winner_nft_contract = CreationNFT__factory.connect(winner_nft, winner)
            const winner_nft_owner = await winner_nft_contract.ownerOf(winner_token_id)
            console.log('winner_nft_owner', winner_nft_owner)
            expect(winner_nft_owner).to.equal(winner.address)
        } else {
            expect(new_winner_user_staked2).be.true
            const new_winner_user_nft_frozen2 = await nft_battle_pool_v2.isFrozenNFT(winner.address, winner_nft, winner_token_id)
            console.log('new_winner_user_nft_frozen2', new_winner_user_nft_frozen2)
            expect(new_winner_user_nft_frozen2).to.false
        }

        const new_admin_eth_balance = bnToNumber(await admin_wallet.getBalance())
        console.log('new_admin_eth_balance', new_admin_eth_balance)
        expect(amount_equal_in_precision(new_admin_eth_balance, old_admin_eth_balance + eth_amount)).to.equal(true)

    })

    it.skip('test determineIncludeJPG()', async () => {
        const user1_nft_owner = user1_wallet.address
        const user2_nft_owner = user2_wallet.address
        const user1_jpg_ipfs = 'ipfs://QmbSHDFknsZGNk8N9LeRDpuRADAm5bvcxG6Sfrsa1tc9qiA'
        const user2_jpg_ipfs = 'ipfs://QmbSHDFknsZGNk8N9LeRDpuRADAm5bvcxG6Sfrsa1tc9qiB'

        // 赢家是JPG
        const match_data_param = await makeMatchDataParam(user1_wallet, user2_wallet, user1_jpg_ipfs, user2_jpg_ipfs)
        console.log('match_data_param', match_data_param)
        // 结束比赛
        expect(match_data_param.voteArenaCount != match_data_param.voteChallengeCount).to.equal(true)

        let winner_nft, winner_token_id, loser_nft, loser_token_id, winner_jpg, winner_owner, loser_jpg, loser_owner
        let winner: Wallet
        if (match_data_param.voteArenaCount > match_data_param.voteChallengeCount) {
            winner_jpg = match_data_param.arenaJPG
            winner_owner = match_data_param.arenaOwner
            winner_nft = match_data_param.arenaNFT
            winner_token_id = match_data_param.arenaTokenId

            loser_jpg = match_data_param.challengeJPG
            loser_owner = match_data_param.challengeOwner
            loser_nft = match_data_param.challengeNFT
            loser_token_id = match_data_param.challengeTokenId
            winner = user1_wallet
        } else {
            winner_jpg = match_data_param.challengeJPG
            winner_owner = match_data_param.challengeOwner
            winner_nft = match_data_param.challengeNFT
            winner_token_id = match_data_param.challengeTokenId

            loser_jpg = match_data_param.arenaJPG
            loser_owner = match_data_param.arenaOwner
            loser_nft = match_data_param.arenaNFT
            loser_token_id = match_data_param.arenaTokenId
            winner = user2_wallet
        }

        let token_meta_hash = ''
        if (winner_jpg != '') {
            const token_meta_content = fs.readFileSync(__dirname+'/../../data/creation-nft-v2-meta.json').toString()
            token_meta_hash = ethers.utils.id(token_meta_content)
        }

        // to redeem nft or not
        const redeem_nft = true

        await sleep(10000) // wait for 10 seconds

        tx = await nft_battle_v2.determineIncludeJPG(match_data_param, token_meta_hash, redeem_nft, getTransactionOptions())
        console.log('nft_battle_v2.determineIncludeJPG() tx', tx.hash)
        receipt = await tx.wait()
        console.log('nft_battle_v2.determineIncludeJPG() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

        // verify data
        if (winner_jpg != '') {
            // 检查是否已经铸造NFT
            const event_param = getLogFromReceipt(receipt, nft_battle_v2, 'DeterminedIncludeJPG')

            winner_nft = event_param.winner_nft
            winner_token_id = event_param.winner_tokenId
        } else {
            if (match_data_param.voteArenaCount > match_data_param.voteChallengeCount) {
                winner_nft = match_data_param.arenaNFT
                winner_token_id = match_data_param.arenaTokenId
            } else {
                winner_nft = match_data_param.challengeNFT
                winner_token_id = match_data_param.challengeTokenId
            }
        }

        let loser_ko_score = 0
        if (loser_nft != ethers.constants.AddressZero) {
            loser_ko_score = bnToNoPrecisionNumber(await battle_ko_score.getKOScore(loser_nft, loser_token_id))
        }
        console.log('loser_ko_score', loser_ko_score)

        const new_winner_ko_score = bnToNoPrecisionNumber(await battle_ko_score.getKOScore(winner_nft, winner_token_id))
        console.log('new_winner_ko_score', new_winner_ko_score)
        expect(new_winner_ko_score).to.equal(loser_ko_score + 1)

        if (redeem_nft) {
            const winner_creattion_nft = CreationNFTV2__factory.connect(winner_nft, user1_wallet)
            const new_winner_nft_owner = await winner_creattion_nft.ownerOf(winner_token_id)
            console.log('new_winner_nft_owner', new_winner_nft_owner)
            expect(new_winner_nft_owner).to.equal(user1_nft_owner)
        } else {
            const new_winner_nft_owner_in_pool = await nft_battle_pool_v2.getNFTOwner(winner_nft, winner_token_id)
            console.log('new_winner_nft_owner_in_pool', new_winner_nft_owner_in_pool)
            expect(new_winner_nft_owner_in_pool).to.equal(user1_nft_owner)
        }
    })

    it('test determineIncludeJPGBySys()', async () => {
        const user1_nft_owner = user1_wallet.address
        const user2_nft_owner = user2_wallet.address
        const user1_jpg_ipfs = 'ipfs://QmbSHDFknsZGNk8N9LeRDpuRADAm5bvcxG6Sfrsa1tc9qiA'
        const user2_jpg_ipfs = 'ipfs://QmbSHDFknsZGNk8N9LeRDpuRADAm5bvcxG6Sfrsa1tc9qiB'
        // to redeem nft or not
        const redeem_nft = false

        // 赢家是JPG
        const match_data_param = await makeMatchDataParam(user1_wallet, user2_wallet, user1_jpg_ipfs, user2_jpg_ipfs)
        console.log('match_data_param', match_data_param)

        // 结束比赛
        expect(match_data_param.voteArenaCount != match_data_param.voteChallengeCount).to.equal(true)

        let winner_nft, winner_token_id, loser_nft, loser_token_id, winner_jpg, winner_owner, loser_jpg, loser_owner
        let winner, loser
        if (match_data_param.voteArenaCount > match_data_param.voteChallengeCount) {
            winner = user1_wallet
            winner_jpg = match_data_param.arenaJPG
            winner_owner = match_data_param.arenaOwner
            winner_nft = match_data_param.arenaNFT
            winner_token_id = match_data_param.arenaTokenId

            loser = user2_wallet
            loser_jpg = match_data_param.challengeJPG
            loser_owner = match_data_param.challengeOwner
            loser_nft = match_data_param.challengeNFT
            loser_token_id = match_data_param.challengeTokenId
        } else {
            winner = user2_wallet
            winner_jpg = match_data_param.challengeJPG
            winner_owner = match_data_param.challengeOwner
            winner_nft = match_data_param.challengeNFT
            winner_token_id = match_data_param.challengeTokenId

            loser = user1_wallet
            loser_jpg = match_data_param.arenaJPG
            loser_owner = match_data_param.arenaOwner
            loser_nft = match_data_param.arenaNFT
            loser_token_id = match_data_param.arenaTokenId
        }

        const meta_content = fs.readFileSync(__dirname + '/../../data/creation-nft-v2-meta.json').toString()
        const token_meta_hash = ethers.utils.id(meta_content)

        await sleep(10000) // wait for 10 seconds
        tx = await nft_battle_v2.determineIncludeJPGBySys(match_data_param, token_meta_hash, getTransactionOptions())
        console.log('nft_battle_v2.determineIncludeJPGBySys() tx', tx.hash)
        receipt = await tx.wait()
        console.log('nft_battle_v2.determineIncludeJPGBySys() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

        // verify data
        if (winner_jpg != '') {
            // 检查是否已经铸造NFT
            const event_param = getLogFromReceipt(receipt, nft_battle_v2, 'DeterminedIncludeJPG')

            winner_nft = event_param.winner_nft
            winner_token_id = event_param.winner_tokenId
        } else {
            if (match_data_param.voteArenaCount > match_data_param.voteChallengeCount) {
                winner_nft = match_data_param.arenaNFT
                winner_token_id = match_data_param.arenaTokenId
            } else {
                winner_nft = match_data_param.challengeNFT
                winner_token_id = match_data_param.challengeTokenId
            }
        }

        let loser_ko_score = 0
        if (loser_nft != ethers.constants.AddressZero) {
            loser_ko_score = bnToNoPrecisionNumber(await battle_ko_score.getKOScore(loser_nft, loser_token_id))
        }
        console.log('loser_ko_score', loser_ko_score)

        const new_winner_ko_score = bnToNoPrecisionNumber(await battle_ko_score.getKOScore(winner_nft, winner_token_id))
        console.log('new_winner_ko_score', new_winner_ko_score)
        expect(new_winner_ko_score).to.equal(loser_ko_score + 1)

        const winner_nft_frozen_before = await nft_battle_pool_v2.isFrozenNFT(winner.address, winner_nft, winner_token_id)
        console.log('winner_nft_frozen_before', winner_nft_frozen_before)
        expect(winner_nft_frozen_before).to.true

        // 冻结的NFT不可以赎回
        const winner_nft_battle_pool = NFTBattlePoolV2__factory.connect(NFTBattlePoolV2_data.address, winner)

        try {
            tx = await winner_nft_battle_pool.redeem(winner_nft, winner_token_id, getTransactionOptions())
            console.log('nft_battle_pool_v2.redeem() tx', tx.hash)
            console.log('should be thrown error')
            receipt = await tx.wait()
            console.log('nft_battle_pool_v2.redeem() gas used', getGasUsedAndGasPriceFromReceipt(receipt))
            expect(false).to.equal(true)
        } catch (error : any) {
            // console.log('error', error)
            expect(error.code).to.equal('CALL_EXCEPTION')
        }

        const eth_amount = 0.01
        const tx_data = {...getTransactionOptions(), value: numberToBn(eth_amount)}

        const old_admin_eth_balance = bnToNumber(await admin_wallet.getBalance())
        console.log('old_admin_eth_balance', old_admin_eth_balance)

        tx = await winner_nft_battle_pool.unfreezeNFT(winner_nft, winner_token_id, redeem_nft, tx_data)
        console.log('winner_nft_battle_pool.unfreezeNFT() tx', tx.hash)
        receipt = await tx.wait()
        console.log('winner_nft_battle_pool.unfreezeNFT() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

        const new_winner_user_staked2 = await nft_battle_pool_v2.isStakedNFT(winner.address, winner_nft, winner_token_id)
        console.log('new_winner_user_staked2', new_winner_user_staked2)
        if (redeem_nft) {
            expect(new_winner_user_staked2).be.false

            const winner_nft_contract = CreationNFT__factory.connect(winner_nft, winner)
            const winner_nft_owner = await winner_nft_contract.ownerOf(winner_token_id)
            console.log('winner_nft_owner', winner_nft_owner)
            expect(winner_nft_owner).to.equal(winner.address)
        } else {
            expect(new_winner_user_staked2).be.true
            const winner_nft_frozen_after = await nft_battle_pool_v2.isFrozenNFT(winner.address, winner_nft, winner_token_id)
            console.log('winner_nft_frozen_after', winner_nft_frozen_after)
            expect(winner_nft_frozen_after).to.false

            const new_winner_nft_owner_in_pool = await nft_battle_pool_v2.getNFTOwner(winner_nft, winner_token_id)
            console.log('new_winner_nft_owner_in_pool', new_winner_nft_owner_in_pool)
            expect(new_winner_nft_owner_in_pool).to.equal(winner.address)
        }

        const new_admin_eth_balance = bnToNumber(await admin_wallet.getBalance())
        console.log('new_admin_eth_balance', new_admin_eth_balance)
        expect(amount_equal_in_precision(new_admin_eth_balance, old_admin_eth_balance + eth_amount)).to.equal(true)
    })

})

const saveAndUploadIPFS = async (ipfs_file_content: string): Promise<string> => {
    const vote_data_dir = __dirname + '/../../data/vote_data_merkle_tree/'
    const file_name = vote_data_dir + ethers.utils.id(ipfs_file_content) + '.json'
    fs.writeFileSync(file_name, ipfs_file_content)
    let ipfs_file = await ipfs_service.uploadFile(file_name)
    // console.log('ipfs_file', ipfs_file)
    return ipfs_file
}

/*
const deployCreationNFT = async (admin_wallet: Wallet, name: string, symbol: string, baseURI:string, distributionParams: DistributionRoleParamsStruct): Promise<Contract> => {
    const contract_name = 'CreationNFT'
    let contract_data = await import('../../data/compiled-data/CreationNFT.json')
    let contract_factory = new ethers.ContractFactory(contract_data.abi, contract_data.bytecode, admin_wallet)
    // contract_factory = contract_factory.connect(admin_wallet)
    const new_contract = await contract_factory.deploy(name, symbol, baseURI, distributionParams, DistributionPolicyV1_data.address, getTransactionOptions())
    return await new_contract.deployed()
}
*/

const makeMatchDataParam = async (user1_wallet:Wallet, user2_wallet:Wallet, arenaJPG='', challengeJPG=''): Promise<MatchDataParam> => {

    console.log('participant1 address', user1_wallet.address)
    console.log('participant2 address', user2_wallet.address)

    const method_name_hash = solidityKeccak256(['string'], ['Permit(address owner,address spender,uint256 tokenId,uint256 nonce,uint256 deadline)'])
    const spender = NFTBattlePoolV2_data.address
    const deadline = nowTimestamp() + 60*3
    let user1_nft_token_id = 0
    let user2_nft_token_id = 0

    let user1_nft = null
    if (arenaJPG == '') {
        // 创建二创NFT进行对战
        user1_nft_token_id = await mintACreationNFT(user1_wallet)
        console.log('user1_nft_token_id', user1_nft_token_id)

        // 质押到pool合约里面
        const user1_nft_owner = user1_wallet.address
        const nonce = bnToNoPrecisionNumber(await creation_nft_v2.nonces(user1_nft_owner))

        const user1_hash = keccak256(solidityAbiEncode(['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'], [method_name_hash, user1_nft_owner, spender, user1_nft_token_id, nonce, deadline]))
        const user1_signature = signMessageAndSplitByWallet(user1_wallet, user1_hash)
        let r = user1_signature.r
        let v = user1_signature.v
        let s = user1_signature.s

        const user1_approval_data: ApprovalData = {
            userAddress: user1_nft_owner,
            spender: spender,
            tokenId: user1_nft_token_id,
            nonce: nonce,
            deadline: deadline,
            r: r,
            s: s,
            v: v
        }

        const user1_nft_battle_pool = NFTBattlePoolV2__factory.connect(NFTBattlePoolV2_data.address, user1_wallet)

        tx = await user1_nft_battle_pool.stake(creation_nft_v2.address, user1_approval_data, getTransactionOptions())
        console.log('user1_nft_battle_pool.stake() tx', tx.hash)
        receipt = await tx.wait()
        console.log('user1_nft_battle_pool.stake() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

        const user1_nft_owner_in_contract = await user1_nft_battle_pool.getNFTOwner(creation_nft_v2.address, user1_nft_token_id)
        console.log('user1_nft_owner_in_contract', user1_nft_owner_in_contract)
        expect(user1_nft_owner_in_contract).to.equal(user1_nft_owner)
    }

    let user2_nft = null
    if (challengeJPG == '') {
        // 与上面的一样流程
        const user2_nft_owner = user2_wallet.address
        const nonce = bnToNoPrecisionNumber(await creation_nft_v2.nonces(user2_nft_owner))

        user2_nft_token_id = await mintACreationNFT(user2_wallet)
        console.log('user2_nft_token_id', user2_nft_token_id)

        const user2_hash = keccak256(solidityAbiEncode(['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'], [method_name_hash, user2_nft_owner, spender, user2_nft_token_id, nonce, deadline]))
        const user2_signature = signMessageAndSplitByWallet(user2_wallet, user2_hash)
        let r = user2_signature.r
        let v = user2_signature.v
        let s = user2_signature.s

        const user2_approval_data: ApprovalData = {
            userAddress: user2_nft_owner,
            spender: spender,
            tokenId: user2_nft_token_id,
            nonce: nonce,
            deadline: deadline,
            r: r,
            s: s,
            v: v
        }

        const user2_nft_battle_pool = NFTBattlePoolV2__factory.connect(NFTBattlePoolV2_data.address, user2_wallet)
        tx = await user2_nft_battle_pool.stake(creation_nft_v2.address, user2_approval_data, getTransactionOptions())
        console.log('user2_nft_battle_pool.stake() tx', tx.hash)
        receipt = await tx.wait()
        console.log('user2_nft_battle_pool.stake() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

        const user2_nft_owner_in_contract = await user2_nft_battle_pool.getNFTOwner(creation_nft_v2.address, user2_nft_token_id)
        console.log('user2_nft_owner_in_contract', user2_nft_owner_in_contract)
        expect(user2_nft_owner_in_contract).to.equal(user2_nft_owner)
    }

    // 3) 创建比赛数据
    const match_data_param: MatchDataParam = {
        matchId: ethers.constants.HashZero,
        matchListTime: nowTimestamp(),
        matchStartTime: 0,
        matchEndTime: 0,
        voteCount: 0,
        voteArenaCount: 0,
        voteChallengeCount: 0,
        arenaJPG: arenaJPG != '' ? arenaJPG : '',
        arenaOwner: user1_wallet.address,
        arenaNFT: arenaJPG == '' ? creation_nft_v2.address : ethers.constants.AddressZero,
        arenaTokenId: user1_nft_token_id,
        arenaOwnerSignature: '',
        challengeJPG: challengeJPG != '' ? challengeJPG : '',
        challengeOwner: user2_wallet.address,
        challengeNFT: challengeJPG == '' ? creation_nft_v2.address : ethers.constants.AddressZero,
        challengeTokenId: user2_nft_token_id,
        challengeOwnerSignature: '',
        extraSignature: ethers.constants.HashZero,
        merkleTreeURI: '',
        merkleTreeRoot: ethers.constants.HashZero,
    }

    const match_id:string = solidityKeccak256(['uint256', 'string', 'address', 'address', 'uint256' ], [match_data_param.matchListTime, match_data_param.arenaJPG, match_data_param.arenaOwner, match_data_param.arenaNFT, match_data_param.arenaTokenId])
    console.log('match_id', match_id)

    match_data_param.matchId = match_id

    const arena_hash = solidityAbiEncodeAndKeccak256(['bytes32', 'address', 'uint256', 'string', 'address'], [match_data_param.matchId, match_data_param.arenaNFT, match_data_param.arenaTokenId, match_data_param.arenaJPG, match_data_param.arenaOwner])
    match_data_param.arenaOwnerSignature = signMessageByWallet(user1_wallet, arena_hash)

    // 开始比赛
    match_data_param.matchStartTime = nowTimestamp()
    match_data_param.matchEndTime = nowTimestamp() +  10
    const challenge_hash = solidityAbiEncodeAndKeccak256(['bytes32', 'address', 'uint256', 'string', 'address'], [match_data_param.matchId, match_data_param.challengeNFT, match_data_param.challengeTokenId, match_data_param.challengeJPG, match_data_param.challengeOwner])
    match_data_param.challengeOwnerSignature = signMessageByWallet(user2_wallet, challenge_hash)
    console.log('match_data_param', match_data_param)

    // 检查签名
    const [arena_sign, challenge_sign] = await nft_battle_v2.checkArenaAndChallengeSignatures(match_data_param)
    console.log('arena_sign', arena_sign)
    console.log('challenge_sign', challenge_sign)
    expect(arena_sign).to.equal(true)
    expect(challenge_sign).to.equal(true)

    // 4) 投票
    // 第一个人投票
    let voter = user1_wallet.address
    const user_vote: UserVote = {
        matchId: match_id,
        voter: voter,
        votedNFT: match_data_param.arenaNFT,
        votedTokenId: match_data_param.arenaTokenId,
        votedJPG: match_data_param.arenaJPG,
        NFTOwner: match_data_param.arenaOwner,
        votedAt: nowTimestamp(),
        extraSignature: ethers.constants.HashZero
    }

    match_data_param.voteCount++
    match_data_param.voteArenaCount++

    const types = ['bytes']

    // 管理员对用户投票数据进行签名
    let admin_hash_user_vote = solidityAbiEncodeAndKeccak256(['bytes32', 'address', 'address', 'uint256', 'string', 'address', 'uint256'],[user_vote.matchId, user_vote.voter, user_vote.votedNFT, user_vote.votedTokenId, user_vote.votedJPG, user_vote.NFTOwner, user_vote.votedAt])

    user_vote.extraSignature = signMessageByWallet(admin_wallet, admin_hash_user_vote)

    console.log('user_vote', user_vote)

    // 用户对投票数据进行签名，包含管理员签名
    const hash_user_vote1 = solidityAbiEncodeAndKeccak256(['bytes32', 'address', 'address', 'uint256', 'string', 'address', 'uint256', 'bytes'],[user_vote.matchId, user_vote.voter, user_vote.votedNFT, user_vote.votedTokenId, user_vote.votedJPG, user_vote.NFTOwner, user_vote.votedAt, user_vote.extraSignature])
    const hash_user_vote1_in_contract = await nft_battle_v2.getUserVoteHash(user_vote)
    expect(hash_user_vote1).to.equal(hash_user_vote1_in_contract)

    const signed_hash_user_vote1 = signMessageByWallet(user1_wallet, hash_user_vote1)
    expect(recoverAddressFromSignedMessage(hash_user_vote1, signed_hash_user_vote1)).to.equal(user1_wallet.address)

    // 验证用户签名
    let rs = await nft_battle_v2.checkUserVote(user_vote, signed_hash_user_vote1)
    expect(rs).to.equal(true)

    // 生成merkle tree
    let leaves: string | any[] = []
    leaves = [[signed_hash_user_vote1]]

    let merkle_tree_service = new MerkleTreeService(leaves, types)

    let ipfs_file_content = JSON.stringify(merkle_tree_service.dump())
    // console.log('ipfs_file_content', ipfs_file_content)

    // 上传到IPFS
    let ipfs_file = await saveAndUploadIPFS(ipfs_file_content)
    console.log('ipfs_file', ipfs_file)

    match_data_param.merkleTreeURI = ipfs_file
    match_data_param.merkleTreeRoot = merkle_tree_service.getRoot()

    // 管理员对merkle tree root进行签名
    const match_data_admin_hash = solidityAbiEncodeAndKeccak256(['bytes32', 'uint256', 'uint256', 'bytes', 'bytes', 'bytes32'], [match_data_param.matchId, match_data_param.voteArenaCount, match_data_param.voteChallengeCount, match_data_param.arenaOwnerSignature, match_data_param.challengeOwnerSignature,  match_data_param.merkleTreeRoot])
    match_data_param.extraSignature = signMessageByWallet(admin_wallet, match_data_admin_hash)

    // 第二个人投票
    voter = user2_wallet.address
    const user_vote2: UserVote = {
        matchId: match_id,
        voter: voter,
        votedNFT: match_data_param.arenaNFT,
        votedTokenId: match_data_param.arenaTokenId,
        votedJPG: match_data_param.arenaJPG,
        NFTOwner: match_data_param.arenaOwner,
        votedAt: nowTimestamp(),
        extraSignature: ethers.constants.HashZero
    }

    match_data_param.voteCount++
    match_data_param.voteArenaCount++

    // 管理员对用户投票数据进行签名
    admin_hash_user_vote = solidityAbiEncodeAndKeccak256(['bytes32', 'address', 'address', 'uint256', 'string', 'address', 'uint256'], [user_vote2.matchId, user_vote2.voter, user_vote2.votedNFT, user_vote2.votedTokenId, user_vote2.votedJPG, user_vote2.NFTOwner, user_vote2.votedAt])
    user_vote2.extraSignature = signMessageByWallet(admin_wallet, admin_hash_user_vote)

    // 用户对投票数据进行签名，包含管理员签名
    const hash_user_vote2 = solidityAbiEncodeAndKeccak256(['bytes32', 'address', 'address', 'uint256', 'string', 'address', 'uint256', 'bytes'], [user_vote2.matchId, user_vote2.voter, user_vote2.votedNFT, user_vote2.votedTokenId, user_vote2.votedJPG, user_vote2.NFTOwner, user_vote2.votedAt, user_vote2.extraSignature])
    const signed_hash_user_vote2 = signMessageByWallet(user2_wallet, hash_user_vote2)
    expect(recoverAddressFromSignedMessage(hash_user_vote2, signed_hash_user_vote2)).to.equal(user2_wallet.address)

    // 验证用户签名
    rs = await nft_battle_v2.checkUserVote(user_vote2, signed_hash_user_vote2)
    // console.log('rs', rs)
    expect(rs).to.equal(true)

    // 生成merkle tree
    leaves = MerkleTreeService.leavesLoadFromJson(ipfs_file_content)
    leaves.push([signed_hash_user_vote2])

    merkle_tree_service = new MerkleTreeService(leaves, types)
    merkle_tree_service.setLastTreeUri(ipfs_file)

    ipfs_file_content = JSON.stringify(merkle_tree_service.dump())
    // console.log('ipfs_file_content 2', ipfs_file_content)
    ipfs_file = await saveAndUploadIPFS(ipfs_file_content)
    console.log('ipfs_file 2', ipfs_file)

    match_data_param.merkleTreeURI = ipfs_file
    match_data_param.merkleTreeRoot = merkle_tree_service.getRoot()
    // 管理员对merkle tree root进行签名
    const match_data_admin_hash2 = solidityAbiEncodeAndKeccak256(['bytes32', 'uint256', 'uint256', 'bytes', 'bytes', 'bytes32'], [match_data_param.matchId, match_data_param.voteArenaCount, match_data_param.voteChallengeCount, match_data_param.arenaOwnerSignature, match_data_param.challengeOwnerSignature, match_data_param.merkleTreeRoot])
    match_data_param.extraSignature = signMessageByWallet(admin_wallet, match_data_admin_hash2)

    // 第三个人投票
    voter = user3_wallet.address

    const user_vote3:UserVote = {
        matchId: match_id,
        voter: voter,
        votedNFT: match_data_param.challengeNFT,
        votedTokenId: match_data_param.challengeTokenId,
        votedJPG: match_data_param.challengeJPG,
        NFTOwner: match_data_param.challengeOwner,
        votedAt: nowTimestamp(),
        extraSignature: ethers.constants.HashZero
    }

    match_data_param.voteCount++
    match_data_param.voteChallengeCount++

    // 管理员对用户投票数据进行签名
    admin_hash_user_vote = solidityAbiEncodeAndKeccak256(['bytes32', 'address', 'address', 'uint256', 'string', 'address', 'uint256'], [user_vote3.matchId, user_vote3.voter, user_vote3.votedNFT, user_vote3.votedTokenId, user_vote3.votedJPG, user_vote3.NFTOwner, user_vote3.votedAt])
    user_vote3.extraSignature = signMessageByWallet(admin_wallet, admin_hash_user_vote)

    // 用户对投票数据进行签名，包含管理员签名
    const hash_user_vote3 = solidityAbiEncodeAndKeccak256(['bytes32', 'address', 'address', 'uint256', 'string', 'address', 'uint256', 'bytes'], [user_vote3.matchId, user_vote3.voter, user_vote3.votedNFT, user_vote3.votedTokenId, user_vote3.votedJPG, user_vote3.NFTOwner, user_vote3.votedAt, user_vote3.extraSignature])
    const signed_hash_user_vote3 = signMessageByWallet(user3_wallet, hash_user_vote3)
    expect(recoverAddressFromSignedMessage(hash_user_vote3, signed_hash_user_vote3)).to.equal(user3_wallet.address)

    // 生成merkle tree
    leaves = MerkleTreeService.leavesLoadFromJson(ipfs_file_content)
    // console.log('leaves', leaves)
    leaves.push([signed_hash_user_vote3])

    merkle_tree_service = new MerkleTreeService(leaves, types)
    merkle_tree_service.setLastTreeUri(ipfs_file)

    ipfs_file_content = JSON.stringify(merkle_tree_service.dump())
    // console.log('ipfs_file_content 3', ipfs_file_content)
    ipfs_file = await saveAndUploadIPFS(ipfs_file_content)
    console.log('ipfs_file 3', ipfs_file)

    match_data_param.merkleTreeURI = ipfs_file
    match_data_param.merkleTreeRoot = merkle_tree_service.getRoot()
    // 管理员对merkle tree root进行签名
    const match_data_admin_hash3 = solidityAbiEncodeAndKeccak256(['bytes32', 'uint256', 'uint256', 'bytes', 'bytes', 'bytes32'], [match_data_param.matchId, match_data_param.voteArenaCount, match_data_param.voteChallengeCount, match_data_param.arenaOwnerSignature, match_data_param.challengeOwnerSignature, match_data_param.merkleTreeRoot])
    match_data_param.extraSignature = signMessageByWallet(admin_wallet, match_data_admin_hash3)

    console.log('match_data_param', match_data_param)

    // verify merkle tree
    const verify_merkle_tree_service = MerkleTreeService.load(ipfs_file_content)
    const verify_root = verify_merkle_tree_service.getRoot()
    console.log('verify_root', verify_root)
    expect(verify_root).to.equal(match_data_param.merkleTreeRoot)

    const verify_leaf = signed_hash_user_vote1
    const verify_proof = verify_merkle_tree_service.getProof([verify_leaf])
    console.log('verify_proof', verify_proof)

    const verify_result = verify_merkle_tree_service.verify([verify_leaf], verify_proof)
    console.log('verify_result', verify_result)
    expect(verify_result).to.equal(true)

    // 验证参与者的hash值是否正确
    const arena_hash_in_contract = await nft_battle_v2.hashMatchData(match_data_param.matchId, match_data_param.arenaNFT, match_data_param.arenaTokenId, match_data_param.arenaJPG, match_data_param.arenaOwner)
    expect(arena_hash).to.equal(arena_hash_in_contract)

    const challenge_hash_in_contract = await nft_battle_v2.hashMatchData(match_data_param.matchId, match_data_param.challengeNFT, match_data_param.challengeTokenId, match_data_param.challengeJPG, match_data_param.challengeOwner)
    expect(challenge_hash).to.equal(challenge_hash_in_contract)

    return match_data_param
}