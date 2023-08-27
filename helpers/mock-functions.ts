
import {
    bnToNoPrecisionNumber,
    getGasUsedAndGasPriceFromReceipt,
    getTransactionOptions,
    numberToBn,
    signMessageByWallet,
    solidityAbiEncode
} from "./contract/contract-utils";
import {BigNumber, Contract, ethers, Wallet} from "ethers";
import {MerkleTreeService} from "../libs/merkle-tree-service";
import {joinSignature} from "@ethersproject/bytes";
import {AggressiveBidStructs} from "../typechain-types/AggressiveBid";
import OrderStruct = AggressiveBidStructs.OrderStruct;
import {AssetType, InputData, OrderSide, OrderType} from "./contract/structs";
import DistributionPolicyV1_data from "../contract-data/DistributionPolicyV1-data";
import {DistributionStructs} from "../typechain-types/NFTBattle";
import DistributionRoleParamsStruct = DistributionStructs.DistributionRoleParamsStruct;
import {keccak256} from "@ethersproject/keccak256";
import {CreationNFTV2, CreationNFTV2__factory} from "../typechain-types";
import fs from "fs";
import CreationNFTV2_data from "../contract-data/CreationNFTV2-data";

export const makeNewOrder = (trader_address: string, side: OrderSide, orderType: OrderType, collection_address: string, assetType: AssetType, tokenId: number, amount: number, price: number, nonce: number, payment_token = ethers.constants.AddressZero): OrderStruct => {
    const now_timestamp = Math.floor((new Date()).getTime() / 1000)
    /*return {
        trader: trader_address,
        side: numberToBn(side, 0),
        collection: collection_address,
        tokenId: numberToBn(tokenId, 0),
        amount: numberToBn(amount, 0),
        paymentToken: ethers.constants.AddressZero,
        price: numberToBn(price),
        listingTime: numberToBn(now_timestamp, 0),
        expirationTime: numberToBn(now_timestamp + 60 * 60 * 24 * 3, 0),
        salt: numberToBn(Math.floor(Math.random() * 10000), 0),
        extraParams: [],
        merkleTree: {
            root: ethers.constants.HashZero,
            proof: [],
        },
    }*/
    return {
        trader: trader_address,
        side: numberToBn(side, 0).toString(),
        orderType: numberToBn(orderType, 0).toString(),
        collection: collection_address,
        assetType: numberToBn(assetType, 0).toString(),
        tokenId: numberToBn(tokenId, 0).toString(),
        amount: numberToBn(amount, 0).toString(),
        paymentToken: payment_token,
        price: numberToBn(price).toString(),
        listingTime: numberToBn(now_timestamp - 60 * 5, 0).toString(),
        expirationTime: numberToBn(now_timestamp + 60 * 60 * 24 * 3, 0).toString(),
        trader_nonce: numberToBn(nonce, 0).toString(),
        extraParams: ethers.utils.formatBytes32String('test'),
    }
}

export const makeInputData = async (order: OrderStruct, user_wallet: Wallet, verifier_wallet: Wallet): Promise<InputData> => {

    const [order_leaf, t1] = orderToLeaf(order)
    const order_merkle_tree = new MerkleTreeService([order_leaf], t1)
    const order_hash = order_merkle_tree.hashLeaf(order_leaf)
    console.log('order_hash', order_hash)

    const signature = await user_wallet._signingKey().signDigest(order_hash)
    const extraSignature = joinSignature(await verifier_wallet._signingKey().signDigest(order_hash))

    // 需要建立merkle tree
    if (order.orderType !== OrderType.FixedPrice) {

    }
    return {
        order: order,
        v: signature.v,
        r: signature.r,
        s: signature.s,
        extraSignature: extraSignature,
        merkleTree: {
            root: ethers.constants.HashZero,
            proof: []
        },
        blockNumber: BigNumber.from('0'),
    }
}


export const makeInputDataFromOrdersWithMerkleTree = async (order: OrderStruct, orders: OrderStruct[], user_wallet: Wallet, verifier_wallet: Wallet): Promise<InputData> => {
    const [order_leaf, t1] = orderToLeaf(order)
    const order_merkle_tree = new MerkleTreeService([order_leaf], t1)
    const order_hash = order_merkle_tree.hashLeaf(order_leaf)
    console.log('order_hash', order_hash)

    const [order_leaves, t2] = ordersToLeaves(orders)
    // console.log('order_leaves', order_leaves, t2)
    const orders_merkle_tree = new MerkleTreeService(order_leaves, t2)
    const orders_root = orders_merkle_tree.getRoot()
    const orders_proof = orders_merkle_tree.getProof(order_leaf)

    const signature = await user_wallet._signingKey().signDigest(order_hash)

    // const extraSignature: string = joinSignature(await verifier_wallet._signingKey().signDigest(order_hash))
    const extraSignature: string = orderSignByVerifier(order, verifier_wallet)
    // 需要建立merkle tree
    if (order.orderType !== OrderType.FixedPrice) {

    }
    return {
        order: order,
        v: signature.v,
        r: signature.r,
        s: signature.s,
        extraSignature: extraSignature,
        merkleTree: {
            root: orders_root,
            proof: orders_proof
        },
        blockNumber: BigNumber.from('0'),
    }
}

export const orderSignByVerifier = (order: OrderStruct, verifier_wallet: Wallet): string => {
    const [order_leaf, t1] = orderToLeaf(order)
    const order_hash = keccak256(keccak256(solidityAbiEncode(t1, order_leaf)))
    return signMessageByWallet(verifier_wallet, order_hash)
}

export const orderToLeaf = (order: OrderStruct): [any[], string[]] => {
    const leaf = [
        order.trader,
        order.side,
        order.orderType,
        order.collection,
        order.assetType,
        order.tokenId,
        order.amount,
        order.paymentToken,
        order.price,
        order.listingTime,
        order.expirationTime,
        order.trader_nonce,
        order.extraParams
    ]
    const types = [
        'address',
        'uint8',
        'uint8',
        'address',
        'uint8',
        'uint256',
        'uint256',
        'address',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'bytes'
    ]
    return [leaf, types]
}

export const ordersToLeaves = (orders: OrderStruct[]): [any[], string[]] => {
    const leaves = []
    let types:string[] = []
    for (const order of orders) {
        const [leaf, t1] = orderToLeaf(order)
        leaves.push(leaf)

        if (types.length === 0) {
            types = t1
        }
    }
    return [leaves, types]
}


export const deployCreationNFT = async (admin_wallet: Wallet, name: string, symbol: string, baseURI:string, distributionParams: DistributionRoleParamsStruct): Promise<Contract> => {
    const contract_name = "CreationNFT"
    let contract_data = await import('../data/compiled-data/CreationNFT.json')
    let contract_factory = new ethers.ContractFactory(contract_data.abi, contract_data.bytecode, admin_wallet)
    // contract_factory = contract_factory.connect(admin_wallet)
    let new_contract = await contract_factory.deploy(name, symbol, baseURI, distributionParams, DistributionPolicyV1_data.address, getTransactionOptions())
    new_contract = await new_contract.deployed()

    const receipt = await new_contract.provider.getTransactionReceipt(new_contract.deployTransaction.hash)
    console.log('deployCreationNFT gas used', getGasUsedAndGasPriceFromReceipt(receipt))

    return new_contract
}

/**
 * 铸造一个CreationNFT
 * @param user_wallet 铸造者的钱包
 * @return token_id
 */
export const mintACreationNFT = async (user_wallet: Wallet): Promise<number> => {
    /*
    铸造流程
    1）生成tokenId的元数据，文件示例在 data/creation-nft-v2-meta.json
    2）将元数据文件放到我们网站的指定目录下，获取目录的方式是 await creation_nft.baseURI()，完整路径是 baseURI + tokenId + '.json'
    3）将元数据文件的内容进行hash，hash方法 ethers.utils.id('....')
     */

    const user_creation_nft: CreationNFTV2 = CreationNFTV2__factory.connect(CreationNFTV2_data.address, user_wallet)
    // 使用totalSupply作为token_id
    const new_token_id = await user_creation_nft.totalSupply()
    const token_meta_content = fs.readFileSync(__dirname+'/../data/creation-nft-v2-meta.json').toString()
    const token_meta_hash = ethers.utils.id(token_meta_content)

    const tx = await user_creation_nft.mint(new_token_id, token_meta_hash)
    console.log('creation_nft.mint() tx', tx.hash)
    const receipt = await tx.wait()
    console.log('creation_nft.mint() gas used', getGasUsedAndGasPriceFromReceipt(receipt))

    return bnToNoPrecisionNumber(new_token_id)
}