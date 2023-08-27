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
import NFTBattlePool_data from "../../contract-data/NFTBattlePool-data";
import {ContractTransaction} from "ethers";
import {TransactionReceipt} from "@ethersproject/abstract-provider";
import CreationNFT_data from "../../contract-data/CreationNFT-data";
import NFTBattlePoolV2_data from "../../contract-data/NFTBattlePoolV2-data";
import CreationNFTV2_data from "../../contract-data/CreationNFTV2-data";

const provider = contract_l2_provider_getter()
const admin_wallet = get_admin_wallet(provider)
const contract_name = 'NFTBattleV2'

async function main() {
    await setDefaultGasOptions(provider)

    console.log('eth balance', bnToNumber(await admin_wallet.getBalance()))

    const initialize_function = 'initialize()'
    const [new_contract, new_contract_proxy_contract] = await deploy_proxy_contract(contract_name, admin_wallet, initialize_function, [])

    let tx: ContractTransaction
    let receipt: TransactionReceipt

    console.log(contract_name, 'was deployed on implement address', new_contract.address, 'and proxy address', new_contract_proxy_contract.address);

    const verifier_address = await new_contract_proxy_contract.verifier_address()
    if (verifier_address !== admin_wallet.address) {
        tx = await new_contract_proxy_contract.setVerifierAddress(admin_wallet.address, getTransactionOptions())
        console.log('new_contract_proxy_contract.setVerifierAddress() tx', tx.hash)
        receipt = await tx.wait()
        console.log('new_contract_proxy_contract.setVerifierAddress() gasUsed', getGasUsedAndGasPriceFromReceipt(receipt))
    }

    if (NFTBattlePoolV2_data !== undefined && NFTBattlePoolV2_data.address !== '') {
        const nft_battle_pool_address = await new_contract_proxy_contract.nft_battle_pool_v2()
        if (nft_battle_pool_address !== NFTBattlePoolV2_data.address) {
            tx = await new_contract_proxy_contract.setNFTBattlePool(NFTBattlePoolV2_data.address, getTransactionOptions())
            console.log('new_contract_proxy_contract.setNFTBattlePool() tx', tx.hash)
            receipt = await tx.wait()
            console.log('new_contract_proxy_contract.setNFTBattlePool() gasUsed', getGasUsedAndGasPriceFromReceipt(receipt))
        }

        const creation_nft_v2 = await new_contract_proxy_contract.creation_nft_v2()
        if (creation_nft_v2 != CreationNFTV2_data.address) {
            tx = await new_contract_proxy_contract.setCreationNFT(CreationNFTV2_data.address, getTransactionOptions())
            console.log('new_contract_proxy_contract.setCreationNFT() tx', tx.hash)
            receipt = await tx.wait()
            console.log('new_contract_proxy_contract.setCreationNFT() gasUsed', getGasUsedAndGasPriceFromReceipt(receipt))
        }

        const nft_battle_pool = await ethers.getContractAt('NFTBattlePoolV2', NFTBattlePoolV2_data.address, admin_wallet)
        const nft_battle_in_pool = await nft_battle_pool.nft_battle_address()
        if (nft_battle_in_pool !== new_contract_proxy_contract.address) {
            tx = await nft_battle_pool.setNFTBattle(new_contract_proxy_contract.address, getTransactionOptions())
            console.log('nft_battle_pool.setNFTBattle() tx', tx.hash)
            receipt = await tx.wait()
            console.log('nft_battle_pool.setNFTBattle() gasUsed', getGasUsedAndGasPriceFromReceipt(receipt))
        }

    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});