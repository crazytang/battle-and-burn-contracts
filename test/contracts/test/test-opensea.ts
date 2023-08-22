import {ERC1155, ERC1155__factory} from "../../../typechain-types";
import {contract_l2_provider_getter} from "../../../helpers/providers/contract_provider_getter";
import {BigNumber, ethers} from "ethers";



const main = async () => {
    const l2_rpc = 'https://eth-mainnet.g.alchemy.com/v2/bWhXs3Z1XxeReXb6YAQW4N6uXHJvQ1Bm'
    console.log('l2 connected to', l2_rpc)
    const provider = new ethers.providers.JsonRpcProvider(l2_rpc)
    const network = await provider.getNetwork()
    console.log('chainId', network.chainId)

    const opensea_nft_address = '0x495f947276749Ce646f68AC8c248420045cb7b5e'
    const opensea_nft: ERC1155 = ERC1155__factory.connect(opensea_nft_address, provider)
    const token_id = BigNumber.from('65535383984772835217871324242620923008768428360509803688634088876487752024089')
    const uri = await opensea_nft.uri(token_id)
    console.log('uri', uri)
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
})