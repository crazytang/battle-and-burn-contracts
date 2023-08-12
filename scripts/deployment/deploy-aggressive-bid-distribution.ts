import {contract_l2_provider_getter} from "../../helpers/providers/contract_provider_getter";
import {get_admin_wallet} from "../../helpers/wallets/admin_wallet_getter";
import {bnToNumber, getTransactionOptions, setDefaultGasOptions} from "../../helpers/contract/contract-utils";
import {ethers} from "hardhat";
import {deploy_proxy_contract} from "../../helpers/contract/deploy-proxy-contract-to-files";
import NFTBattle_data from "../../contract-data/NFTBattle-data";
import AggressiveBid_data from "../../contract-data/AggressiveBid-data";

const provider = contract_l2_provider_getter()
const admin_wallet = get_admin_wallet(provider)
const contract_name = 'AggressiveBidDistribution'

async function main() {
    await setDefaultGasOptions(provider)

    console.log('eth balance', bnToNumber(await admin_wallet.getBalance()))

    const bid_royalty_rate = 401 // 4.01%
    const initialize_function = 'initialize(uint96)'
    const [new_contract, new_contract_proxy_contract] = await deploy_proxy_contract(contract_name, admin_wallet, initialize_function, [bid_royalty_rate])

    console.log(contract_name, 'was deployed on implement address', new_contract.address, 'and proxy address', new_contract_proxy_contract.address);

    if (AggressiveBid_data.address !== '') {
        const aggressive_bid = await ethers.getContractAt('AggressiveBid', AggressiveBid_data.address, admin_wallet)
        const aggressive_bid_distribution_address_in_bid = await aggressive_bid.aggressive_bid_distribution()
        if (aggressive_bid_distribution_address_in_bid !== new_contract_proxy_contract.address) {
            const tx = await aggressive_bid.setAggressiveBidDistribution(new_contract_proxy_contract.address, getTransactionOptions())
            console.log('setAggressiveBidDistribution() tx:', tx.hash)
            await tx.wait()
        }
    }

    const verifier_address_in_contract = await new_contract_proxy_contract.verifier_address()
    if (verifier_address_in_contract !== admin_wallet.address) {
        const tx = await new_contract_proxy_contract.setVerifierAddress(admin_wallet.address, getTransactionOptions())
        console.log('setVerifierAddress() tx:', tx.hash)
        await tx.wait()
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});