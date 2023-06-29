import {ContractReceipt, ContractTransaction, ethers, Wallet} from "ethers";
import {contract_l2_provider_getter} from "../../../helpers/providers/contract_provider_getter";
import {CreationNFT, CreationNFT__factory, TestContract, TestContract__factory} from "../../../typechain-types";
import {bnToNoPrecisionNumber, setDefaultGasOptions} from "../../../helpers/contract/contract-utils";
import {get_admin_wallet} from "../../../helpers/wallets/admin_wallet_getter";
import TestContract_data from "../../../contract-data/TestContract-data";
import {Structs} from "../../../typechain-types/test/TestContract";
import VoteResultStruct = Structs.VoteResultStruct;
import {get_user_wallet_5AD8} from "../../../helpers/wallets/user_wallet_getter";
import {expect} from "chai";


let tx: ContractTransaction
let receipt: ContractReceipt
const provider = contract_l2_provider_getter()
const admin_wallet: Wallet = get_admin_wallet(provider)
const user1_wallet: Wallet = get_user_wallet_5AD8(provider)

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

    it('test createContract()', async () => {
        tx = await test_contract.createContract()
        console.log('test_contract.createContract() tx', tx.hash)
        receipt = await tx.wait()
        // console.log('receipt', receipt)
        // 获取日志
        const logs = receipt.logs;

        let new_contract_address = '';
        let new_contract_owner = '';
        let new_contract_name = '';
        let new_contract_symbol = '';
        // 解析日志
        for (let i = 0; i < logs.length; i++) {
            let log = logs[i];
            // console.log('log', log)
            // 使用合约的接口解析日志
            try {
                const parsedLog = test_contract.interface.parseLog(log);
                // console.log('parsedLog', parsedLog);
                if (parsedLog.name === 'CreatedContract') {
                    new_contract_address = parsedLog.args.contract_address;
                    new_contract_owner = parsedLog.args.owner;
                    new_contract_name = parsedLog.args.name;
                    new_contract_symbol = parsedLog.args.symbol;
                }
            } catch (e:any) {
                console.log( e.message)
            }
        }

        if (new_contract_address === '') {
            throw new Error('new_contract_address is empty')
        }

        const new_contract: CreationNFT = CreationNFT__factory.connect(new_contract_address, admin_wallet)

        const name = await new_contract.name()
        console.log('name', name)
        expect(name).to.equal(new_contract_name)

        const symbol = await new_contract.symbol()
        console.log('symbol', symbol)
        expect(symbol).to.equal(new_contract_symbol)

        const owner = await new_contract.owner()
        console.log('owner', owner)
        expect(owner).to.equal(admin_wallet.address)

        const totalSupply = bnToNoPrecisionNumber(await new_contract.totalSupply())
        console.log('totalSupply', totalSupply)
        expect(totalSupply).to.equal(1)

        const ntf_owner = await new_contract.ownerOf(0)
        console.log('ntf_owner', ntf_owner)
        expect(ntf_owner).to.equal(admin_wallet.address)
    })
})