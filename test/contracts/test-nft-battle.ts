import {BigNumber, BigNumberish, BytesLike, Contract, ContractReceipt, ContractTransaction, Wallet} from "ethers";
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
    bnToNoPrecisionNumber, bnToNumber,
    getTransactionOptions,
    numberToBn,
    recoverAddressFromSignedMessage,
    setDefaultGasOptions, signMessageAndSplitByWallet,
    signMessageByWallet, sleep, solidityAbiEncode
} from "../../helpers/contract/contract-utils";
import CreationNFT_data from "../../contract-data/CreationNFT-data";
import {
    CreationNFT, CreationNFT__factory,
    NFTBattle,
    NFTBattle__factory, NFTBattlePool, NFTBattlePool__factory,
    TestMerkleTree,
    TestMerkleTree__factory
} from "../../typechain-types";
import NFTBattle_data from "../../contract-data/NFTBattle-data";
import {MerkleTreeService} from "../../libs/merkle-tree-service";
import TestMerkleTree_data from "../../contract-data/TestMerkleTree-data";
import {expect} from "chai";
import {nowTimestamp} from "../../helpers/utils";
// import {MatchStructs} from "../../typechain-types/NFTBattle";
import {keccak256} from "@ethersproject/keccak256";
import {sha256, solidityKeccak256} from "ethers/lib/utils";
import fs from "fs";
import {IpfsService} from "../../libs/ipfs-service";
import NFTBattlePool_data from "../../contract-data/NFTBattlePool-data";
import DistributionPolicyV1_data from "../../contract-data/DistributionPolicyV1-data";
import DistributionRoleParamsStruct = DistributionStructs.DistributionRoleParamsStruct;
import {DistributionStructs, MatchStructs as MatchStructs2} from "../../typechain-types/NFTBattle";
import UserVoteStruct = MatchStructs2.UserVoteStruct;
import {fetchToMatchData, fetchToNFTData, MatchData, NFTData} from "../../helpers/contract/structs";
import CreationNFTParamsStruct = DistributionStructs.CreationNFTParamsStruct;
import {UserStakeStructs} from "../../typechain-types/NFTBattlePool";
import ApprovalDataStruct = UserStakeStructs.ApprovalDataStruct;
import {deployCreationNFT} from "../../helpers/mock-functions";


let tx: ContractTransaction
let receipt: ContractReceipt
const provider = contract_l2_provider_getter()
const admin_wallet: Wallet = get_admin_wallet(provider)
const user1_wallet: Wallet = get_user_wallet_5712(provider)
const user2_wallet: Wallet = get_user_wallet_5AD8(provider)
const user3_wallet: Wallet = get_user_wallet_4871(provider)
let nft_battle: NFTBattle
let nft_battle_pool: NFTBattlePool
let test_merkle_tree: TestMerkleTree
let creation_nft: CreationNFT
let burn_to_address: string
const ipfs_service = new IpfsService()

before(async function () {
    await setDefaultGasOptions(provider)
    nft_battle = NFTBattle__factory.connect(NFTBattle_data.address, admin_wallet)
    console.log('nft_battle.address', nft_battle.address)

    nft_battle_pool = NFTBattlePool__factory.connect(NFTBattlePool_data.address, admin_wallet)
    console.log('nft_battle_pool.address', nft_battle_pool.address)
    burn_to_address = await nft_battle_pool.burn_to_address()

    test_merkle_tree = TestMerkleTree__factory.connect(TestMerkleTree_data.address, admin_wallet)
    console.log('test_merkle_tree.address', test_merkle_tree.address)

    creation_nft = CreationNFT__factory.connect(CreationNFT_data.address, admin_wallet)
    console.log('creation_nft.address', creation_nft.address)
})

describe("NFTBattle.sol testing", function () {
    this.timeout(20 * 60 * 1000);
    it('base test', async () => {
        const nft_battle_pool_address = await nft_battle.nft_battle_pool()
        console.log('nft_battle_pool_address', nft_battle_pool_address)
        expect(nft_battle_pool_address).to.equal(NFTBattlePool_data.address)
    })

    it('test determine()', async () => {
        const user1_nft_owner = user1_wallet.address
        const user2_nft_owner = user2_wallet.address
        const rs = await makeMatchData(user1_wallet, user2_wallet)
        const match_data = rs.match_data
        const user1_nft = rs.user1_nft
        const user2_nft = rs.user2_nft

        const user1_nft_battle_pool = NFTBattlePool__factory.connect(NFTBattlePool_data.address, user1_wallet)

        // 5) 结束比赛

        // const user2_signer = await nft_battle.getSigner(challenge_hash, match_data.challengeOwnerSignature)
        // console.log('user2_signer', user2_signer)
        // expect(user2_signer).to.equal(user2_nft_owner)

        expect(match_data.voteArenaCount != match_data.voteChallengeCount).to.equal(true)

        let winner_nft, winner_token_id, loser_nft, loser_token_id
        if (match_data.voteArenaCount > match_data.voteChallengeCount) {
            winner_nft = match_data.arenaNFT
            winner_token_id = match_data.arenaTokenId
            loser_nft = match_data.challengeNFT
            loser_token_id = match_data.challengeTokenId
        } else {
            winner_nft = match_data.challengeNFT
            winner_token_id = match_data.challengeTokenId
            loser_nft = match_data.arenaNFT
            loser_token_id = match_data.arenaTokenId
        }

        const old_winner_match_ids = await nft_battle.getNFTWonMatches(winner_nft, winner_token_id)
        console.log('old_winner_match_ids', old_winner_match_ids)

        const old_winner_ko_score = bnToNoPrecisionNumber(await nft_battle.getNFTKOScore(winner_nft, winner_token_id))
        console.log('old_winner_ko_score', old_winner_ko_score)

        const old_loser_ko_score = bnToNoPrecisionNumber(await nft_battle.getNFTKOScore(loser_nft, loser_token_id))
        console.log('old_loser_ko_score', old_loser_ko_score)

        console.log('wait for 10 seconds')
        await sleep(10000) // wait for 10 seconds
        // to redeem nft or not
        const redeem_nft = false
        tx = await nft_battle.determine(match_data, redeem_nft, getTransactionOptions())
        console.log('nft_battle.determine() tx', tx.hash)
        await tx.wait()

        // verify data
        const match_data_in_contract = fetchToMatchData(await nft_battle.getMatchData(match_data.matchId))
        console.log('match_data_in_contract', match_data_in_contract)
        expect(match_data_in_contract.matchId).to.equal(match_data.matchId)
        expect(match_data_in_contract.burnedAt).greaterThan(0)

        if (user2_nft) {
            const new_loser_nft_owner = await user2_nft.ownerOf(loser_token_id)
            console.log('new_loser_nft_owner', new_loser_nft_owner)
            expect(new_loser_nft_owner).to.equal(burn_to_address)
        }

        const new_winner_match_ids = await nft_battle.getNFTWonMatches(winner_nft, winner_token_id)
        console.log('new_winner_match_ids', new_winner_match_ids)
        expect(new_winner_match_ids.length).to.equal(old_winner_match_ids.length + 1)
        expect(new_winner_match_ids[new_winner_match_ids.length - 1]).to.equal(match_data.matchId)

        const new_winner_ko_score = bnToNoPrecisionNumber(await nft_battle.getNFTKOScore(winner_nft, winner_token_id))
        console.log('new_winner_ko_score', new_winner_ko_score)
        expect(new_winner_ko_score).to.equal(old_winner_ko_score + old_loser_ko_score + 1)

        if (redeem_nft) {
            const new_winner_nft_owner = await creation_nft.ownerOf(match_data.arenaTokenId)
            console.log('new_winner_nft_owner', new_winner_nft_owner)
            expect(new_winner_nft_owner).to.equal(user1_nft_owner)
        } else {
            const new_winner_nft_owner_in_pool = await user1_nft_battle_pool.getNFTOwner(match_data.arenaNFT, match_data.arenaTokenId)
            console.log('new_winner_nft_owner_in_pool', new_winner_nft_owner_in_pool)
            expect(new_winner_nft_owner_in_pool).to.equal(user1_nft_owner)
        }
    })

    it('test determineIncludeJPG()', async () => {
        const user1_nft_owner = user1_wallet.address
        const user2_nft_owner = user2_wallet.address
        const user1_jpg_ipfs = 'ipfs://QmbSHDFknsZGNk8N9LeRDpuRADAm5bvcxG6Sfrsa1tc9qi'
        const user2_jpg_ipfs = ''
        // to redeem nft or not
        const redeem_nft = false

        // 赢家是JPG
        const rs = await makeMatchData(user1_wallet, user2_wallet, user1_jpg_ipfs, user2_jpg_ipfs)
        const match_data = rs.match_data
        const user1_nft = rs.user1_nft
        const user2_nft = rs.user2_nft
        console.log('match_data', match_data)

        // 结束比赛
        expect(match_data.voteArenaCount != match_data.voteChallengeCount).to.equal(true)

        let winner_nft, winner_token_id, loser_nft, loser_token_id, winner_jpg, winner_owner, loser_jpg, loser_owner
        if (match_data.voteArenaCount > match_data.voteChallengeCount) {
            winner_jpg = match_data.arenaJPG
            winner_owner = match_data.arenaJPGOwner
            winner_nft = match_data.arenaNFT
            winner_token_id = match_data.arenaTokenId

            loser_jpg = match_data.challengeJPG
            loser_owner = match_data.challengeJPGOwner
            loser_nft = match_data.challengeNFT
            loser_token_id = match_data.challengeTokenId
        } else {
            winner_jpg = match_data.challengeJPG
            winner_owner = match_data.challengeJPGOwner
            winner_nft = match_data.challengeNFT
            winner_token_id = match_data.challengeTokenId

            loser_jpg = match_data.arenaJPG
            loser_owner = match_data.arenaJPGOwner
            loser_nft = match_data.arenaNFT
            loser_token_id = match_data.arenaTokenId
        }

        let creation_nft_params: CreationNFTParamsStruct
        if (winner_jpg != '') {
            creation_nft_params = {
                creator: winner_owner,
                name: 'test',
                symbol: 'test',
                baseURI: 'ipfs://...',
                distribution_role_params: {
                    original_element_creator: user1_wallet.address,
                    element_creators:[],
                    element_quote_element_creators:[],
                },
                distribution_policy_address: DistributionPolicyV1_data.address,
            }
        } else {
            creation_nft_params = {
                creator: ethers.constants.AddressZero,
                name: '',
                symbol: '',
                baseURI: '',
                distribution_role_params: {
                    original_element_creator: ethers.constants.AddressZero,
                    element_creators:[],
                    element_quote_element_creators:[],
                },
                distribution_policy_address: ethers.constants.AddressZero,
            }
        }

        console.log('wait for 10 seconds')
        await sleep(10000) // wait for 10 seconds

        tx = await nft_battle.determineIncludeJPG(match_data, creation_nft_params, redeem_nft, getTransactionOptions())
        console.log('nft_battle.determineIncludeJPG() tx', tx.hash)
        await tx.wait()

        // verify data
        const match_data_in_contract = fetchToMatchData(await nft_battle.getMatchData(match_data.matchId))
        console.log('match_data_in_contract', match_data_in_contract)
        expect(match_data_in_contract.matchId).to.equal(match_data.matchId)
        expect(match_data_in_contract.arenaNFT != ethers.constants.AddressZero).to.equal(true)
        expect(match_data_in_contract.burnedAt).greaterThan(0)

        if (match_data_in_contract.voteArenaCount > match_data_in_contract.voteChallengeCount) {
            winner_nft = match_data_in_contract.arenaNFT
            winner_token_id = match_data_in_contract.arenaTokenId
        } else {
            winner_nft = match_data_in_contract.challengeNFT
            winner_token_id = match_data_in_contract.challengeTokenId
        }

        const new_winner_match_ids = await nft_battle.getNFTWonMatches(winner_nft, winner_token_id)
        console.log('new_winner_match_ids', new_winner_match_ids)
        expect(new_winner_match_ids.length).to.equal( 1)
        expect(new_winner_match_ids[new_winner_match_ids.length - 1]).to.equal(match_data.matchId)

        let loser_ko_score = 0
        if (loser_nft != ethers.constants.AddressZero) {
            loser_ko_score = bnToNoPrecisionNumber(await nft_battle.getNFTKOScore(loser_nft, loser_token_id))
        }
        console.log('loser_ko_score', loser_ko_score)

        const new_winner_ko_score = bnToNoPrecisionNumber(await nft_battle.getNFTKOScore(winner_nft, winner_token_id))
        console.log('new_winner_ko_score', new_winner_ko_score)
        expect(new_winner_ko_score).to.equal(loser_ko_score + 1)

        if (redeem_nft) {
            const winner_creattion_nft = CreationNFT__factory.connect(winner_nft, user1_wallet)
            const new_winner_nft_owner = await winner_creattion_nft.ownerOf(winner_token_id)
            console.log('new_winner_nft_owner', new_winner_nft_owner)
            expect(new_winner_nft_owner).to.equal(user1_nft_owner)
        } else {
            const new_winner_nft_owner_in_pool = await nft_battle_pool.getNFTOwner(match_data_in_contract.arenaNFT, match_data_in_contract.arenaTokenId)
            console.log('new_winner_nft_owner_in_pool', new_winner_nft_owner_in_pool)
            expect(new_winner_nft_owner_in_pool).to.equal(user1_nft_owner)
        }

        if (user2_nft) {
            const new_loser_nft_owner = await user2_nft.ownerOf(loser_token_id)
            console.log('new_loser_nft_owner', new_loser_nft_owner)
            expect(new_loser_nft_owner).to.equal(burn_to_address)
        }

    })

    it('test determineIncludeJPGBySys()', async () => {
        const user1_nft_owner = user1_wallet.address
        const user2_nft_owner = user2_wallet.address
        const user1_jpg_ipfs = 'ipfs://QmbSHDFknsZGNk8N9LeRDpuRADAm5bvcxG6Sfrsa1tc9qi'
        const user2_jpg_ipfs = ''
        // to redeem nft or not
        const redeem_nft = false

        // 赢家是JPG
        const rs = await makeMatchData(user1_wallet, user2_wallet, user1_jpg_ipfs, user2_jpg_ipfs)
        const match_data = rs.match_data
        const user1_nft = rs.user1_nft
        const user2_nft = rs.user2_nft
        console.log('match_data', match_data)

        // 结束比赛
        expect(match_data.voteArenaCount != match_data.voteChallengeCount).to.equal(true)

        let winner_nft, winner_token_id, loser_nft, loser_token_id, winner_jpg, winner_owner, loser_jpg, loser_owner
        let winner, loser
        if (match_data.voteArenaCount > match_data.voteChallengeCount) {
            winner = user1_wallet
            winner_jpg = match_data.arenaJPG
            winner_owner = match_data.arenaJPGOwner
            winner_nft = match_data.arenaNFT
            winner_token_id = match_data.arenaTokenId

            loser = user2_wallet
            loser_jpg = match_data.challengeJPG
            loser_owner = match_data.challengeJPGOwner
            loser_nft = match_data.challengeNFT
            loser_token_id = match_data.challengeTokenId
        } else {
            winner = user2_wallet
            winner_jpg = match_data.challengeJPG
            winner_owner = match_data.challengeJPGOwner
            winner_nft = match_data.challengeNFT
            winner_token_id = match_data.challengeTokenId

            loser = user1_wallet
            loser_jpg = match_data.arenaJPG
            loser_owner = match_data.arenaJPGOwner
            loser_nft = match_data.arenaNFT
            loser_token_id = match_data.arenaTokenId
        }

        let creation_nft_params: CreationNFTParamsStruct
        if (winner_jpg != '') {
            creation_nft_params = {
                creator: winner_owner,
                name: 'test',
                symbol: 'test',
                baseURI: 'ipfs://...',
                distribution_role_params: {
                    original_element_creator: user1_wallet.address,
                    element_creators:[],
                    element_quote_element_creators:[],
                },
                distribution_policy_address: DistributionPolicyV1_data.address,
            }
        } else {
            creation_nft_params = {
                creator: ethers.constants.AddressZero,
                name: '',
                symbol: '',
                baseURI: '',
                distribution_role_params: {
                    original_element_creator: ethers.constants.AddressZero,
                    element_creators:[],
                    element_quote_element_creators:[],
                },
                distribution_policy_address: ethers.constants.AddressZero,
            }
        }

        console.log('wait for 10 seconds')
        await sleep(10000) // wait for 10 seconds
        tx = await nft_battle.determineIncludeJPGBySys(match_data, creation_nft_params, getTransactionOptions())
        console.log('nft_battle.determineIncludeJPGBySys() tx', tx.hash)
        await tx.wait()

        // verify data
        const match_data_in_contract = fetchToMatchData(await nft_battle.getMatchData(match_data.matchId))
        console.log('match_data_in_contract', match_data_in_contract)
        expect(match_data_in_contract.matchId).to.equal(match_data.matchId)
        expect(match_data_in_contract.arenaNFT != ethers.constants.AddressZero).to.equal(true)
        expect(match_data_in_contract.burnedAt).greaterThan(0)

        if (match_data_in_contract.voteArenaCount > match_data_in_contract.voteChallengeCount) {
            winner_nft = match_data_in_contract.arenaNFT
            winner_token_id = match_data_in_contract.arenaTokenId
        } else {
            winner_nft = match_data_in_contract.challengeNFT
            winner_token_id = match_data_in_contract.challengeTokenId
        }

        const new_winner_match_ids = await nft_battle.getNFTWonMatches(winner_nft, winner_token_id)
        console.log('new_winner_match_ids', new_winner_match_ids)
        expect(new_winner_match_ids.length).to.equal( 1)
        expect(new_winner_match_ids[new_winner_match_ids.length - 1]).to.equal(match_data.matchId)

        let loser_ko_score = 0
        if (loser_nft != ethers.constants.AddressZero) {
            loser_ko_score = bnToNoPrecisionNumber(await nft_battle.getNFTKOScore(loser_nft, loser_token_id))
        }
        console.log('loser_ko_score', loser_ko_score)

        const new_winner_ko_score = bnToNoPrecisionNumber(await nft_battle.getNFTKOScore(winner_nft, winner_token_id))
        console.log('new_winner_ko_score', new_winner_ko_score)
        expect(new_winner_ko_score).to.equal(loser_ko_score + 1)

        if (user2_nft) {
            const new_loser_nft_owner = await user2_nft.ownerOf(loser_token_id)
            console.log('new_loser_nft_owner', new_loser_nft_owner)
            expect(new_loser_nft_owner).to.equal(burn_to_address)
        }
        // 冻结的NFT不可以赎回
        const winner_nft_battle_pool = NFTBattlePool__factory.connect(NFTBattlePool_data.address, winner)

        try {
            tx = await winner_nft_battle_pool.redeem(winner_nft, winner_token_id, getTransactionOptions())
            console.log('nft_battle_pool.redeem() tx', tx.hash)
            await tx.wait()
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
        console.log('nft_battle_pool.unfreezeNFT() tx', tx.hash)
        await tx.wait()

        const new_winner_user_staked_data2: NFTData = fetchToNFTData(await nft_battle_pool.getUserStakedData(winner.address, winner_nft, winner_token_id))
        console.log('new_winner_user_staked_data2', new_winner_user_staked_data2)
        if (redeem_nft) {
            expect(new_winner_user_staked_data2.amount).to.equal(0)

            const winner_nft_contract = CreationNFT__factory.connect(winner_nft, winner)
            const winner_nft_owner = await winner_nft_contract.ownerOf(winner_token_id)
            console.log('winner_nft_owner', winner_nft_owner)
            expect(winner_nft_owner).to.equal(winner.address)
        } else {
            expect(new_winner_user_staked_data2.amount).to.equal(1)
            expect(new_winner_user_staked_data2.isFrozen).to.equal(false)
            expect(new_winner_user_staked_data2.beneficiaryAddress).to.equal(ethers.constants.AddressZero)
        }

        const new_admin_eth_balance = bnToNumber(await admin_wallet.getBalance())
        console.log('new_admin_eth_balance', new_admin_eth_balance)
        expect(amount_equal_in_precision(new_admin_eth_balance, old_admin_eth_balance + eth_amount)).to.equal(true)


    })

    it('test determineBySys()', async () => {
        const user1_nft_owner = user1_wallet.address
        const user2_nft_owner = user2_wallet.address
        const rs = await makeMatchData(user1_wallet, user2_wallet)
        const match_data = rs.match_data
        const user1_nft = rs.user1_nft
        const user2_nft = rs.user2_nft

        let winner, winner_nft, winner_token_id, loser, loser_nft, loser_token_id
        if (match_data.voteArenaCount > match_data.voteChallengeCount) {
            winner = user1_wallet
            winner_nft = match_data.arenaNFT
            winner_token_id = match_data.arenaTokenId
            loser = user2_wallet
            loser_nft = match_data.challengeNFT
            loser_token_id = match_data.challengeTokenId
        } else {
            winner = user2_wallet
            winner_nft = match_data.challengeNFT
            winner_token_id = match_data.challengeTokenId
            loser = user1_wallet
            loser_nft = match_data.arenaNFT
            loser_token_id = match_data.arenaTokenId
        }

        const old_winner_user_staked_data: NFTData = fetchToNFTData(await nft_battle_pool.getUserStakedData(winner.address, winner_nft, winner_token_id))
        console.log('old_winner_user_staked_data', old_winner_user_staked_data)
        expect(old_winner_user_staked_data.amount).to.equal(1)
        expect(old_winner_user_staked_data.isFrozen).to.equal(false)
        expect(old_winner_user_staked_data.beneficiaryAddress).to.equal(ethers.constants.AddressZero)

        // 5) 由系统决定胜负，冻结胜利者的NFT
        console.log('wait for 10 seconds')
        await sleep(10000) // wait for 10 seconds

        tx = await nft_battle.determineBySys(match_data, getTransactionOptions())
        console.log('nft_battle.determineBySys() tx', tx.hash)
        await tx.wait()

        const new_winner_user_staked_data: NFTData = fetchToNFTData(await nft_battle_pool.getUserStakedData(winner.address, winner_nft, winner_token_id))
        console.log('new_winner_user_staked_data', new_winner_user_staked_data)
        expect(new_winner_user_staked_data.amount).to.equal(1)
        expect(new_winner_user_staked_data.isFrozen).to.equal(true)
        expect(new_winner_user_staked_data.beneficiaryAddress).to.equal(admin_wallet.address)

        // 6) 解冻胜利者的NFT
        // 冻结的NFT不可以赎回
        const winner_nft_battle_pool = NFTBattlePool__factory.connect(NFTBattlePool_data.address, winner)

        try {
            tx = await winner_nft_battle_pool.redeem(winner_nft, winner_token_id, getTransactionOptions())
            console.log('nft_battle_pool.redeem() tx', tx.hash)
            await tx.wait()
            expect(false).to.equal(true)
        } catch (error : any) {
            // console.log('error', error)
            expect(error.code).to.equal('CALL_EXCEPTION')
        }

        const eth_amount = 0.01
        const tx_data = {...getTransactionOptions(), value: numberToBn(eth_amount)}
        const nft_redeem = true

        const old_admin_eth_balance = bnToNumber(await admin_wallet.getBalance())
        console.log('old_admin_eth_balance', old_admin_eth_balance)

        tx = await winner_nft_battle_pool.unfreezeNFT(winner_nft, winner_token_id, nft_redeem, tx_data)
        console.log('nft_battle_pool.unfreezeNFT() tx', tx.hash)
        await tx.wait()

        const new_winner_user_staked_data2: NFTData = fetchToNFTData(await nft_battle_pool.getUserStakedData(winner.address, winner_nft, winner_token_id))
        console.log('new_winner_user_staked_data2', new_winner_user_staked_data2)
        if (nft_redeem) {
            expect(new_winner_user_staked_data2.amount).to.equal(0)

            const winner_nft_contract = CreationNFT__factory.connect(winner_nft, winner)
            const winner_nft_owner = await winner_nft_contract.ownerOf(winner_token_id)
            console.log('winner_nft_owner', winner_nft_owner)
            expect(winner_nft_owner).to.equal(winner.address)
        } else {
            expect(new_winner_user_staked_data2.amount).to.equal(1)
            expect(new_winner_user_staked_data2.isFrozen).to.equal(false)
            expect(new_winner_user_staked_data2.beneficiaryAddress).to.equal(ethers.constants.AddressZero)
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
    console.log('ipfs_file', ipfs_file)
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

const makeMatchData = async (user1_wallet:Wallet, user2_wallet:Wallet, arenaJPG='', challengeJPG=''): Promise<{
    match_data: MatchData
    user1_nft: CreationNFT|Contract|null
    user2_nft: CreationNFT|Contract|null
}> => {

    console.log('participant1 address', user1_wallet.address)
    console.log('participant2 address', user2_wallet.address)

    const method_name_hash = solidityKeccak256(['string'], ['Permit(address owner,address spender,uint256 tokenId,uint256 nonce,uint256 deadline)'])
    const spender = NFTBattlePool_data.address
    const deadline = nowTimestamp() + 60*3
    const user1_nft_token_id = 0
    const user2_nft_token_id = 0

    let user1_nft = null
    if (arenaJPG == '') {
        // 创建二创NFT进行对战
        user1_nft = await deployCreationNFT(user1_wallet, 'user1_nft', 'user1_nft', 'ipfs://', {
            original_element_creator: ethers.constants.AddressZero,
            element_creators: [],
            element_quote_element_creators: []
        });
        console.log('user1_nft.address', user1_nft.address)

        // 质押到pool合约里面

        const user1_nft_owner = user1_wallet.address
        const nonce = await creation_nft.nonces(user1_nft_owner)

        const user1_hash = keccak256(solidityAbiEncode(['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'], [method_name_hash, user1_nft_owner, spender, user1_nft_token_id, nonce, deadline]))
        const user1_signature = signMessageAndSplitByWallet(user1_wallet, user1_hash)
        let r = user1_signature.r
        let v = user1_signature.v
        let s = user1_signature.s

        const user1_approval_data: ApprovalDataStruct = {
            userAddress: user1_nft_owner,
            spender: spender,
            tokenId: numberToBn(user1_nft_token_id, 0),
            nonce: nonce,
            deadline: numberToBn(deadline, 0),
            r: r,
            s: s,
            v: v
        }

        const user1_nft_battle_pool = NFTBattlePool__factory.connect(NFTBattlePool_data.address, user1_wallet)
        tx = await user1_nft_battle_pool.stake(user1_nft.address, user1_approval_data, getTransactionOptions())
        console.log('user1_nft_battle_pool.stake() tx', tx.hash)
        await tx.wait()

        const user1_nft_owner_in_contract = await user1_nft_battle_pool.getNFTOwner(user1_nft.address, user1_nft_token_id)
        console.log('user1_nft_owner_in_contract', user1_nft_owner_in_contract)
        expect(user1_nft_owner_in_contract).to.equal(user1_nft_owner)
    }

    let user2_nft = null
    if (challengeJPG == '') {
        // 与上面的一样流程
        const user2_nft_owner = user2_wallet.address
        const nonce = await creation_nft.nonces(user2_nft_owner)

        user2_nft = await deployCreationNFT(user2_wallet, 'user2_nft', 'user2_nft', 'ipfs://', {
            original_element_creator: ethers.constants.AddressZero,
            element_creators: [],
            element_quote_element_creators: []
        })
        console.log('user2_nft.address', user2_nft.address)

        const user2_hash = keccak256(solidityAbiEncode(['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'], [method_name_hash, user2_nft_owner, spender, user2_nft_token_id, nonce, deadline]))
        const user2_signature = signMessageAndSplitByWallet(user2_wallet, user2_hash)
        let r = user2_signature.r
        let v = user2_signature.v
        let s = user2_signature.s

        const user2_approval_data: ApprovalDataStruct = {
            userAddress: user2_nft_owner,
            spender: spender,
            tokenId: numberToBn(user2_nft_token_id, 0),
            nonce: nonce,
            deadline: numberToBn(deadline, 0),
            r: r,
            s: s,
            v: v
        }

        const user2_nft_battle_pool = NFTBattlePool__factory.connect(NFTBattlePool_data.address, user2_wallet)
        tx = await user2_nft_battle_pool.stake(user2_nft.address, user2_approval_data, getTransactionOptions())
        console.log('user2_nft_battle_pool.stake() tx', tx.hash)
        await tx.wait()

        const user2_nft_owner_in_contract = await user2_nft_battle_pool.getNFTOwner(user2_nft.address, user2_nft_token_id)
        console.log('user2_nft_owner_in_contract', user2_nft_owner_in_contract)
        expect(user2_nft_owner_in_contract).to.equal(user2_nft_owner)
    }

    // 3) 创建比赛数据
    const match_data: MatchData = {
        matchId: ethers.constants.HashZero,
        matchListTime: nowTimestamp(),
        matchStartTime: 0,
        matchEndTime: 0,
        voteCount: 0,
        voteArenaCount: 0,
        voteChallengeCount: 0,
        arenaJPG: arenaJPG != '' ? arenaJPG : '',
        arenaJPGOwner: arenaJPG != '' ? user1_wallet.address : ethers.constants.AddressZero,
        arenaNFT: user1_nft ? user1_nft.address : ethers.constants.AddressZero,
        arenaTokenId: user1_nft_token_id,
        arenaOwnerSignature: '',
        challengeJPG: challengeJPG != '' ? challengeJPG : '',
        challengeJPGOwner: challengeJPG != '' ? user2_wallet.address : ethers.constants.AddressZero,
        challengeNFT: user2_nft ? user2_nft.address : ethers.constants.AddressZero,
        challengeTokenId: user2_nft_token_id,
        challengeOwnerSignature: '',
        extraSignature: ethers.constants.HashZero,
        merkleTreeURI: '',
        merkleTreeRoot: ethers.constants.HashZero,
        burnedAt: 0
    }

    const match_id:string = solidityKeccak256(['uint256', 'string', 'address', 'address', 'uint256' ], [match_data.matchListTime, match_data.arenaJPG, match_data.arenaJPGOwner, match_data.arenaNFT, match_data.arenaTokenId])
    console.log('match_id', match_id)

    match_data.matchId = match_id

    const arena_hash = keccak256(keccak256(solidityAbiEncode(['bytes32', 'uint256', 'uint256', 'uint256', 'address', 'uint256', 'string', 'address'], [match_data.matchId, match_data.matchListTime, match_data.matchStartTime, match_data.matchEndTime, match_data.arenaNFT, match_data.arenaTokenId, match_data.arenaJPG, match_data.arenaJPGOwner])))
    match_data.arenaOwnerSignature = signMessageByWallet(user1_wallet, arena_hash)

    // 开始比赛
    match_data.matchStartTime = nowTimestamp()
    match_data.matchEndTime = nowTimestamp() +  10
    const challenge_hash = keccak256(keccak256(solidityAbiEncode(['bytes32', 'uint256', 'uint256', 'uint256', 'address', 'uint256', 'string', 'address'], [match_data.matchId, match_data.matchListTime, match_data.matchStartTime, match_data.matchEndTime, match_data.challengeNFT, match_data.challengeTokenId, match_data.challengeJPG, match_data.challengeJPGOwner])))
    match_data.challengeOwnerSignature = signMessageByWallet(user2_wallet, challenge_hash)
    console.log('match_data', match_data)

    // 检查签名
    const [arena_sign, challenge_sign] = await nft_battle.checkArenaAndChallengeSignatures(match_data)
    console.log('arena_sign', arena_sign)
    console.log('challenge_sign', challenge_sign)
    expect(arena_sign).to.equal(true)
    expect(challenge_sign).to.equal(true)

    // 4) 投票
    // 第一个人投票
    let voter = user1_wallet.address
    const user_vote: UserVoteStruct = {
        matchId: match_id,
        voter: voter,
        votedNFT: match_data.arenaNFT,
        votedTokenId: numberToBn(match_data.arenaTokenId, 0).toString(),
        votedJPG: match_data.arenaJPG,
        votedJPGOwner: match_data.arenaJPGOwner,
        votedAt: numberToBn(nowTimestamp(), 0).toString(),
        extraSignature: ethers.constants.HashZero
    }

    match_data.voteCount++
    match_data.voteArenaCount++

    const types = ['bytes']

    console.log('user_vote', user_vote)
    let admin_hash_user_vote = MerkleTreeService.generateHashedLeaf([user_vote.matchId, user_vote.voter, user_vote.votedNFT, user_vote.votedTokenId, user_vote.votedJPG, user_vote.votedJPGOwner, user_vote.votedAt], ['bytes32', 'address', 'address', 'uint256', 'string', 'address', 'uint256'])
    // console.log('admin_hash_user_vote', admin_hash_user_vote)

    const hh = solidityAbiEncode(['bytes32', 'address', 'address', 'uint256', 'string', 'address', 'uint256'], [user_vote.matchId, user_vote.voter, user_vote.votedNFT, user_vote.votedTokenId, user_vote.votedJPG, user_vote.votedJPGOwner, user_vote.votedAt])
    // console.log('hh', hh)
    const admin_hash_user_vote2 = keccak256(keccak256(hh))
    // console.log('admin_hash_user_vote2', admin_hash_user_vote2)
    expect(admin_hash_user_vote).to.equal(admin_hash_user_vote2)

    user_vote.extraSignature = signMessageByWallet(admin_wallet, admin_hash_user_vote)

    console.log('user_vote', user_vote)

    const hash_user_vote1 = MerkleTreeService.hashUserVote(user_vote)
    const hash_user_vote1_in_contract = await nft_battle.getUserVoteHash(user_vote)
    expect(hash_user_vote1).to.equal(hash_user_vote1_in_contract)

    const signed_hash_user_vote1 = signMessageByWallet(user1_wallet, hash_user_vote1)
    expect(recoverAddressFromSignedMessage(hash_user_vote1, signed_hash_user_vote1)).to.equal(user1_wallet.address)

    let rs = await nft_battle.checkUserVote(user_vote, signed_hash_user_vote1)
    console.log('rs', rs)
    expect(rs).to.equal(true)

    let leaves: string | any[] = []
    leaves = [[signed_hash_user_vote1]]

    let merkle_tree_service = new MerkleTreeService(leaves, types)

    let ipfs_file_content = JSON.stringify(merkle_tree_service.dump())
    // console.log('ipfs_file_content', ipfs_file_content)

    let ipfs_file = await saveAndUploadIPFS(ipfs_file_content)
    console.log('ipfs_file', ipfs_file)

    match_data.merkleTreeURI = ipfs_file
    match_data.merkleTreeRoot = merkle_tree_service.getRoot()
    match_data.extraSignature = signMessageByWallet(admin_wallet, match_data.merkleTreeRoot)

    // 第二个人投票
    voter = user2_wallet.address
    const user_vote2: UserVoteStruct = {
        matchId: match_id,
        voter: voter,
        votedNFT: match_data.arenaNFT,
        votedTokenId: numberToBn(match_data.arenaTokenId),
        votedJPG: match_data.arenaJPG,
        votedJPGOwner: match_data.arenaJPGOwner,
        votedAt: numberToBn(nowTimestamp(), 0),
        extraSignature: ethers.constants.HashZero
    }

    match_data.voteCount++
    match_data.voteArenaCount++

    admin_hash_user_vote = MerkleTreeService.generateHashedLeaf([user_vote2.matchId, user_vote2.voter, user_vote2.votedNFT, user_vote2.votedTokenId, user_vote2.votedJPG, user_vote2.votedJPGOwner, user_vote2.votedAt], ['bytes32', 'address', 'address', 'uint256', 'string', 'address', 'uint256'])
    user_vote2.extraSignature = signMessageByWallet(admin_wallet, admin_hash_user_vote)

    const hash_user_vote2 = MerkleTreeService.hashUserVote(user_vote2)
    const signed_hash_user_vote2 = signMessageByWallet(user2_wallet, hash_user_vote2)
    expect(recoverAddressFromSignedMessage(hash_user_vote2, signed_hash_user_vote2)).to.equal(user2_wallet.address)

    rs = await nft_battle.checkUserVote(user_vote2, signed_hash_user_vote2)
    // console.log('rs', rs)
    expect(rs).to.equal(true)

    leaves = MerkleTreeService.leavesLoadFromJson(ipfs_file_content)
    leaves.push([signed_hash_user_vote2])

    merkle_tree_service = new MerkleTreeService(leaves, types)
    merkle_tree_service.setLastTreeUri(ipfs_file)

    ipfs_file_content = JSON.stringify(merkle_tree_service.dump())
    // console.log('ipfs_file_content 2', ipfs_file_content)
    ipfs_file = await saveAndUploadIPFS(ipfs_file_content)
    console.log('ipfs_file 2', ipfs_file)

    match_data.merkleTreeURI = ipfs_file
    match_data.merkleTreeRoot = merkle_tree_service.getRoot()
    match_data.extraSignature = signMessageByWallet(admin_wallet, match_data.merkleTreeRoot)

    // 第三个人投票
    voter = user3_wallet.address

    const user_vote3 = {
        matchId: match_id,
        voter: voter,
        votedNFT: match_data.challengeNFT,
        votedTokenId: numberToBn(match_data.challengeTokenId),
        votedJPG: match_data.challengeJPG,
        votedJPGOwner: match_data.challengeJPGOwner,
        votedAt: numberToBn(nowTimestamp(), 0),
        extraSignature: ethers.constants.HashZero
    }

    match_data.voteCount++
    match_data.voteChallengeCount++

    admin_hash_user_vote = MerkleTreeService.generateHashedLeaf([user_vote3.matchId, user_vote3.voter, user_vote3.votedNFT, user_vote3.votedTokenId, user_vote3.votedJPG, user_vote3.votedJPGOwner, user_vote3.votedAt], ['bytes32', 'address', 'address', 'uint256', 'string', 'address', 'uint256'])
    user_vote3.extraSignature = signMessageByWallet(admin_wallet, admin_hash_user_vote)

    const hash_user_vote3 = MerkleTreeService.hashUserVote(user_vote3)
    const signed_hash_user_vote3 = signMessageByWallet(user3_wallet, hash_user_vote3)
    expect(recoverAddressFromSignedMessage(hash_user_vote3, signed_hash_user_vote3)).to.equal(user3_wallet.address)

    leaves = MerkleTreeService.leavesLoadFromJson(ipfs_file_content)
    // console.log('leaves', leaves)
    leaves.push([signed_hash_user_vote3])

    merkle_tree_service = new MerkleTreeService(leaves, types)
    merkle_tree_service.setLastTreeUri(ipfs_file)

    ipfs_file_content = JSON.stringify(merkle_tree_service.dump())
    // console.log('ipfs_file_content 3', ipfs_file_content)
    ipfs_file = await saveAndUploadIPFS(ipfs_file_content)
    console.log('ipfs_file 3', ipfs_file)

    match_data.merkleTreeURI = ipfs_file
    match_data.merkleTreeRoot = merkle_tree_service.getRoot()
    match_data.extraSignature = signMessageByWallet(admin_wallet, match_data.merkleTreeRoot)

    console.log('match_data', match_data)

    // verify merkle tree
    const verify_merkle_tree_service = MerkleTreeService.load(ipfs_file_content)
    const verify_root = verify_merkle_tree_service.getRoot()
    console.log('verify_root', verify_root)
    expect(verify_root).to.equal(match_data.merkleTreeRoot)

    const verify_leaf = signed_hash_user_vote1
    const verify_proof = verify_merkle_tree_service.getProof([verify_leaf])
    console.log('verify_proof', verify_proof)

    const verify_result = verify_merkle_tree_service.verify([verify_leaf], verify_proof)
    console.log('verify_result', verify_result)
    expect(verify_result).to.equal(true)

    const arena_hash_in_contract = await nft_battle.hashMatchData(match_data.matchId, match_data.matchListTime, 0, 0, match_data.arenaNFT, match_data.arenaTokenId, match_data.arenaJPG, match_data.arenaJPGOwner)
    expect(arena_hash).to.equal(arena_hash_in_contract)

    // const user1_signer = await nft_battle.getSigner(arena_hash, match_data.arenaOwnerSignature)
    // console.log('user1_signer', user1_signer)
    // expect(user1_signer).to.equal(user1_nft_owner)

    // const user1_signer_by_match_data = await nft_battle.getSignerFromMatchData(match_data)
    // console.log('user1_signer_by_match_data', user1_signer_by_match_data)
    // expect(user1_signer_by_match_data).to.equal(user1_nft_owner)
    //
    // const rs = await nft_battle.checkSign(arena_hash,user1_nft_owner, match_data.arenaOwnerSignature)
    // console.log('rs', rs)

    const challenge_hash_in_contract = await nft_battle.hashMatchData(match_data.matchId, match_data.matchListTime, match_data.matchStartTime, match_data.matchEndTime, match_data.challengeNFT, match_data.challengeTokenId, match_data.challengeJPG, match_data.challengeJPGOwner)
    expect(challenge_hash).to.equal(challenge_hash_in_contract)

    return {
        match_data: match_data,
        user1_nft: user1_nft,
        user2_nft: user2_nft
    }
}