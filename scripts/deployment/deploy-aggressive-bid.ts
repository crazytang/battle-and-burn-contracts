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
import AggressiveBidDistribution_data from "../../contract-data/AggressiveBidDistribution-data";
import YsghPool_data from "../../contract-data/YsghPool-data";
import AggressiveBidPool_data from "../../contract-data/AggressiveBidPool-data";

const provider = contract_l2_provider_getter()
const admin_wallet = get_admin_wallet(provider)
const contract_name = 'AggressiveBid'

async function main() {
    await setDefaultGasOptions(provider)

    console.log('eth balance', bnToNumber(await admin_wallet.getBalance()))

    const initialize_function = 'initialize(address,address,address)'
    const [new_contract, new_contract_proxy_contract] = await deploy_proxy_contract(contract_name, admin_wallet, initialize_function, [AggressiveBidDistribution_data.address, YsghPool_data.address, AggressiveBidPool_data.address])

    console.log(contract_name, 'was deployed on implement address', new_contract.address, 'and proxy address', new_contract_proxy_contract.address);

    const verifier_address = await new_contract_proxy_contract.verifier_address()
    if (verifier_address !== admin_wallet.address) {
        const tx = await new_contract_proxy_contract.setVerifierAddress(admin_wallet.address, getTransactionOptions())
        console.log('setVerifier() tx:', tx.hash)
        const receipt = await tx.wait()
        console.log('setVerifier() gas used', getGasUsedAndGasPriceFromReceipt(receipt))
    }

    const aggressive_bid_pool_address = await new_contract_proxy_contract.aggressive_bid_pool()
    if (aggressive_bid_pool_address !== AggressiveBidPool_data.address) {
        const tx = await new_contract_proxy_contract.setAggressiveBidPool(AggressiveBidPool_data.address, getTransactionOptions())
        console.log('setAggressiveBidPool() tx:', tx.hash)
        const receipt = await tx.wait()
        console.log('setAggressiveBidPool() gas used', getGasUsedAndGasPriceFromReceipt(receipt))
    }

    const aggressive_bid_pool = await ethers.getContractAt('AggressiveBidPool', AggressiveBidPool_data.address, admin_wallet)
    const aggressive_bid_address_in_pool = await aggressive_bid_pool.aggressive_bid()
    if (aggressive_bid_address_in_pool !== new_contract_proxy_contract.address) {
        const tx = await aggressive_bid_pool.setAggressiveBid(new_contract_proxy_contract.address, getTransactionOptions())
        console.log('aggressive_bid_pool.setAggressiveBid() tx:', tx.hash)
        const receipt = await tx.wait()
        console.log('aggressive_bid_pool.setAggressiveBid() gas used', getGasUsedAndGasPriceFromReceipt(receipt))
    }

    const ysgh_pool_address = await new_contract_proxy_contract.ysgh_pool()
    if (ysgh_pool_address !== YsghPool_data.address) {
        const tx = await new_contract_proxy_contract.setYsghPool(YsghPool_data.address, getTransactionOptions())
        console.log('setYsghPool() tx:', tx.hash)
        const receipt = await tx.wait()
        console.log('setYsghPool() gas used', getGasUsedAndGasPriceFromReceipt(receipt))
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