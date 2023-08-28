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
import AggressiveBidPool_data from "../../contract-data/AggressiveBidPool-data";
import {ContractTransaction} from "ethers";
import {TransactionReceipt} from "@ethersproject/abstract-provider";
import NFTBattleV2_data from "../../contract-data/NFTBattleV2-data";
import AggressiveBidPoolV2_data from "../../contract-data/AggressiveBidPoolV2-data";

const provider = contract_l2_provider_getter()
const admin_wallet = get_admin_wallet(provider)
const contract_name = 'NFTBattlePoolV2'
let tx: ContractTransaction
let receipt: TransactionReceipt
async function main() {
    await setDefaultGasOptions(provider)

    console.log('eth balance', bnToNumber(await admin_wallet.getBalance()))

    if (NFTBattleV2_data === undefined || NFTBattleV2_data.address === '') {
        throw new Error('NFTBattleV2_data is not deployed')
    }

    const initialize_function = 'initialize(address)'
    const [new_contract, new_contract_proxy_contract] = await deploy_proxy_contract(contract_name, admin_wallet, initialize_function, [NFTBattleV2_data.address])

    console.log(contract_name, 'was deployed on implement address', new_contract.address, 'and proxy address', new_contract_proxy_contract.address);

    const nft_battle_v2 = await ethers.getContractAt('NFTBattleV2', NFTBattleV2_data.address, admin_wallet)
    const nft_battle_pool_v2 = await nft_battle_v2.nft_battle_pool_v2()
    if (nft_battle_pool_v2 !== new_contract_proxy_contract.address) {
        tx = await nft_battle_v2.setNFTBattlePool(new_contract_proxy_contract.address, getTransactionOptions())
        console.log('nft_battle_v2.setNFTBattlePool() tx', tx.hash)
        receipt = await tx.wait()
        console.log('nft_battle_v2.setNFTBattlePool() gasUsed', getGasUsedAndGasPriceFromReceipt(receipt))
    }

    const aggressive_bid_pool_address = await new_contract_proxy_contract.aggressive_bid_pool_address()
    if (AggressiveBidPoolV2_data.address != '' && aggressive_bid_pool_address !== AggressiveBidPoolV2_data.address) {
        tx = await new_contract_proxy_contract.setAggressiveBidPool(AggressiveBidPoolV2_data.address, getTransactionOptions())
        console.log('new_contract_proxy_contract.setAggressiveBidPool() tx', tx.hash)
        receipt = await tx.wait()
        console.log('new_contract_proxy_contract.setAggressiveBidPool() gasUsed', getGasUsedAndGasPriceFromReceipt(receipt))
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});