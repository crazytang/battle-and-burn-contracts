import {Bytes, concat} from "@ethersproject/bytes"
import {toUtf8Bytes} from "@ethersproject/strings"
import {keccak256} from "@ethersproject/keccak256"
import {BigNumber} from "ethers"
import {defaultAbiCoder} from "@ethersproject/abi"

export const datetime_format = function (datetime: Date, fmt: string): string {
    var o: any = {
        "M+": datetime.getMonth() + 1,                   //月份
        "d+": datetime.getDate(),                        //日
        "h+": datetime.getHours(),                       //小时
        "m+": datetime.getMinutes(),                     //分
        "s+": datetime.getSeconds(),                     //秒
        "q+": Math.floor((datetime.getMonth() + 3) / 3), //季度
        "S": datetime.getMilliseconds()                  //毫秒
    }

    //  获取年份
    // ①
    if (/(y+)/i.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (datetime.getFullYear() + "").substr(4 - RegExp.$1.length))
    }

    for (var k in o) {
        // ②
        if (new RegExp("(" + k + ")", "i").test(fmt)) {
            fmt = fmt.replace(
                RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)))
        }
    }
    return fmt
}

export const nowTimestamp = function (): number {
    return Math.floor(Date.now() / 1000)
}
/**
 * 转换成大驼峰写法
 * @param str
 * @param separator
 * @return string
 */
export const toCamelCase = function (str: string, separator = '_'): string {
    var strArr = str.split(separator)
    for (var i = 0; i < strArr.length; i++) {
        strArr[i] = strArr[i].charAt(0).toUpperCase() + strArr[i].substring(1)
    }
    return strArr.join('')
}

export const hash_message = function(message: Bytes | string): string {
    const messagePrefix = "\x19Ethereum Signed Message:\n"
    if (typeof (message) === "string") {
        message = toUtf8Bytes(message)
    }
    return keccak256(concat([
        toUtf8Bytes(messagePrefix),
        // toUtf8Bytes(String(message.length)),
        message
    ]))
}

export const compareBytes32 = function(a: string, b: string): number {
    const aBigInt = BigNumber.from(a)
    const bBigInt = BigNumber.from(b)

    if (aBigInt > bBigInt) {
        return 1
    } else if (aBigInt < bBigInt) {
        return -1
    } else {
        return 0
    }
}

export const getKeystorePassword = function (): string {
    return process.env.KEYSTORE_PASSWORD ?? '12345678'
}