import axios from "axios";
import {keccak256} from "@ethersproject/keccak256";

export const make_provenance_hash = async (baseURI: string): Promise<string> => {
    const url = process.env.IPFS_GATEWAY1 + baseURI.replace('ipfs://', '')
    console.log('url', url)
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    const response = await axios.get(url, {headers})
    const content = response.data
    const regex = /<a href="(.*?)">\d+<\/a>/g
    const matches = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
        matches.push(match[1]);
    }

    let allMetadataString = ""
    if (matches.length > 0) {
        const file_url = 'https://ipfs.io' + matches[0]
        const file_response = await axios.get(file_url, {headers})
        const file_content = file_response.data
        // 连接所有 NFT 的元数据字符串
        if (typeof file_content === "string") {
            allMetadataString += file_content
        } else {
            allMetadataString += JSON.stringify(file_content);
        }
    }
    // 计算 provenanceHash
    return keccak256(Buffer.from(allMetadataString))
}