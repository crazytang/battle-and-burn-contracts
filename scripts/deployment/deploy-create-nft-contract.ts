import {contract_l2_provider_getter} from "../../helpers/providers/contract_provider_getter";
import {get_admin_wallet} from "../../helpers/wallets/admin_wallet_getter";
import {bnToNumber, setDefaultGasOptions} from "../../helpers/contract/contract-utils";
import {deploy_contract_to_file} from "../../helpers/contract/deploy-contract-to-files";
import {Contract} from "ethers";
import {ethers} from "hardhat";
import NFTBattle_data from "../../contract-data/NFTBattle-data";

const provider = contract_l2_provider_getter()
const admin_wallet = get_admin_wallet(provider)
const contract_name = 'CreateNFTContract'

async function main() {
    await setDefaultGasOptions(provider)

    console.log('eth balance', bnToNumber(await admin_wallet.getBalance()))

    const contract = await deploy_contract_to_file(admin_wallet, contract_name, []);

    console.log(contract_name + ' deployed address', contract.address);

    if (NFTBattle_data != undefined && NFTBattle_data.address != '') {
        const nft_battle: Contract = await ethers.getContractAt('NFTBattle', NFTBattle_data.address, admin_wallet)
        const create_nft_contract_address = await nft_battle.create_nft_contract()
        if (create_nft_contract_address !== contract.address) {
            const tx = await nft_battle.setCreateNFTContract(contract.address)
            console.log('nft_battle.setCreateNFTContract() tx', tx.hash)
            await tx.wait()
        }
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});