// deployed_index: 2
// deployed_at: 2023/09/02 10:19:41

import {ProxyContractData} from "../helpers/interfaces/proxy_contract_data_interface";
const BattleKOScore_data: ProxyContractData = {
    env: 'dev',
    network: 'goerli',
    contract_name: 'BattleKOScore',
    address: '0x12A3335c30F03F3667bF8418bE0b47f5560522E8',
    proxy_address: '0x12A3335c30F03F3667bF8418bE0b47f5560522E8',
    target_address: '0xE3Add9E5192f10910567F6FE34E6c4dcA7AF20C0',
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
          "internalType": "address",
          "name": "nft_battle_v2_address",
          "type": "address"
        }
      ],
      "name": "SetNFTBattle",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "nft_address",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "score",
          "type": "uint256"
        }
      ],
      "name": "UpdatedBattleKOScore",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_nft_address",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_tokenId",
          "type": "uint256"
        }
      ],
      "name": "getKOScore",
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
      "inputs": [
        {
          "internalType": "address",
          "name": "_nft_battle_v2_address",
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
      "name": "nft_battle_v2",
      "outputs": [
        {
          "internalType": "contract INFTBattleV2",
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
          "name": "_nft_battle_v2_address",
          "type": "address"
        }
      ],
      "name": "setNFTBattle",
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
          "internalType": "address",
          "name": "_nft_address",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_tokenId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_score",
          "type": "uint256"
        }
      ],
      "name": "updateBattleKOScore",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  
};

export default BattleKOScore_data;
