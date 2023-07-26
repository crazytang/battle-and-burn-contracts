// import fs from "fs/promises";
import axios from "axios";
import fs from "fs";

export class IpfsService {
    private auth: string
    private gateway: string

    private proxy = undefined
    constructor() {
        this.gateway = process.env.INFURA_IPFS_GATEWAY ?? 'https://ipfs.infura.io:5001'

        this.auth = 'Basic ' + Buffer.from(`${process.env.INFURA_IPFS_APP_ID}:${process.env.INFURA_IPFS_SECRET}`).toString('base64')

        // this.proxy = {
        //     // protocol: 'https',
        //     host: '127.0.0.1',
        //     port: 7890
        // }
    }

    async uploadFile(file_name: string): Promise<string> {
        const action = '/api/v0/add'
        const url = this.gateway + action
        // console.log('url', url)
        const formData = new FormData();

        const content = fs.readFileSync(file_name)
        formData.append("file", new Blob([Uint8Array.from(content)]));

        try {
            const response = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': this.auth
                },
                // proxy: this.proxy,
            });
            // console.log('response', response.data)

            return 'ipfs://' + response.data['Hash']
        } catch (e: any) {
            throw new Error('status: ' + e.response.status + ', data: ' + e.response.data)
        }
    }
    /**
     * 上传目录下的所有文件到IPFS上，返回baseURI和所有文件的CID
     * @param path string 文件路径地址
     * @param prefix string 显示在ipfs上的文件名
     * @return Promise<string> 返回baseURI
     */
    async uploadDir(
        path: string,
        prefix: string
    ): Promise<string> {

        const action = '/api/v0/add'
        const url = this.gateway + action

        const formData = new FormData();

        const files = fs.readdirSync(path)
        for (let i = 0; i < files.length; i++) {
            const full_file_name = path + '/' + files[i]
            const content = fs.readFileSync(full_file_name)
            formData.append("file", new Blob([Uint8Array.from(content)]), prefix + '/' + files[i]);
        }

        const response = await axios.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': this.auth
            },
            proxy: this.proxy
        });
        const data = response.data.split('\n').filter((item: string | null) => item != null && item !== "");
        const last_data = JSON.parse(data[data.length - 1])
        return last_data['Hash'] ?? ''
    }

    async getDirFile(baseURI: string, file_name: string): Promise<object> {
        const url = 'https://ipfs.io/ipfs/' + baseURI + '/' + file_name
        // console.log('url', url)

        const response = await axios.get(url);

        return response.data
    }

    /**
     * 更新IPNS的指向
     * @param cid string
     * @param key string 自定义的公钥地址
     * @return Promise<string> 返回IPNS地址
     */
    /*    async updateToIPNS(cid: string, key?: string): Promise<string> {
            const options: any = {
                key: this.key ?? this.key,
            }

            const rs = await this.client.name.publish(cid, options)
            if (!this.key) {
                this.ipns_name = rs.name
            }

            return rs.name
        }*/

    /**
     * 获取IPNS地址
     * @return string
     */
    /*    getCurrentIPNSName(): string {
            if (!this.key) {
                return this.ipns_name
            } else {
                return this.key as any
            }
        }

        ipns_name!: string*/

    /*    async readDir(cid: string) {
          // const rs = this.client.get(path);
          // console.log(rs);
          // for await (const result of this.client.get(path)) {
          //     console.log(result);
          // }

          for await (const buf of this.client.ls(cid)) {
              console.log(buf);
          }
          console.log('done');
      }*/

    /*     Uint8ArrayToString(fileData){
          var dataString = "";
          for (var i = 0; i < fileData.length; i++) {
              dataString += String.fromCharCode(fileData[i]);
          }

          return dataString
      }*/
}
