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
import NFTBattleV2_data from "../../contract-data/NFTBattleV2-data";

const provider = contract_l2_provider_getter()
const admin_wallet = get_admin_wallet(provider)
const contract_name = 'BattleKOScore'

async function main() {
    await setDefaultGasOptions(provider)

    console.log('eth balance', bnToNumber(await admin_wallet.getBalance()))

    const initialize_function = 'initialize(address)'
    const [new_contract, new_contract_proxy_contract] = await deploy_proxy_contract(contract_name, admin_wallet, initialize_function, [NFTBattleV2_data.address])

    console.log(contract_name, 'was deployed on implement address', new_contract.address, 'and proxy address', new_contract_proxy_contract.address);

    const nft_battle_v2_address = await new_contract_proxy_contract.nft_battle_v2()
    if (nft_battle_v2_address !== NFTBattleV2_data.address) {
        const tx = await new_contract_proxy_contract.setNFTBattle(NFTBattleV2_data.address, getTransactionOptions())
        console.log('new_contract_proxy_contract.setNFTBattle() tx', tx.hash)
        const receipt = await tx.wait()
        console.log('new_contract_proxy_contract.setNFTBattle() gasUsed', getGasUsedAndGasPriceFromReceipt(receipt))
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});