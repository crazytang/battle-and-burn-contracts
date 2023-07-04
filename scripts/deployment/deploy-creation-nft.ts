import {contract_l2_provider_getter} from "../../helpers/providers/contract_provider_getter";
import {get_admin_wallet} from "../../helpers/wallets/admin_wallet_getter";
import {bnToNumber, setDefaultGasOptions} from "../../helpers/contract/contract-utils";
import {deploy_contract_to_file} from "../../helpers/contract/deploy-contract-to-files";
import {ethers} from "ethers";
import RoyaltyDistributor_data from "../../contract-data/RoyaltyDistributor-data";

const provider = contract_l2_provider_getter()
const admin_wallet = get_admin_wallet(provider)
const contract_name = 'CreationNFT'

async function main() {
    await setDefaultGasOptions(provider)

    console.log('eth balance', bnToNumber(await admin_wallet.getBalance()))

    if (RoyaltyDistributor_data == undefined || RoyaltyDistributor_data.address == '') {
        throw new Error('RoyaltyDistributor not deployed')
    }

    const baseUri = 'ipfs://bafybeifitgcwguqqvuiycjsxepvtjp3ix43ofrkm65kz2shea2fzqcee4i/'
    const contract = await deploy_contract_to_file(admin_wallet, contract_name, ['Creation NFT', 'CREATION', baseUri,RoyaltyDistributor_data.address]);

    console.log(contract_name + ' deployed address', contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});