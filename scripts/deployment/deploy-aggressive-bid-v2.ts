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
import NFTBattle_data from "../../contract-data/NFTBattle-data";
import NFTBattlePool_data from "../../contract-data/NFTBattlePool-data";
import AggressiveBid_data from "../../contract-data/AggressiveBid-data";
import AggressiveBidPool_data from "../../contract-data/AggressiveBidPool-data";
import AggressiveBidDistribution_data from "../../contract-data/AggressiveBidDistribution-data";
import YsghPool_data from "../../contract-data/YsghPool-data";
import AggressiveBidPoolV2_data from "../../contract-data/AggressiveBidPoolV2-data";

const provider = contract_l2_provider_getter()
const admin_wallet = get_admin_wallet(provider)
const contract_name = 'AggressiveBidV2'

async function main() {
    await setDefaultGasOptions(provider)

    console.log('eth balance', bnToNumber(await admin_wallet.getBalance()))

    const initialize_function = 'initialize(address,address,address)'
    const [new_contract, new_contract_proxy_contract] = await deploy_proxy_contract(contract_name, admin_wallet, initialize_function, [AggressiveBidDistribution_data.address, YsghPool_data.address, AggressiveBidPoolV2_data.address])

    console.log(contract_name, 'was deployed on implement address', new_contract.address, 'and proxy address', new_contract_proxy_contract.address);

    const tx = await new_contract_proxy_contract.updateTransferFeeFromAggressiveBidDistribution( getTransactionOptions())
    console.log('updateTransferFeeFromAggressiveBidDistribution() tx:', tx.hash)
    const receipt = await tx.wait()
    console.log('updateTransferFeeFromAggressiveBidDistribution() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

    const verifier_address = await new_contract_proxy_contract.verifier_address()
    if (verifier_address !== admin_wallet.address) {
        const tx = await new_contract_proxy_contract.setVerifierAddress(admin_wallet.address, getTransactionOptions())
        console.log('setVerifier() tx:', tx.hash)
        const receipt = await tx.wait()
        console.log('setVerifier() gas used', getGasUsedAndGasPriceFromReceipt(receipt))
    }

    const aggressive_bid_pool_v2 = await ethers.getContractAt('AggressiveBidPoolV2', AggressiveBidPoolV2_data.address, admin_wallet)
    const aggressive_bid_address_in_pool = await aggressive_bid_pool_v2.aggressive_bid()
    if (aggressive_bid_address_in_pool !== new_contract_proxy_contract.address) {
        const tx = await aggressive_bid_pool_v2.setAggressiveBid(new_contract_proxy_contract.address, getTransactionOptions())
        console.log('aggressive_bid_pool_v2.setAggressiveBid() tx:', tx.hash)
        const receipt = await tx.wait()
        console.log('aggressive_bid_pool_v2.setAggressiveBid() gas used', getGasUsedAndGasPriceFromReceipt(receipt))
    }

    const ysgh_pool_address = await new_contract_proxy_contract.ysgh_pool()
    if (ysgh_pool_address !== YsghPool_data.address) {
        const tx = await new_contract_proxy_contract.setYsghPool(YsghPool_data.address, getTransactionOptions())
        console.log('setYsghPool() tx:', tx.hash)
        const receipt = await tx.wait()
        console.log('setYsghPool() gas used', getGasUsedAndGasPriceFromReceipt(receipt))
    }

    const ysgh_pool = await ethers.getContractAt('IYsghPool', YsghPool_data.address, admin_wallet)
    const aggressive_bid_pool_address_in_ysgh_pool = await ysgh_pool.aggressive_bid_address()
    if (aggressive_bid_pool_address_in_ysgh_pool !== new_contract_proxy_contract.address) {
        const tx = await ysgh_pool.setAggressiveBidAddress(new_contract_proxy_contract.address, getTransactionOptions())
        console.log('ysgh_pool.setAggressiveBidAddress() tx:', tx.hash)
        const receipt = await tx.wait()
        console.log('ysgh_pool.setAggressiveBidAddress() gas used', getGasUsedAndGasPriceFromReceipt(receipt))
    }

    const aggressive_bid_distribution_address = await new_contract_proxy_contract.aggressive_bid_distribution()
    if (aggressive_bid_distribution_address !== AggressiveBidDistribution_data.address) {
        const tx = await new_contract_proxy_contract.setAggressiveBidDistribution(AggressiveBidDistribution_data.address, getTransactionOptions())
        console.log('setAggressiveBidDistribution() tx:', tx.hash)
        const receipt = await tx.wait()
        console.log('setAggressiveBidDistribution() gas used', getGasUsedAndGasPriceFromReceipt(receipt))
    }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});