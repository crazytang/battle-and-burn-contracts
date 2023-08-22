// deployed_index: 2
// deployed_at: 2023/08/22 09:48:46

import {ProxyContractData} from "../helpers/interfaces/proxy_contract_data_interface";
const CreationRewardPool_data: ProxyContractData = {
    env: 'dev',
    network: 'goerli',
    contract_name: 'CreationRewardPool',
    address: '0xcf77a632E37A696a1309B8470273049755a7EB25',
    proxy_address: '0xcf77a632E37A696a1309B8470273049755a7EB25',
    target_address: '0x0a03710B3b3AB3148eD07921d8a48d3CCa96634c',
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
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Paused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Unpaused",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "claimReward",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "distribution_policy",
      "outputs": [
        {
          "internalType": "contract IDistributionPolicyV1",
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
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getClaimableRewardAmount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getDistributionRole",
      "outputs": [
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
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user_address",
          "type": "address"
        }
      ],
      "name": "getUserRewardData",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "user_address",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "claimable_amount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "claimed_amount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "last_claimed_at",
              "type": "uint256"
            }
          ],
          "internalType": "struct DistributionStructs.UserRewardData",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
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
      "name": "pause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "paused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
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
          "components": [
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
          "internalType": "struct DistributionStructs.DistributionRoleParams",
          "name": "_distribution_role_params",
          "type": "tuple"
        },
        {
          "internalType": "address",
          "name": "_distribution_policy",
          "type": "address"
        }
      ],
      "name": "setDistributionRoles",
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
      "name": "unpause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ],
  
};

export default CreationRewardPool_data;
