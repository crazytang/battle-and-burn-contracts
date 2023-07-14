import {BigNumber, Contract, ContractReceipt, Signature, Wallet} from "ethers";
import {Provider} from "@ethersproject/abstract-provider";
import axios from "axios";
import {joinSignature, splitSignature} from "@ethersproject/bytes";

export const setDefaultGasOptions = async function (provider: Provider) {
    const options = getTransactionOptions();
    if (options.gasLimit) {
        return;
    }

    const gas_limit = 20000000;
    let gas_price: number;
    gas_price = BigNumber.from(await provider.getGasPrice()).toNumber();
//    gas_price = 100*10**9
    gas_price = Math.floor(gas_price * 1.1);
    let transaction_options = {
        gasLimit: gas_limit,
        gasPrice: gas_price,
    }
    // console.log('transaction_options', transaction_options)
    setTransactionOptions(transaction_options);
}

let tx_options = {};

/**
 * 获取和设置gasLimit、gasPrice等选项
 * @param transaction_options
 */
export const setTransactionOptions = (transaction_options: {}) => {
    tx_options = transaction_options;
}

/**
 * 获取和设置gasLimit、gasPrice等选项
 */
export const getTransactionOptions: any = (_line_='') => {
    // console.log('getTransactionOptions(',_line_,')', tx_options);
    return tx_options;
}

/**
 * 获取区块确认数量
 */
export const getConfirmedNum = () => {
    return 1;
}

export const bnToNumber = function (bn: BigNumber, decimals = 18): number {
    return Number(bn) / Math.pow(10, decimals);
}

export const bnToNoPrecisionNumber = function (bn: BigNumber): number {
    return Number(bn) / Math.pow(10, 0);
}

export const multiBnToNumbers = function (bns: BigNumber[], decimals = 18): number[] {
    let nums: number[] = [];
    for (let i = 0; i < bns.length; i++) {
        nums.push(bnToNumber(bns[i], decimals));
    }

    return nums;
}
export const bnToDate = function (bn: BigNumber): string {
    return (new Date(Number(bn) * 1000)).toLocaleString();
}

export const numberToBn = function (num: number, decimals = 18): BigNumber {
    const bn_len = parseInt(num.toString()).toString().length + decimals;
    // BigNumber不能直接处理大于22位的数字
    if (bn_len <= 21) {
        return BigNumber.from((num * Math.pow(10, decimals)).toString());
    }

    const [_int, _float] = num.toString().split('.');

    let new_num;
    let new_decimals
    if (_float != undefined) {
        const _float_len = _float.toString().length;
        new_num = num * Math.pow(10, _float_len);
        new_decimals = decimals - _float_len;
    } else {
        new_num = num;
        new_decimals = decimals;
    }

    return BigNumber.from(new_num.toString()).mul(BigNumber.from(10).pow(new_decimals));
}

export const get_compare_number_precision = function (): number {
    return 0.00001;
}

// 比较两个数字在精度内是否一致
export const amount_equal_in_precision = function (num1: number, num2: number, precision = get_compare_number_precision()): boolean {
    const gap = Math.abs(num1 - num2);
    return gap <= precision;
}

// 休眠
export const sleep = async (ms: number) => {
    console.log('sleeping', ms / 1000, 'seconds');
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('');
        }, ms)
    });
}

export const getTokenURIContent = async (token_uri: string) => {
    const url = process.env.IPFS_GATEWAY1 + token_uri.replace('ipfs://', '')
    console.log('url', url)
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    const response = await axios.get(url, {headers})
    return response.data
}

export const signMessageByWallet = (wallet: Wallet, message: string): string => {
    return joinSignature(wallet._signingKey().signDigest(message))
}

export const signMessageAndSplitByWallet = (wallet: Wallet, message: string): Signature => {
    return splitSignature(wallet._signingKey().signDigest(message))
}

export const getGasUsedFromReceipt = (receipt: ContractReceipt): number => {
    return bnToNumber(receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice))
}

export const getLogFromReceipt = (receipt: ContractReceipt, contract: Contract,  event_name: string): any => {
    for (let log of receipt.logs) {
        const parsed = contract.interface.parseLog(log)
        if (parsed.name === event_name) {
            return parsed.args  // 事件的参数
        }
    }

    return null
}