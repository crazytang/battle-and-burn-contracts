import * as bip39 from "bip39";
import {ethers, Wallet} from "ethers";
import fs from "fs/promises";
import BIP32Factory from "bip32";
import * as ecc from "tiny-secp256k1";

export class WalletService {

    // 生成助记词
    static async generateMnemonic(len = '12'): Promise<string> {
        // 生成随机助记词，12个助记词：128，24个助记词：256
        if (len === '24') {
            return bip39.generateMnemonic(256);
        }
        return bip39.generateMnemonic(128);
    }


    // 通过助记词生成keystore
    // @param mnemonic 助记词
    // @param password 密码
    static async createKeystoreFromMnemonic(mnemonic: string, password: string): Promise<string> {
        const bip32 = BIP32Factory(ecc);
        // 根据助记词生成种子
        const seed = await bip39.mnemonicToSeed(mnemonic);

        // 使用 BIP32（HD Key）从种子派生路径
        const hdwallet = bip32.fromSeed(seed);
        const wallet_hdpath = "m/44'/60'/0'/0/0";
        const walletNode = hdwallet.derivePath(wallet_hdpath);

        if (!walletNode.privateKey) {
            throw new Error('无法获取私钥');
        }
        // 创建钱包实例
        const wallet = new ethers.Wallet(walletNode.privateKey);

        // 使用密码加密钱包并生成 keystore 文件
        return await wallet.encrypt(password)
    }

    // 保存keystore
    // @param keystore keystore内容
    // @param outputPath keystore文件路径
    static async saveKeystore(keystore: string, outputPath: string): Promise<void> {
        await fs.writeFile(outputPath, keystore);
    }

    // 通过keystore解锁钱包
    static async getWalletFromKeystoreFile(keystoreFilePath: string, password: string): Promise<Wallet> {
        // 读取 keystore 文件内容
        const keystoreJson = await fs.readFile(keystoreFilePath, 'utf8');

        // 从 keystore 和密码解密钱包
        return await Wallet.fromEncryptedJson(keystoreJson, password);
    }

    static async getWalletFromKeystore(keystore: string, password: string): Promise<Wallet> {
        // 从 keystore 和密码解密钱包
        return await Wallet.fromEncryptedJson(keystore, password);
    }
}