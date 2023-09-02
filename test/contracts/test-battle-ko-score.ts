import {ContractReceipt, ContractTransaction, Wallet} from "ethers";
import {contract_l2_provider_getter} from "../../helpers/providers/contract_provider_getter";
import {get_admin_wallet} from "../../helpers/wallets/admin_wallet_getter";
import {get_user_wallet_5712} from "../../helpers/wallets/user_wallet_getter";
import {
    BattleKOScore,
    BattleKOScore__factory,
    CreateNFTContract,
    CreateNFTContract__factory
} from "../../typechain-types";
import {setDefaultGasOptions} from "../../helpers/contract/contract-utils";
import CreationNFT_data from "../../contract-data/CreationNFT-data";
import {expect} from "chai";
import BattleKOScore_data from "../../contract-data/BattleKOScore-data";
import NFTBattleV2_data from "../../contract-data/NFTBattleV2-data";

let tx: ContractTransaction
let receipt: ContractReceipt
const provider = contract_l2_provider_getter()
const admin_wallet: Wallet = get_admin_wallet(provider)
const user1_wallet: Wallet = get_user_wallet_5712(provider)
let battle_ko_score: BattleKOScore

before(async function () {
    await setDefaultGasOptions(provider)

    battle_ko_score = BattleKOScore__factory.connect(BattleKOScore_data.address, admin_wallet)
    console.log('battle_ko_score.address', battle_ko_score.address)
})
describe("Battle KO Score testing", function () {
    this.timeout(20 * 60 * 1000);

    it('test base', async () => {
        const nft_battle_v2_address = await battle_ko_score.nft_battle_v2()
        console.log('nft_battle_v2_address', nft_battle_v2_address)
        expect(nft_battle_v2_address).to.be.equal(NFTBattleV2_data.address)
    })
})