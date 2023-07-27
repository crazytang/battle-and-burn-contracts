import {contract_l2_provider_getter} from "../../helpers/providers/contract_provider_getter";
import {get_admin_wallet} from "../../helpers/wallets/admin_wallet_getter";
import {bnToNumber, getTransactionOptions, setDefaultGasOptions} from "../../helpers/contract/contract-utils";
import {ethers} from "hardhat";
import {deploy_proxy_contract} from "../../helpers/contract/deploy-proxy-contract-to-files";
import NFTBattlePool_data from "../../contract-data/NFTBattlePool-data";
import CreateNFTContract_data from "../../contract-data/CreateNFTContract-data";

const provider = contract_l2_provider_getter()
const admin_wallet = get_admin_wallet(provider)
const contract_name = 'NFTBattle'

async function main() {
    await setDefaultGasOptions(provider)

    console.log('eth balance', bnToNumber(await admin_wallet.getBalance()))

    if (CreateNFTContract_data == undefined || CreateNFTContract_data.address == '') {
        throw new Error('CreaterPool_data is not deployed')
    }
    const initialize_function = 'initialize(address)'
    const [new_contract, new_contract_proxy_contract] = await deploy_proxy_contract(contract_name, admin_wallet, initialize_function, [CreateNFTContract_data.address])

    console.log(contract_name, 'was deployed on implement address', new_contract.address, 'and proxy address', new_contract_proxy_contract.address);

    if (NFTBattlePool_data !== undefined && NFTBattlePool_data.address !== '') {
        const nft_battle_pool_address = await new_contract_proxy_contract.nft_battle_pool()
        if (nft_battle_pool_address !== NFTBattlePool_data.address) {
            const tx = await new_contract_proxy_contract.setNFTBattlePool(NFTBattlePool_data.address, getTransactionOptions())
            console.log('new_contract_proxy_contract.setNFTBattlePool() tx', tx.hash)
            await tx.wait()
        }

        const nft_battle_pool = await ethers.getContractAt('NFTBattlePool', NFTBattlePool_data.address, admin_wallet)
        const nft_battle_in_pool = await nft_battle_pool.nft_battle_address()
        if (nft_battle_in_pool !== new_contract.address) {
            const tx = await nft_battle_pool.setNFTBattle(new_contract_proxy_contract.address, getTransactionOptions())
            console.log('nft_battle_pool.setNFTBattle() tx', tx.hash)
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