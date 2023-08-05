import {Contract, ContractTransaction, Wallet} from "ethers"
import {ethers} from "hardhat"
import * as fs from "fs"
import path from "path"
import {TransactionReceipt} from "@ethersproject/abstract-provider"
import {getTransactionOptions} from "./contract-utils"
import {ProxyContractData} from "../interfaces/proxy_contract_data_interface"
import {ContractData} from "../interfaces/contract_data_interface"
import {ProxyAdmin, ProxyAdmin__factory} from "../../typechain-types"
import ProxyAdmin_data from "../../contract-data/ProxyAdmin-data"
import {getContractFileAndArtifactFile, updateContractDeploymentInfo} from "./deploy-contract-to-files"

/**
 * 部署合约
 * @param contract_name string
 * @param admin_wallet Wallet
 * @param initialize_function
 * @param initialize_args
 * @return Promise<[Contract, Contract]>
 */
export const deploy_proxy_contract = async function (contract_name: string, admin_wallet: Wallet, initialize_function = "initialize()", initialize_args: any[] = []): Promise<[Contract, Contract]> {
    let new_contract: Contract
    let model_name: string

    // 1)部署目标合约
    let contract_factory = await ethers.getContractFactory(contract_name)
    contract_factory = contract_factory.connect(admin_wallet)
    new_contract = await contract_factory.deploy(getTransactionOptions())
    await new_contract.deployed()

    console.log(contract_name + ' address has been deployed to', new_contract.address)

    const contract_data_file = path.resolve(__dirname, '../../contract-data') + `/${contract_name}-data`
    const contract_data_file2 = contract_data_file + '.ts'

    // 2)更新或者重新生成代理合约
    let contract_data: ProxyContractData
    let proxy_contract: Contract
    // 合约数据文件是否存在
    if (!fs.existsSync(contract_data_file2)) {
        contract_data = {
            env: process.env.APP_ENV ? process.env.APP_ENV : 'test',
            network: process.env.NETWORK ? process.env.NETWORK : 'goerli',
            contract_name: contract_name,
            address: '',
            abi: {},
            proxy_address: '',
            target_address: new_contract.address
        }
    } else {
        contract_data = (await import(contract_data_file)).default
        if (contract_data.proxy_address == undefined) {
            contract_data.proxy_address = ''
        }
        contract_data.target_address = new_contract.address
        contract_data.abi = {}
    }

    if (initialize_function === '') {
        initialize_function = "initialize()"
    }

    // 是否已经部署了代理合约
    if (contract_data.proxy_address != '') {
        // 更新代理
        await upgradeContract(admin_wallet, contract_data)
    } else {

        let method_selector: string = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(initialize_function)).substring(0, 10) // 0xc4d66de8
        let call_data = ''
        let p = ''
        if (initialize_args.length > 0) {
            for (let i = 0; i < initialize_args.length; i++) {
                p += ethers.utils.hexZeroPad(ethers.utils.hexValue(initialize_args[i]), 32).replace(/^0x/, '')
            }
            call_data = ethers.utils.hexConcat([method_selector, '0x'+p]);
        } else {
            call_data = ethers.utils.hexConcat([method_selector])
        }

        // 部署代理
        proxy_contract = await deploy_proxy_to_file(admin_wallet, contract_name, new_contract.address, call_data)
        contract_data.address = proxy_contract.address
        contract_data.proxy_address = proxy_contract.address
    }

    // 将合约的数据保存到文件上
    save_proxy_contract_data(contract_data)

    const new_contract_proxy_contract = new ethers.Contract(contract_data.proxy_address, new_contract.interface, admin_wallet)
    return [new_contract, new_contract_proxy_contract]
}

/**
 * 保存address和abi信息，用于contract
 * @param artifact_file string
 * @param contract_address string
 * @param model_name string
 * @param deployed_index number
 * @param deployed_at string
 * @param to_file string
 * @param proxy_address string
 * @param libraries string[]
 */
/*export const save_proxy_contract_data = function (artifact_file: string, contract_address: string, model_name: string, deployed_index = 1, deployed_at = '', to_file = '', proxy_address='', libraries?:string[]) {

    const file_content = fs.readFileSync(artifact_file).toString()

    const reg: RegExp = /[\s\S]*?"abi":([\s\S]+?)"bytecode":[\s\S]*!/g
// reg.compile()
    const abi_content: string = file_content.replace(reg, "$1").toString()//reg.exec(file_content)

    const template: string = fs.readFileSync(__dirname + '/../helpers/templates/contract_data.template').toString()
    let contract_data_content = template.replace(/##name##/g, model_name)
    contract_data_content = contract_data_content.replace(/##address##/g, proxy_address)
    contract_data_content = contract_data_content.replace(/##abi##/g, abi_content)
    contract_data_content = contract_data_content.replace(/##proxy_address##/g, proxy_address)
    contract_data_content = contract_data_content.replace(/##target_address##/g, contract_address)
    const deployed_index_str = deployed_index.toString()
    contract_data_content = contract_data_content.replace(/##deployed_index##/g, deployed_index_str)
    contract_data_content = contract_data_content.replace(/##deployed_at##/g, deployed_at)

    let libraries_str = '[]'
    if (libraries && libraries.length > 0) {
        let tmp = []
        for (let i=0;i<libraries.length;i++) {
            tmp.push("'"+libraries[i]+"'")
        }
        libraries_str = "["+tmp.join(',')+"]"
    }
    contract_data_content = contract_data_content.replace(/##libraries##/g, libraries_str)

    // 特别处理
    if (model_name == 'price_feed_chainlink') {
        model_name = 'price_feed'
    }

    const contract_name = toCamelCase(model_name)
    contract_data_content = contract_data_content.replace(/##contract_name##/g, contract_name)

    let network = process.env.NETWORK
    if (!network) {
        network = 'goerli'
    }
    contract_data_content = contract_data_content.replace(/##network##/g, network)

    let env = process.env.APP_ENV
    if (!env) {
        env = 'test'
    }
    contract_data_content = contract_data_content.replace(/##env##/g, env)

    let contract_data_file: string
    if (to_file != '') {
        contract_data_file = to_file
    } else {
        contract_data_file = __dirname + '/../contract_data/' + model_name + '_data.ts'
    }

    fs.writeFileSync(contract_data_file, contract_data_content)

    console.log(contract_data_file + ' have been saved')
}*/

export const save_proxy_contract_data = function (contract_data: ProxyContractData, to_file = '') {

    const [, artifact_file] = getContractFileAndArtifactFile(contract_data.contract_name)
    const file_content = fs.readFileSync(artifact_file).toString()
    // let model_name = toUnderlineCase(contract_data.contract_name)
    let model_name = contract_data.contract_name


    const [deployed_index, deployed_at] = updateContractDeploymentInfo(contract_data.contract_name)

    const reg: RegExp = /[\s\S]*?"abi":([\s\S]+?)"bytecode":[\s\S]*/g
// reg.compile()
    const abi_content: string = file_content.replace(reg, "$1").toString()//reg.exec(file_content)

    const template: string = fs.readFileSync(__dirname + '/../templates/proxy-contract-data.template').toString()
    let contract_data_content = template.replace(/##name##/g, model_name)
    contract_data_content = contract_data_content.replace(/##address##/g, contract_data.proxy_address)
    contract_data_content = contract_data_content.replace(/##abi##/g, abi_content)
    contract_data_content = contract_data_content.replace(/##proxy_address##/g, contract_data.proxy_address)
    contract_data_content = contract_data_content.replace(/##target_address##/g, contract_data.target_address)
    const deployed_index_str = deployed_index.toString()
    contract_data_content = contract_data_content.replace(/##deployed_index##/g, deployed_index_str)
    contract_data_content = contract_data_content.replace(/##deployed_at##/g, deployed_at)

    let libraries_str = '[]'
    if (contract_data.libraries && contract_data.libraries.length > 0) {
        let tmp = []
        for (let i = 0; i < contract_data.libraries.length; i++) {
            tmp.push("'" + contract_data.libraries[i] + "'")
        }
        libraries_str = "[" + tmp.join(',') + "]"
    }
    contract_data_content = contract_data_content.replace(/##libraries##/g, libraries_str)

    const contract_name = contract_data.contract_name
    contract_data_content = contract_data_content.replace(/##contract_name##/g, contract_name)

    let network = process.env.NETWORK
    if (!network) {
        network = 'goerli'
    }
    contract_data_content = contract_data_content.replace(/##network##/g, network)

    let env = process.env.APP_ENV
    if (!env) {
        env = 'test'
    }
    contract_data_content = contract_data_content.replace(/##env##/g, env)

    let contract_data_file: string
    if (to_file != '') {
        contract_data_file = to_file
    } else {
        contract_data_file = __dirname + '/../../contract-data/' + model_name + '-data.ts'
    }

    fs.writeFileSync(contract_data_file, contract_data_content)

    console.log(contract_data_file + ' have been saved')
}

// 部署代理合约
export const deploy_proxy_to_file = async function (admin_wallet: Wallet, for_contract_name: string, for_contract_address: string, call_data: string): Promise<Contract> {
    let proxy: Contract
    let model_name: string
    let artifact_file: string
    if (for_contract_name == "") {
        throw new Error('for_contract_name is required')
    }

    // 检查代理管理合约是否存在
    const proxy_admin_data_file = path.resolve(__dirname, '../../contract-data') + `/ProxyAdmin-data`// '../contract_data/ProxyAdmin_data'
    if (!fs.existsSync(proxy_admin_data_file + '.ts')) {
        throw new Error('ProxyAdmin_data is not exists, you need to deploy the ProxyAdmin at first. in ' + proxy_admin_data_file + '.ts')
    }

    const proxy_admin: ContractData = (await import(proxy_admin_data_file)).default
    const proxy_admin_address = proxy_admin.address
    console.log('proxy_admin_address', proxy_admin_address)

    // 部署透明代理合约
    const contract_name = 'TransparentUpgradeableProxy'
    let _proxy_contract = await ethers.getContractFactory(contract_name)
    _proxy_contract = _proxy_contract.connect(admin_wallet)

    proxy = await _proxy_contract.deploy(for_contract_address, proxy_admin_address, call_data, getTransactionOptions())
    proxy = await proxy.deployed()
    console.log(`${for_contract_name} new TransparentUpgradeableProxy address: ${proxy.address}`)

    return proxy
}

export const upgradeContract = async function (admin_wallet: Wallet, contract_data: ProxyContractData) {
    if (contract_data.proxy_address == '') {
        throw new Error(`${contract_data.contract_name}'s proxy_address is undefined, you should delete the contract_data file and re-deploy the contract`)
    }

    // 获取代理关系管理合约地址
    const proxy_admin: ProxyAdmin = ProxyAdmin__factory.connect(ProxyAdmin_data.address, admin_wallet)
    console.log('proxy_admin address', proxy_admin.address)
    const tx: ContractTransaction = await proxy_admin.upgrade(contract_data.proxy_address, contract_data.target_address, getTransactionOptions())
    console.log('proxy_admin.upgrade() tx', tx.hash)
    let receipt: TransactionReceipt = await tx.wait()

    // 获取指定合约的代理合约地址
    /*const proxy_mapping_data = getProxyMappingData(for_contract_name)
    if (proxy_mapping_data == undefined) {
        throw new Error(`${for_contract_name}'s proxy_mapping_data is undefined.`)
    }
    const proxy_address = proxy_mapping_data.proxy_address
    if (proxy_address == "") {
        throw new Error(`${for_contract_name}'s proxy_address not found.`)
    }

    const default_layer = process.env.DEFAULT_LAYER || ''
    let proxy_admin_address: string
    if ('L1' == default_layer.toUpperCase()) {
        proxy_admin_address = proxy_admin_l1_data.address
    } else {
        proxy_admin_address = proxy_admin_l2_data.address
    }

    // 获取代理关系管理合约地址
    const proxy_admin: ProxyAdmin = ProxyAdmin__factory.connect(proxy_admin_address, admin_wallet)
    console.log('proxy_admin address', proxy_admin.address)
    const tx: ContractTransaction = await proxy_admin.upgrade(proxy_address, for_contract_address, getTransactionOptions())
    console.log('proxy_admin.upgrade() tx', tx.hash)
    let receipt: TransactionReceipt = await tx.wait(getConfirmedNum())

    const tx_fee: number = getTxFee(receipt)
    console.log('tx_fee', tx_fee)

    // 更新代理映射
    updateProxyMappingData(for_contract_name, for_contract_address, proxy_address)*/

}