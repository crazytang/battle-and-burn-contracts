// deployed_index: 64
// deployed_at: 2023/07/20 13:47:33

import {ContractData} from "../helpers/interfaces/contract_data_interface";
const TestMerkleTree_data: ContractData = {
    env: 'test',
    network: 'arbitrum-goerli',
    contract_name: 'TestMerkleTree',
    address: '0xBBeB4d95a30632438BeEE3F9Cc2E6f97570642a2',
    libraries: [],
    abi:  [
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "a",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "b",
          "type": "bytes32"
        }
      ],
      "name": "compareBytes32",
      "outputs": [
        {
          "internalType": "int8",
          "name": "",
          "type": "int8"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "a",
          "type": "string"
        }
      ],
      "name": "getKeccak256",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "a",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "b",
          "type": "string"
        }
      ],
      "name": "getKeccak2562",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "bytes",
              "name": "matchId",
              "type": "bytes"
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
            },
            {
              "internalType": "uint256",
              "name": "voterNonce",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "votedAt",
              "type": "uint256"
            }
          ],
          "internalType": "struct MatchStructs.UserVote",
          "name": "_user_vote",
          "type": "tuple"
        }
      ],
      "name": "getUserVoteHash",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "bytes",
              "name": "matchId",
              "type": "bytes"
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
            },
            {
              "internalType": "uint256",
              "name": "voterNonce",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "votedAt",
              "type": "uint256"
            }
          ],
          "internalType": "struct MatchStructs.UserVote",
          "name": "_user_vote",
          "type": "tuple"
        },
        {
          "internalType": "bytes",
          "name": "_signature",
          "type": "bytes"
        }
      ],
      "name": "testSignOrder",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "bytes",
              "name": "matchId",
              "type": "bytes"
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
            },
            {
              "internalType": "uint256",
              "name": "voterNonce",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "votedAt",
              "type": "uint256"
            }
          ],
          "internalType": "struct MatchStructs.UserVote",
          "name": "_user_vote",
          "type": "tuple"
        },
        {
          "internalType": "uint8",
          "name": "v",
          "type": "uint8"
        },
        {
          "internalType": "bytes32",
          "name": "r",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "s",
          "type": "bytes32"
        }
      ],
      "name": "testSignOrder2",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32[]",
          "name": "proof",
          "type": "bytes32[]"
        },
        {
          "internalType": "bytes32",
          "name": "root",
          "type": "bytes32"
        },
        {
          "internalType": "string",
          "name": "leaf",
          "type": "string"
        }
      ],
      "name": "verfiyFromStr",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32[]",
          "name": "proof",
          "type": "bytes32[]"
        },
        {
          "internalType": "bytes32",
          "name": "root",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "leaf",
          "type": "bytes32"
        }
      ],
      "name": "verify",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    }
  ],
  
};

export default TestMerkleTree_data;
