import {Wallet} from "ethers";
import {Provider} from "@ethersproject/abstract-provider";
import {get_user_wallet_4871} from "./user_wallet_getter";

export const get_admin_wallet = (provider: Provider): Wallet => {
    const admin_wallet: Wallet = get_user_wallet_4871(provider)
    console.log('admin_wallet:', admin_wallet.address);
    return admin_wallet
}
