import {ContractReceipt, ContractTransaction, ethers, Wallet} from "ethers";
import {contract_l2_provider_getter} from "../../../helpers/providers/contract_provider_getter";
import {get_user_wallet_413d} from "../../../helpers/wallets/user_wallet_getter";
import {TestContract, TestContract__factory} from "../../../typechain-types";
import {setDefaultGasOptions} from "../../../helpers/contract/contract-utils";
import {get_admin_wallet} from "../../../helpers/wallets/admin_wallet_getter";
import TestContract_data from "../../../contract-data/TestContract-data";
import {Structs} from "../../../typechain-types/test/TestContract";
import VoteResultStruct = Structs.VoteResultStruct;


let tx: ContractTransaction
let receipt: ContractReceipt
const provider = contract_l2_provider_getter()
const admin_wallet: Wallet = get_admin_wallet(provider)
const user1_wallet: Wallet = get_user_wallet_413d(provider)

const test_contract: TestContract = TestContract__factory.connect(TestContract_data.address, admin_wallet)

before(async function () {
    await setDefaultGasOptions(provider)

})

describe("TestSign testing", function () {
    this.timeout(20 * 60 * 1000);

    it('test hashVoteResult()', async () => {
        const nft_address = '0xb32C065F02B7Dca40b5329a5996D1dA78cf037d8'
        const vote_result: VoteResultStruct = {
            matchId: ethers.utils.formatBytes32String('1'),
            voter: user1_wallet.address,
            votedNFT: nft_address,
            votedTokenId: 1,
        }


        const hash = await test_contract.hashVoteResult(vote_result)
        console.log('hash', hash)
    })
})