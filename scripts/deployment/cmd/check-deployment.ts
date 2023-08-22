import {contract_l2_provider_getter} from "../../../helpers/providers/contract_provider_getter";
import {get_admin_wallet} from "../../../helpers/wallets/admin_wallet_getter";
import {
    AggressiveBid__factory,
    AggressiveBidDistribution__factory,
    AggressiveBidPool__factory,
    DistributionPolicyV1__factory,
    MagnifierNFT__factory,
    MagnifierNFTAirDrop__factory,
    NFTBattle__factory, NFTBattlePool__factory
} from "../../../typechain-types";
import AggressiveBid_data from "../../../contract-data/AggressiveBid-data";
import AggressiveBidDistribution_data from "../../../contract-data/AggressiveBidDistribution-data";
import {bnToNoPrecisionNumber} from "../../../helpers/contract/contract-utils";
import AggressiveBidPool_data from "../../../contract-data/AggressiveBidPool-data";
import NFTBattlePool_data from "../../../contract-data/NFTBattlePool-data";
import DistributionPolicyV1_data from "../../../contract-data/DistributionPolicyV1-data";
import Treasury_data from "../../../contract-data/Treasury-data";
import MagnifierNFT_data from "../../../contract-data/MagnifierNFT-data";
import MagnifierNFTAirDrop_data from "../../../contract-data/MagnifierNFTAirDrop-data";
import NFTBattle_data from "../../../contract-data/NFTBattle-data";
import CreateNFTContract_data from "../../../contract-data/CreateNFTContract-data";
import YsghPool_data from "../../../contract-data/YsghPool-data";

const provider = contract_l2_provider_getter()
const admin_wallet = get_admin_wallet(provider)

async function main() {
    const aggressive_bid = AggressiveBid__factory.connect(AggressiveBid_data.address, admin_wallet)

    let aggressive_bid_distribution_address = await aggressive_bid.aggressive_bid_distribution()
    if (aggressive_bid_distribution_address !=  AggressiveBidDistribution_data.address) {
        console.warn('aggressive_bid_distribution_address in aggressive_bid is not correct')
    }

    let aggressive_bid_pool_address = await aggressive_bid.aggressive_bid_pool()
    if (aggressive_bid_pool_address !=  AggressiveBidPool_data.address) {
        console.warn('aggressive_bid_pool_address in aggressive_bid is not correct')
    }

    let ysgh_pool_address = await aggressive_bid.ysgh_pool()
    if (ysgh_pool_address !=  YsghPool_data.address) {
        console.warn('ysgh_pool_address in aggressive_bid is not correct')
    }

    let verifier_address = await aggressive_bid.verifier_address()
    if (verifier_address !=  admin_wallet.address) {
        console.warn('verifier_address in aggressive_bid is not correct')
    }

    const aggressive_bid_distribution = AggressiveBidDistribution__factory.connect(AggressiveBidDistribution_data.address, admin_wallet)
    verifier_address = await aggressive_bid_distribution.verifier_address()
    if (verifier_address !=  admin_wallet.address) {
        console.warn('verifier_address in aggressive_bid_distribution is not correct')
    }

    const bid_royalty_rate = bnToNoPrecisionNumber(await aggressive_bid_distribution.bid_royalty_rate())
    const denominator = bnToNoPrecisionNumber(await aggressive_bid_distribution.denominator())
    if (bid_royalty_rate / denominator !=  0.0401) {
        console.warn('bid_royalty_rate in aggressive_bid_distribution is not equal 0.0401')
    }

    const aggressive_bid_pool = AggressiveBidPool__factory.connect(AggressiveBidPool_data.address, admin_wallet)
    let nft_battle_pool_address = await aggressive_bid_pool.nft_battle_pool()
    if (nft_battle_pool_address != NFTBattlePool_data.address) {
        console.warn('nft_battle_pool_address in aggressive_bid_pool is not correct')
    }

    let aggressive_bid_address = await aggressive_bid_pool.aggressive_bid()
    if (aggressive_bid_address != AggressiveBid_data.address) {
        console.warn('aggressive_bid_address in aggressive_bid_pool is not correct')
    }

    const distribution_police = DistributionPolicyV1__factory.connect(DistributionPolicyV1_data.address, admin_wallet)
    let treasury_address = await distribution_police.treasury()
    if (treasury_address != Treasury_data.address) {
        console.warn('treasury_address in distribution_police is not correct')
    }

    const magnifier = MagnifierNFT__factory.connect(MagnifierNFT_data.address, admin_wallet)
    let name = await magnifier.name()
    if (name != 'Magnifier NFT') {
        console.warn('name in magnifier is not correct')
    }
    let symbol = await magnifier.symbol()
    if (symbol != 'MAGNIFIER') {
        console.warn('symbol in magnifier is not correct')
    }
    let baseURI = await magnifier.baseURI()
    console.log('baseURI', baseURI)
    if (baseURI.indexOf('ipfs://') === -1) {
        console.warn('baseURI in magnifier is not correct')
    }
    let totalSupply = bnToNoPrecisionNumber(await magnifier['totalSupply()']())
    let totalSupply2 = bnToNoPrecisionNumber(await magnifier['totalSupply(uint256)'](0))
    if (totalSupply != totalSupply2) {
        console.warn('totalSupply in magnifier is not correct')
    }

    const magnifier_airdrop = MagnifierNFTAirDrop__factory.connect(MagnifierNFTAirDrop_data.address, admin_wallet)
    let magnifier_nft_address = await magnifier_airdrop.magnifier_nft()
    if (magnifier_nft_address != MagnifierNFT_data.address) {
        console.warn('magnifier_nft_address in magnifier_airdrop is not correct')
    }
    let magnifier_nft_token_id = bnToNoPrecisionNumber(await magnifier_airdrop.magnifier_nft_token_id())
    if (magnifier_nft_token_id != 0) {
        console.warn('magnifier_nft_token_id in magnifier_airdrop is not correct')
    }
    let refund_address = await magnifier_airdrop.refund_address()
    if (refund_address != admin_wallet.address) {
        console.warn('refund_address in magnifier_airdrop is not correct')
    }
    let balance_in_airdrop = bnToNoPrecisionNumber(await magnifier.balanceOf(magnifier_airdrop.address, 0))
    if (balance_in_airdrop != 100) {
        console.warn('balance_in_airdrop in magnifier_airdrop is not correct')
    }

    const nft_battle = NFTBattle__factory.connect(NFTBattle_data.address, admin_wallet)
    nft_battle_pool_address = await nft_battle.nft_battle_pool()
    if (nft_battle_pool_address != NFTBattlePool_data.address) {
        console.warn('nft_battle_pool_address in nft_battle is not correct')
    }
    let create_nft_contract_address = await nft_battle.create_nft_contract()
    if (create_nft_contract_address != CreateNFTContract_data.address) {
        console.warn('create_nft_contract_address in nft_battle is not correct')
    }
    verifier_address = await nft_battle.verifier_address()
    if (verifier_address != admin_wallet.address) {
        console.warn('verifier_address in nft_battle is not correct')
    }

    const nft_battle_pool = NFTBattlePool__factory.connect(NFTBattlePool_data.address, admin_wallet)
    let nft_battle_address = await nft_battle_pool.nft_battle_address()
    if (nft_battle_address != NFTBattle_data.address) {
        console.warn('nft_battle_address in nft_battle_pool is not correct')
    }
    aggressive_bid_pool_address = await nft_battle_pool.aggressive_bid_pool_address()
    if (aggressive_bid_pool_address != AggressiveBidPool_data.address) {
        console.warn('aggressive_bid_pool_address in nft_battle_pool is not correct')
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});