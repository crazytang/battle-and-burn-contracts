import {Contract, Wallet} from "ethers"
import {getTransactionOptions} from "./contract-utils"
import fs from "fs"
import {datetime_format, toCamelCase} from "../utils"
import {ethers} from "hardhat"

export const getContractFileAndArtifactFile = function (contract_name: string) {
    const contract_dirs = ['contracts', 'contracts/test', 'contracts/proxy', 'contracts/mock']
    let contract_file = ''
    for (let i = 0; i < contract_dirs.length; i++) {
        if (fs.existsSync(__dirname + '/../../' + contract_dirs[i] + '/' + contract_name + '.sol')) {
            contract_file = __dirname + '/../../' + contract_dirs[i] + '/' + contract_name + '.sol'
            break
        }
    }

    if (contract_file == '') {
        throw new Error(`${contract_name} file is not exists.`)
    }

    let artifact_file = ''
    for (let i = 0; i < contract_dirs.length; i++) {
        if (fs.existsSync(__dirname + '/../../artifacts/' + contract_dirs[i] + '/' + contract_name + '.sol/' + contract_name + '.json')) {
            artifact_file = __dirname + '/../../artifacts/' + contract_dirs[i] + '/' + contract_name + '.sol/' + contract_name + '.json'
            break
        }
    }

    return [contract_file, artifact_file]
}

// 更新合约里面的部署信息
export const updateContractDeploymentInfo = function (contract_name: string): [number, string] {
    const [contract_file,] = getContractFileAndArtifactFile(contract_name)

    const deploy_count_str = '##deployed index:'
    const deploy_time_str = '##deployed at:'

    let file_content = fs.readFileSync(contract_file, {encoding: 'utf8', flag: 'r+'})
    let re = new RegExp(`(${deploy_count_str})\\s*(\\d+)`, 'g')
    let rs = re.exec(file_content)
    let index = 1
    let new_deployed_str = ''
    if (rs) {
        const [m1, m2, m3] = rs ? rs : []
        index = parseInt(m3) + 1
        const new_count_str = deploy_count_str + ' ' + index
        file_content = file_content.replace(re, new_count_str)
    } else {
        new_deployed_str = '// ' + deploy_count_str + ' ' + index + '\n'
    }

    re = new RegExp(`(${deploy_time_str})\.+`, 'g')
    rs = re.exec(file_content)
    const new_time = datetime_format(new Date(), 'yyyy/MM/dd hh:mm:ss')
    const new_time_str = deploy_time_str + ' ' + new_time
    if (rs) {
        file_content = file_content.replace(re, new_time_str)
    } else {
        new_deployed_str = new_deployed_str + '// ' + new_time_str + '\n'
    }

    if (new_deployed_str != '') {
        file_content = new_deployed_str + file_content
    }

    fs.writeFileSync(contract_file, file_content)

    return [index, new_time]
}

/**
 * 保存address和abi信息，用于contract
 * @param artifact_file string
 * @param contract_address string
 * @param model_name string
 * @param deployed_index number
 * @param deployed_at string
 * @param to_file string
 * @param libraries []
 */
export const save_contract_data = function (artifact_file: string, contract_address: string, model_name: string, network: string, deployed_index = 1, deployed_at = '', to_file = '', libraries?: string[]) {

    const file_content = fs.readFileSync(artifact_file).toString()

    const reg: RegExp = /[\s\S]*?"abi":([\s\S]+?)"bytecode":[\s\S]*/g
// reg.compile()
    const abi_content: string = file_content.replace(reg, "$1").toString()//reg.exec(file_content)

    const template: string = fs.readFileSync(__dirname + '/../templates/contract-data.template').toString()
    let contract_data_content = template.replace(/##name##/g, model_name)
    contract_data_content = contract_data_content.replace(/##address##/g, contract_address)
    contract_data_content = contract_data_content.replace(/##abi##/g, abi_content)
    const deployed_index_str = deployed_index.toString()
    contract_data_content = contract_data_content.replace(/##deployed_index##/g, deployed_index_str)
    contract_data_content = contract_data_content.replace(/##deployed_at##/g, deployed_at)

    let libraries_str = '[]'
    if (libraries && libraries.length > 0) {
        let tmp = []
        for (let i = 0; i < libraries.length; i++) {
            tmp.push("'" + libraries[i] + "'")
        }
        libraries_str = "[" + tmp.join(',') + "]"
    }
    contract_data_content = contract_data_content.replace(/##libraries##/g, libraries_str)

    const contract_name = toCamelCase(model_name)
    contract_data_content = contract_data_content.replace(/##contract_name##/g, contract_name)

    if (!network) {
        network = 'unknown'
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

/*
export const deploy_price_comsumer_v3_to_file = async function (admin_wallet: Wallet): Promise<Contract> {
    let new_contract: Contract
    let model_name: string
    let artifact_file: string

    const contract_name = 'PriceConsumerV3'
    let contract_factory = await ethers.getContractFactory(contract_name)
    contract_factory = contract_factory.connect(admin_wallet)
    // new_contract = await contract_factory.deploy(getTransactionOptions())
    new_contract = await contract_factory.deploy()
    await new_contract.deployed()

    console.log(contract_name + ' address', new_contract.address)

    model_name = contract_name //'cai_maker'
    artifact_file = __dirname + '/../../artifacts/contracts/' + contract_name + '.sol/' + contract_name + '.json'
    const [index, d_time] = updateContractDeploymentInfo(contract_name)
    const network = (await admin_wallet.provider.getNetwork()).name
    save_contract_data(artifact_file, new_contract.address, model_name, network, index, d_time)
    return new_contract
}*/

export const deploy_contract_to_file = async function (admin_wallet: Wallet, contract_name: string, param: any[]): Promise<Contract> {
    let new_contract: Contract
    let model_name: string

    let contract_factory = await ethers.getContractFactory(contract_name)
    contract_factory = contract_factory.connect(admin_wallet)
    // new_contract = await contract_factory.deploy(getTransactionOptions())
    const tx_data = {...getTransactionOptions()}
    const estimateGas = await admin_wallet.estimateGas(contract_factory.getDeployTransaction(...param))
    console.log('estimateGas', estimateGas.toString())

    tx_data.gasLimit = estimateGas.toString()
    console.log('tx_data', tx_data)

    if (estimateGas.gt(tx_data.gasLimit)) {
        throw new Error('estimateGas is bigger than tx_data.gasLimit')
    }

    new_contract = await contract_factory.deploy(...param, tx_data)
    await new_contract.deployed()

    console.log(contract_name + ' address', new_contract.address)

    const [, artifact_file] = getContractFileAndArtifactFile(contract_name)
    const [index, d_time] = updateContractDeploymentInfo(contract_name)
    const network = (await admin_wallet.provider.getNetwork()).name
    save_contract_data(artifact_file, new_contract.address, contract_name, network, index, d_time)
    return new_contract
}