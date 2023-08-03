import {contract_l2_provider_getter} from "../../helpers/providers/contract_provider_getter";
import {get_admin_wallet} from "../../helpers/wallets/admin_wallet_getter";
import {bnToNumber, setDefaultGasOptions} from "../../helpers/contract/contract-utils";
import {deploy_contract_to_file} from "../../helpers/contract/deploy-contract-to-files";
import {ethers} from "ethers";
import {DistributionStructs} from "../../typechain-types/CreationNFT";
import DistributionRoleParamsStruct = DistributionStructs.DistributionRoleParamsStruct;
import {get_user_wallet_114a, get_user_wallet_d05a} from "../../helpers/wallets/user_wallet_getter";
import DistributionPolicyV1_data from "../../contract-data/DistributionPolicyV1-data";
import MagnifierNFT_data from "../../contract-data/MagnifierNFT-data";

const provider = contract_l2_provider_getter()
const admin_wallet = get_admin_wallet(provider)
const contract_name = 'MagnifierNFTAirDrop'

async function main() {
    await setDefaultGasOptions(provider)

    console.log('eth balance', bnToNumber(await admin_wallet.getBalance()))

    const contract = await deploy_contract_to_file(admin_wallet, contract_name, [MagnifierNFT_data.address, Math.floor((new Date("2023-08-22T00:00:00Z")).getTime()/1000)]);

    console.log(contract_name + ' deployed address', contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});