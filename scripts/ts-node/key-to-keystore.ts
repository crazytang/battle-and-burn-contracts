import {get_admin_wallet} from "../../helpers/wallets/admin_wallet_getter";
import {contract_l2_provider_getter} from "../../helpers/providers/contract_provider_getter";
import fs from "fs";
import {Wallet} from "ethers";
import {getKeystorePassword} from "../../helpers/utils";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    const private_key = '0xa4635dd81b9783c9216fc68b3c56440fc76f67a14280525b5ef8dcebe6bcd9ab'
    const user_wallet = new Wallet(private_key, contract_l2_provider_getter())
    const password = getKeystorePassword()
    const keystore_str = await user_wallet.encrypt(password)

    const keystore_filename = __dirname + '/../../resources/keystores/' + user_wallet.address + '-keystore.json'
    fs.writeFileSync(keystore_filename, keystore_str)

    console.log('keystore_filename', keystore_filename)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
