import {Provider} from "@ethersproject/abstract-provider";
import {Wallet} from "ethers";
import {getKeystorePassword} from "../utils";
import fs from "fs";


export const get_user_wallet_4871 = function (provider: Provider): Wallet {
    const key_store = __dirname+'/../../resources/keystores/0x90b30e8d7Eaf82039AD0cABC548B107663514871-keystore.json'
    return get_wallet_from_keystore(key_store, provider)
}

export const get_user_wallet_5712 = function (provider: Provider): Wallet {
    const key_store = __dirname+'/../../resources/keystores/0x6b2a60BD10dfb6a81c0a8a4Db4EC12b97DCA5712-keystore.json'
    return get_wallet_from_keystore(key_store, provider)
}

export const get_user_wallet_e265 = function (provider: Provider): Wallet {
    const key_store = __dirname+'/../../resources/keystores/0x8eC43dDe8595290fa598908A904a4681e45ee265-keystore.json'
    return get_wallet_from_keystore(key_store, provider)
}

export const get_user_wallet_114a = function (provider: Provider): Wallet {
    const key_store = __dirname+'/../../resources/keystores/0x317a62424dab93746F29CBA53988082145e3114a-keystore.json'
    return get_wallet_from_keystore(key_store, provider)
}

export const get_user_wallet_5AD8 = function (provider: Provider): Wallet {
    const key_store = __dirname+'/../../resources/keystores/0xCA59753990E3bc2E6Ec3FE3fbFB42A921bF95AD8-keystore.json'
    return get_wallet_from_keystore(key_store, provider)
}

export const get_user_wallet_d05a = function (provider: Provider): Wallet {
    const key_store = __dirname+'/../../resources/keystores/0xedeAEa2Fee53C9d105a84Fc58215A575F346d05a-keystore.json'
    return get_wallet_from_keystore(key_store, provider)
}

export const get_user_wallet_90e2 = function (provider: Provider): Wallet {
    const key_store = __dirname+'/../../resources/keystores/0xfAad8649488B59c799290b38B0625ec44d2490e2-keystore.json'
    return get_wallet_from_keystore(key_store, provider)
}

const get_wallet_from_keystore = function (keystore: string, provider: Provider): Wallet {
    const key_store_content = fs.readFileSync(keystore, 'utf-8')
    return Wallet.fromEncryptedJsonSync(key_store_content, getKeystorePassword()).connect(provider);
}