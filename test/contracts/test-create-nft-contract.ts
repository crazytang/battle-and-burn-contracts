import {ContractReceipt, ContractTransaction, ethers, Wallet} from "ethers";
import {contract_l2_provider_getter} from "../../helpers/providers/contract_provider_getter";
import {get_admin_wallet} from "../../helpers/wallets/admin_wallet_getter";
import {get_user_wallet_5712} from "../../helpers/wallets/user_wallet_getter";
import {CreateNFTContract, CreateNFTContract__factory, CreationNFT, CreationNFT__factory} from "../../typechain-types";
import {
    getGasUsedAndGasPriceFromReceipt,
    getTransactionOptions,
    setDefaultGasOptions
} from "../../helpers/contract/contract-utils";
import CreationNFT_data from "../../contract-data/CreationNFT-data";
import {DistributionStructs} from "../../typechain-types/CreateNFTContract";
import CreationNFTParamsStruct = DistributionStructs.CreationNFTParamsStruct;
import {PromiseOrValue} from "../../typechain-types/common";
import DistributionRoleParamsStruct = DistributionStructs.DistributionRoleParamsStruct;
import NFTBattlePool_data from "../../contract-data/NFTBattlePool-data";
import DistributionPolicyV1_data from "../../contract-data/DistributionPolicyV1-data";

let tx: ContractTransaction
let receipt: ContractReceipt
const provider = contract_l2_provider_getter()
const admin_wallet: Wallet = get_admin_wallet(provider)
const user1_wallet: Wallet = get_user_wallet_5712(provider)
let create_nft_contract: CreateNFTContract

before(async function () {
    await setDefaultGasOptions(provider)

    create_nft_contract = CreateNFTContract__factory.connect(CreationNFT_data.address, admin_wallet)
    console.log('creation_nft.address', create_nft_contract.address)
})
describe("Create NFT Contract testing", function () {
    this.timeout(20 * 60 * 1000);

    it('test create nft', async () => {
        const nft_name = 'test nft name'
        const nft_symbol = 'test nft symbol'
        const nft_base_uri = 'ipfs://test nft uri'
        const nft_creator = user1_wallet.address
        const nft_owner = user1_wallet.address

        const distribution_policy_address: DistributionRoleParamsStruct = {
            original_element_creator: ethers.constants.AddressZero,
            element_creators: [],
            element_quote_element_creators: []
        }
        const creationNFTParams :CreationNFTParamsStruct = {
            creator: nft_creator,
            name: nft_name,
            symbol: nft_symbol,
            baseURI: nft_base_uri,
            distribution_role_params: distribution_policy_address,
            distribution_policy_address: DistributionPolicyV1_data.address
        }
        const nft_battle_pool_address = NFTBattlePool_data.address
        const redeem_nft = true
        const tx_data = getTransactionOptions()
        console.log('tx_data', tx_data)
        tx = await create_nft_contract.jpgToNFT(creationNFTParams, nft_battle_pool_address,redeem_nft, tx_data)
        receipt = await tx.wait()
        console.log('receipt', receipt)
        console.log('create_nft_contract.jpgToNFT() gas used', getGasUsedAndGasPriceFromReceipt(receipt))
    })
})