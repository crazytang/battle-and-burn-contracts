import {Provider} from "@ethersproject/abstract-provider";
import {Wallet} from "ethers";


// 自动执行，不要用这个地址进行测试
export const get_robot_wallet = function (provider: Provider): Wallet {
    const robot_wallet: Wallet = new Wallet('0x58487a97ab7047473e88498d5477a950ef2038760df39dc86e57126c683eb394', provider);
    console.log('robot_wallet', robot_wallet.address);
    return robot_wallet;
}

export const get_user_wallet_413d = function (provider: Provider): Wallet {
    const user_wallet_413d: Wallet = new Wallet('0x7fe5da144cdf4d9236dfbb1ed02839e954b5eb0f958216f4cc671969a120cafe', provider);
    console.log('user_wallet_413d', user_wallet_413d.address);
    return user_wallet_413d;
}

export const get_user_wallet_adbb = function (provider: Provider): Wallet {
    const user_wallet: Wallet = new Wallet('0x0394934082afa4d46cf3c44da6ea8fb957f0797e0ac73d21451a2a9008d42ce1', provider);
    console.log('user_wallet_adbb', user_wallet.address);
    return user_wallet;
}

export const get_user_wallet_af13 = function (provider: Provider): Wallet {
    const user_wallet: Wallet = new Wallet('0xa8c889894c0310c90d5b9fb10ca99fe25d7a70c46962e953b67e29d33db5af13', provider);
    console.log('user_wallet_af13', user_wallet.address);
    return user_wallet;
}

export const get_user_wallet_ad0f = function (provider: Provider): Wallet {
    const user_wallet: Wallet = new Wallet('0x52c44b4db55dadaa1b28c2f096f9217b72e529e99696df644d4df1e7045cad0f', provider);
    console.log('user_wallet_ad0f', user_wallet.address);
    return user_wallet;
}

export const get_user_wallet_cb48 = function (provider: Provider): Wallet {
    const user_wallet: Wallet = new Wallet('0x98383f1eac79bc1551ddb901a21352c8df518047d474c83c2f44cef71bd9cb48', provider);
    console.log('user_wallet_cb48', user_wallet.address);
    return user_wallet;
}


export const get_ecosystem_wallet = function (provider: Provider): Wallet {
    const ecosystem_wallet: Wallet = new Wallet('0xdfe43970526b44b42142408e8942d44a8ec8b11211c55ee2dabc37c88d460c34', provider);
    console.log('ecosystem_wallet', ecosystem_wallet.address);
    return ecosystem_wallet;
}

export const get_foundation_wallet = function (provider: Provider): Wallet {
    const foundation_wallet: Wallet = new Wallet('0x58487a97ab7047473e88498d5477a950ef2038760df39dc86e57126c683eb394', provider);
    console.log('foundation_wallet', foundation_wallet.address);
    return foundation_wallet;
}

export const get_team_leader_wallet = function (provider: Provider): Wallet {
    const team_leader_wallet: Wallet = new Wallet('0x15d5a0bc420ca9ffa02128dbac739ad291b5181bf417ae7a11f876e329afd810', provider);
    console.log('team_leader_wallet', team_leader_wallet.address);
    return team_leader_wallet;
}
