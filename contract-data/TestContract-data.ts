// deployed_index: 6
// deployed_at: 2023/06/29 10:36:20

import {ContractData} from "../helpers/interfaces/contract_data_interface";
const TestContract_data: ContractData = {
    env: 'test',
    network: 'arbitrum-goerli',
    contract_name: 'TestContract',
    address: '0x259e132C4f175b48805BCd4ae4889df81D19ebD4',
    libraries: [],
    abi:  [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "contract_address",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "symbol",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "baseURI",
          "type": "string"
        }
      ],
      "name": "CreatedContract",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "createContract",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "matchId",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "voter",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "votedNFT",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "votedTokenId",
              "type": "uint256"
            }
          ],
          "internalType": "struct Structs.VoteResult",
          "name": "_result",
          "type": "tuple"
        }
      ],
      "name": "hashVoteResult",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    }
  ],
  
};

export default TestContract_data;
