// deployed_index: 2
// deployed_at: 2023/07/01 17:19:41

import {ProxyContractData} from "../helpers/interfaces/proxy_contract_data_interface";
const RoyaltyDistributor_data: ProxyContractData = {
    env: 'test',
    network: 'goerli',
    contract_name: 'RoyaltyDistributor',
    address: '0x268bEdbb2177f32044a06f4559178509073616c6',
    proxy_address: '0x268bEdbb2177f32044a06f4559178509073616c6',
    target_address: '0xE6c5AD48a51EBb9d8db4F7e62FdA7Bf595A940C0',
    libraries: [],
    abi:  [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "version",
          "type": "uint8"
        }
      ],
      "name": "Initialized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  
};

export default RoyaltyDistributor_data;
