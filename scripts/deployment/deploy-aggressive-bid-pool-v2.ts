import {contract_l2_provider_getter} from "../../helpers/providers/contract_provider_getter";
import {get_admin_wallet} from "../../helpers/wallets/admin_wallet_getter";
import {
    bnToNumber,
    getGasUsedAndGasPriceFromReceipt,
    getTransactionOptions,
    setDefaultGasOptions
} from "../../helpers/contract/contract-utils";
import {ethers} from "hardhat";
import {deploy_proxy_contract} from "../../helpers/contract/deploy-proxy-contract-to-files";
import NFTBattlePoolV2_data from "../../contract-data/NFTBattlePoolV2-data";
import AggressiveBid_data from "../../contract-data/AggressiveBid-data";

const provider = contract_l2_provider_getter()
const admin_wallet = get_admin_wallet(provider)
const contract_name = 'AggressiveBidPoolV2'

async function main() {
    await setDefaultGasOptions(provider)

    console.log('eth balance', bnToNumber(await admin_wallet.getBalance()))

    const initialize_function = 'initialize(address)'
    const [new_contract, new_contract_proxy_contract] = await deploy_proxy_contract(contract_name, admin_wallet, initialize_function, [NFTBattlePoolV2_data.address])

    console.log(contract_name, 'was deployed on implement address', new_contract.address, 'and proxy address', new_contract_proxy_contract.address);

    const aggressive_bid_address = await new_contract_proxy_contract.aggressive_bid()
    if (AggressiveBid_data.address != '' && aggressive_bid_address !== AggressiveBid_data.address) {
        const tx = await new_contract_proxy_contract.setAggressiveBid(AggressiveBid_data.address, getTransactionOptions())
        console.log('setAggressiveBid() tx:', tx.hash)
        const receipt = await tx.wait()
        console.log('setAggressiveBid() gas used', getGasUsedAndGasPriceFromReceipt(receipt))
    }

    const nft_battle_pool_v2 = await ethers.getContractAt('NFTBattlePoolV2', NFTBattlePoolV2_data.address, admin_wallet)
    const aggressive_bid_pool_address_in_nft_battle_pool = await nft_battle_pool_v2.aggressive_bid_pool_address()
    if (aggressive_bid_pool_address_in_nft_battle_pool !== new_contract_proxy_contract.address) {
        const tx = await nft_battle_pool_v2.setAggressiveBidPool(new_contract_proxy_contract.address, getTransactionOptions())
        console.log('nft_battle_pool_v2.setAggressiveBidPool() tx:', tx.hash)
        const receipt = await tx.wait()
        console.log('nft_battle_pool_v2.setAggressiveBidPool() gas used', getGasUsedAndGasPriceFromReceipt(receipt))
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});