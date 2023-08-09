import {contract_l2_provider_getter} from "../../helpers/providers/contract_provider_getter";
import {get_admin_wallet} from "../../helpers/wallets/admin_wallet_getter";
import {bnToNumber, getTransactionOptions, setDefaultGasOptions} from "../../helpers/contract/contract-utils";
import {ethers} from "hardhat";
import {deploy_proxy_contract} from "../../helpers/contract/deploy-proxy-contract-to-files";
import NFTBattle_data from "../../contract-data/NFTBattle-data";
import AggressiveBidPool_data from "../../contract-data/AggressiveBidPool-data";

const provider = contract_l2_provider_getter()
const admin_wallet = get_admin_wallet(provider)
const contract_name = 'NFTBattlePool'

async function main() {
    await setDefaultGasOptions(provider)

    console.log('eth balance', bnToNumber(await admin_wallet.getBalance()))

    if (NFTBattle_data === undefined || NFTBattle_data.address === '') {
        throw new Error('NFTBattle_data is not deployed')
    }

    const initialize_function = 'initialize(address)'
    const [new_contract, new_contract_proxy_contract] = await deploy_proxy_contract(contract_name, admin_wallet, initialize_function, [NFTBattle_data.address])

    console.log(contract_name, 'was deployed on implement address', new_contract.address, 'and proxy address', new_contract_proxy_contract.address);

    const nft_battle = await ethers.getContractAt('NFTBattle', NFTBattle_data.address, admin_wallet)
    const nft_battle_pool = await nft_battle.nft_battle_pool()
    if (nft_battle_pool !== new_contract_proxy_contract.address) {
        const tx = await nft_battle.setNFTBattlePool(new_contract_proxy_contract.address, getTransactionOptions())
        console.log('nft_battle.setNFTBattlePool() tx', tx.hash)
        await tx.wait()
    }

    const aggressive_bid_pool_address = await new_contract_proxy_contract.aggressive_bid_pool_address()
    if (aggressive_bid_pool_address !== AggressiveBidPool_data.address) {
        const tx = await new_contract_proxy_contract.setAggressiveBidPool(AggressiveBidPool_data.address, getTransactionOptions())
        console.log('new_contract_proxy_contract.setAggressiveBidPool() tx', tx.hash)
        await tx.wait()
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});