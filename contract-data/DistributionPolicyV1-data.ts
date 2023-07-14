// deployed_index: 13
// deployed_at: 2023/07/14 18:02:32

import {ProxyContractData} from "../helpers/interfaces/proxy_contract_data_interface";
const DistributionPolicyV1_data: ProxyContractData = {
    env: 'test',
    network: 'goerli',
    contract_name: 'DistributionPolicyV1',
    address: '0x913d948A9e3e25b02d5Cb78eD25Ed063B322aFd4',
    proxy_address: '0x913d948A9e3e25b02d5Cb78eD25Ed063B322aFd4',
    target_address: '0xA90ac48eC23417D47E7366764780DF255b445190',
    libraries: [],
    abi:  [
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
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint96",
          "name": "direct_element_rate",
          "type": "uint96"
        },
        {
          "indexed": false,
          "internalType": "uint96",
          "name": "superior_element_rate",
          "type": "uint96"
        },
        {
          "indexed": false,
          "internalType": "uint96",
          "name": "original_element_rate",
          "type": "uint96"
        }
      ],
      "name": "SetElementCreatersRate",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint96",
          "name": "original_creator_rate",
          "type": "uint96"
        },
        {
          "indexed": false,
          "internalType": "uint96",
          "name": "element_creators_rate",
          "type": "uint96"
        }
      ],
      "name": "SetOriginalCreatorAndElementsRate",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint96",
          "name": "royalty_fee",
          "type": "uint96"
        }
      ],
      "name": "SetRoyaltyFee",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "DENOMINATOR",
      "outputs": [
        {
          "internalType": "uint96",
          "name": "",
          "type": "uint96"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "element_creators_rate",
      "outputs": [
        {
          "internalType": "uint96",
          "name": "",
          "type": "uint96"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "element_direct_quote_element_creator_rate",
      "outputs": [
        {
          "internalType": "uint96",
          "name": "",
          "type": "uint96"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "element_original_quote_element_creator_rate",
      "outputs": [
        {
          "internalType": "uint96",
          "name": "",
          "type": "uint96"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "element_superior_quote_element_creator_rate",
      "outputs": [
        {
          "internalType": "uint96",
          "name": "",
          "type": "uint96"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "creator",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "original_element_creator",
              "type": "address"
            },
            {
              "internalType": "address[]",
              "name": "element_creators",
              "type": "address[]"
            },
            {
              "internalType": "address[]",
              "name": "element_quote_element_creators",
              "type": "address[]"
            }
          ],
          "internalType": "struct DistributionStructs.DistributionRole",
          "name": "_distribution_role",
          "type": "tuple"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "getDistributedResult",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_treasury_address",
          "type": "address"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "original_creator_rate",
      "outputs": [
        {
          "internalType": "uint96",
          "name": "",
          "type": "uint96"
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
      "inputs": [],
      "name": "royalty_fee",
      "outputs": [
        {
          "internalType": "uint96",
          "name": "",
          "type": "uint96"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint96",
          "name": "_direct_element_rate",
          "type": "uint96"
        },
        {
          "internalType": "uint96",
          "name": "_superior_element_rate",
          "type": "uint96"
        },
        {
          "internalType": "uint96",
          "name": "_original_element_rate",
          "type": "uint96"
        }
      ],
      "name": "setElementCreatersRate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint96",
          "name": "_original_creator_rate",
          "type": "uint96"
        },
        {
          "internalType": "uint96",
          "name": "_element_creators_rate",
          "type": "uint96"
        }
      ],
      "name": "setOriginalCreatorAndElementsRate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint96",
          "name": "_royalty_fee",
          "type": "uint96"
        }
      ],
      "name": "setRoyaltyFee",
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
      "inputs": [],
      "name": "treasury",
      "outputs": [
        {
          "internalType": "contract ITreasury",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "version",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],
  
};

export default DistributionPolicyV1_data;
