import {contract_l2_provider_getter} from "../../helpers/providers/contract_provider_getter";
import {get_admin_wallet} from "../../helpers/wallets/admin_wallet_getter";
import {bnToNumber, setDefaultGasOptions} from "../../helpers/contract/contract-utils";
import {deploy_contract_to_file} from "../../helpers/contract/deploy-contract-to-files";
import {ethers} from "ethers";
import {DistributionStructs} from "../../typechain-types/CreationNFT";
import DistributionRoleParamsStruct = DistributionStructs.DistributionRoleParamsStruct;
import {get_user_wallet_114a, get_user_wallet_d05a} from "../../helpers/wallets/user_wallet_getter";
import DistributionPolicyV1_data from "../../contract-data/DistributionPolicyV1-data";

const provider = contract_l2_provider_getter()
const admin_wallet = get_admin_wallet(provider)
const contract_name = 'MagnifierNFT'

async function main() {
    await setDefaultGasOptions(provider)

    console.log('eth balance', bnToNumber(await admin_wallet.getBalance()))

    const name = 'Magnifier NFT'
    const symbol = 'MAGNIFIER'

    const baseUri = 'ipfs://QmYEPFhB3FkyDd14GzDFLHqKjpnniH3tRkQBnd2m5sgGVU/'
    const contract = await deploy_contract_to_file(admin_wallet, contract_name, [name, symbol, baseUri, 8, 10000]);

    console.log(contract_name + ' deployed address', contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});