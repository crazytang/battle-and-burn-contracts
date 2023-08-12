import {bnToNumber, getTransactionOptions, setDefaultGasOptions} from "../../../helpers/contract/contract-utils";
import {contract_l2_provider_getter} from "../../../helpers/providers/contract_provider_getter";
import {get_admin_wallet} from "../../../helpers/wallets/admin_wallet_getter";
import {ethers} from "hardhat";
import MagnifierNFT_data from "../../../contract-data/MagnifierNFT-data";
import MagnifierNFTAirDrop_data from "../../../contract-data/MagnifierNFTAirDrop-data";
import NFTBattlePool_data from "../../../contract-data/NFTBattlePool-data";
import NFTBattle_data from "../../../contract-data/NFTBattle-data";
import {AggressiveBid__factory, NFTBattlePool__factory} from "../../../typechain-types";
import AggressiveBid_data from "../../../contract-data/AggressiveBid-data";
import {ContractTransaction} from "ethers";
import AggressiveBidPool_data from "../../../contract-data/AggressiveBidPool-data";
import YsghPool_data from "../../../contract-data/YsghPool-data";

const provider = contract_l2_provider_getter()
const admin_wallet = get_admin_wallet(provider)

let tx: ContractTransaction
async function main() {
    await setDefaultGasOptions(provider)

    const aggressive_bid = AggressiveBid__factory.connect(AggressiveBid_data.address, admin_wallet)
    tx = await aggressive_bid.setAggressiveBidPool(AggressiveBidPool_data.address, getTransactionOptions())
    console.log('aggressive_bid.setAggressiveBidPool() tx', tx.hash)
    await tx.wait();

    tx = await aggressive_bid.setYsghPool(YsghPool_data.address, getTransactionOptions())
    console.log('aggressive_bid.setYsghPool() tx', tx.hash)
    await tx.wait();

    const nft_battle_pool = NFTBattlePool__factory.connect(NFTBattlePool_data.address, admin_wallet)
    tx = await nft_battle_pool.setAggressiveBidPool(AggressiveBidPool_data.address, getTransactionOptions())
    console.log('nft_battle_pool.setAggressiveBidPool() tx', tx.hash)
    await tx.wait();
}

const setMagnifierNFTToAirDrop = async () => {
    const magnifierNFT = await ethers.getContractAt('MagnifierNFT', MagnifierNFT_data.address, admin_wallet)
    // const rs = bnToNumber(await magnifierNFT.estimateGas.safeTransferFrom(admin_wallet.address, MagnifierNFTAirDrop_data.address, 0, 100, ethers.constants.HashZero, getTransactionOptions()), 0)
    // console.log('rs', rs)
    const tx = await magnifierNFT.safeTransferFrom(admin_wallet.address, MagnifierNFTAirDrop_data.address, 0, 100, ethers.constants.HashZero, getTransactionOptions())
    console.log('magnifierNFT.safeTransferFrom() tx', tx.hash)
    await tx.wait();
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});