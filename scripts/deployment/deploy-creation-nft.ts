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
const contract_name = 'CreationNFT'

async function main() {
    await setDefaultGasOptions(provider)

    console.log('eth balance', bnToNumber(await admin_wallet.getBalance()))

    if (DistributionPolicyV1_data == undefined || DistributionPolicyV1_data.address == '') {
        throw new Error('DistributionPolicyV1 not deployed')
    }

    // 随便选两个用户作为element_creator
    const element_creator1 = get_user_wallet_114a(provider)
    const element_creator2 = get_user_wallet_d05a(provider)

    const distribution_params: DistributionRoleParamsStruct = {
        original_element_creator: admin_wallet.address,
        element_creators: [element_creator1.address, element_creator2.address],
        element_quote_element_creators:[ethers.constants.AddressZero, ethers.constants.AddressZero]
    }

    const baseUri = 'ipfs://bafybeifitgcwguqqvuiycjsxepvtjp3ix43ofrkm65kz2shea2fzqcee4i/'
    const contract = await deploy_contract_to_file(admin_wallet, contract_name, ['Creation NFT', 'CREATION', baseUri, distribution_params, DistributionPolicyV1_data.address]);

    console.log(contract_name + ' deployed address', contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});