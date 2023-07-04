// deployed_index: 40
// deployed_at: 2023/07/01 16:34:11

import {ContractData} from "../helpers/interfaces/contract_data_interface";
const ProxyAdmin_data: ContractData = {
    env: 'test',
    network: 'arbitrum-goerli',
    contract_name: 'ProxyAdmin',
    address: '0x89A9811e0AC5F4b49672dA87239b15bcD66d21FA',
    libraries: [],
    abi:  [
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
      "inputs": [
        {
          "internalType": "contract TransparentUpgradeableProxy",
          "name": "proxy",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "newAdmin",
          "type": "address"
        }
      ],
      "name": "changeProxyAdmin",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract TransparentUpgradeableProxy",
          "name": "proxy",
          "type": "address"
        }
      ],
      "name": "getProxyAdmin",
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
      "inputs": [
        {
          "internalType": "contract TransparentUpgradeableProxy",
          "name": "proxy",
          "type": "address"
        }
      ],
      "name": "getProxyImplementation",
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
    },
    {
      "inputs": [
        {
          "internalType": "contract TransparentUpgradeableProxy",
          "name": "proxy",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "implementation",
          "type": "address"
        }
      ],
      "name": "upgrade",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract TransparentUpgradeableProxy",
          "name": "proxy",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "implementation",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "upgradeAndCall",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    }
  ],
  
};

export default ProxyAdmin_data;
