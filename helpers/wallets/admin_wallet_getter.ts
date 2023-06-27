import {Wallet} from "ethers";
import {Provider} from "@ethersproject/abstract-provider";

export const get_admin_wallet = (provider: Provider): Wallet => {
    const admin_private_key = '0x215612a485e1f812fc51a4b4187156362c9bbab64be06d69b6917a756f71c652'; // 0x57f416321aBE90aAaa9c449306b862c7E927adbb

    const admin_wallet: Wallet = new Wallet(admin_private_key, provider);
    console.log('admin_wallet:', admin_wallet.address);
    return admin_wallet
}

