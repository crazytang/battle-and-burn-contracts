import {ContractData} from "./contract_data_interface";

export interface ProxyContractData extends ContractData {
    proxy_address: string,
    target_address: string,
}
