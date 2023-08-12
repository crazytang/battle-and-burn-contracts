import {ethers} from "ethers"
import {Provider} from "@ethersproject/abstract-provider"

let contract_provider_getter: Provider
let l1_rpc ='' , l2_rpc =''
switch (process.env.APP_ENV) {
    case 'dev':
    case 'test':
    default:
        // l1_rpc = 'https://eth-goerli.g.alchemy.com/v2/fZ4bHjl2AL7bfyIQf4h2EkGjPq0jzjU8'
        // l1_rpc = 'http://127.0.0.1:8546'
        l1_rpc = 'https://goerli.infura.io/v3/c5830997fd564c40938e4bec9484bda7'
        // l1_rpc = 'https://eth-mainnet.g.alchemy.com/v2/bWhXs3Z1XxeReXb6YAQW4N6uXHJvQ1Bm'
        // l2_rpc = 'https://arb-goerli.g.alchemy.com/v2/WN9wqLwlRyV6JLqoP88RrjW_TvRvk7Pw'
        l2_rpc = 'https://arbitrum-goerli.infura.io/v3/' + process.env.INFURA_API_KEY
        l2_rpc = 'http://127.0.0.1:8546'
        // l2_rpc = 'http://192.168.2.32:8546'
        l2_rpc = 'http://8.210.85.28:8546'
        break
    case 'production':
        l1_rpc = ''
        l2_rpc = 'https://mainnet.infura.io/v3/b0ad1354b637443a871c602ec795fc71'
        l2_rpc = 'https://eth-mainnet.g.alchemy.com/v2/bWhXs3Z1XxeReXb6YAQW4N6uXHJvQ1Bm'
        break
}
// provider = new ethers.providers.InfuraProvider("kovan", "b0ad1354b637443a871c602ec795fc71")

export const contract_l1_provider_getter = () => {
    console.log('l1 connected to', l1_rpc)
    const provider = new ethers.providers.JsonRpcProvider(l1_rpc)
    provider.getNetwork().then((network) => {
        console.log('chainId', network.chainId)
    })
    return provider
}
export const contract_l2_provider_getter = () => {
    // return contract_l1_provider_getter()
    console.log('l2 connected to', l2_rpc)
    const provider = new ethers.providers.JsonRpcProvider(l2_rpc)
    provider.getNetwork().then((network) => {
        console.log('chainId', network.chainId)
    })
    return provider
}
