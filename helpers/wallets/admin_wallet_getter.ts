import {Wallet} from "ethers";
import {Provider} from "@ethersproject/abstract-provider";
import {get_user_wallet_4871} from "./user_wallet_getter";

export const get_admin_wallet = (provider: Provider): Wallet => {
    let admin_wallet: Wallet
    if (process.env.APP_ENV === 'production') {
        let admin_private_key = process.env.ADMIN_PRIVATE_KEY ?? ''
        admin_wallet = new Wallet(admin_private_key, provider);
    } else {
        admin_wallet = get_user_wallet_4871(provider)
    }

    console.log('admin_wallet:', admin_wallet.address);
    return admin_wallet
}
