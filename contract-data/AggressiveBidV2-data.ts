// deployed_index: 32
// deployed_at: 2023/08/28 19:48:46

import {ProxyContractData} from "../helpers/interfaces/proxy_contract_data_interface";
const AggressiveBidV2_data: ProxyContractData = {
    env: 'dev',
    network: 'goerli',
    contract_name: 'AggressiveBidV2',
    address: '0x0035a3Dd7D7c7A51C6fe6ED46891296BC55afE05',
    proxy_address: '0x0035a3Dd7D7c7A51C6fe6ED46891296BC55afE05',
    target_address: '0x89C6F8D60315a87C18b1e33298f35780A5f865C1',
    libraries: [],
    abi:  [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "caller",
          "type": "address"
        },
        {
          "components": [
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "trader",
                  "type": "address"
                },
                {
                  "internalType": "enum AggressiveBidStructs.Side",
                  "name": "side",
                  "type": "uint8"
                },
                {
                  "internalType": "enum AggressiveBidStructs.OrderType",
                  "name": "orderType",
                  "type": "uint8"
                },
                {
                  "internalType": "address",
                  "name": "collection",
                  "type": "address"
                },
                {
                  "internalType": "enum AggressiveBidStructs.AssetType",
                  "name": "assetType",
                  "type": "uint8"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "paymentToken",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "price",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "listingTime",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "expirationTime",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "trader_nonce",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "extraParams",
                  "type": "bytes"
                }
              ],
              "internalType": "struct AggressiveBidStructs.Order",
              "name": "order",
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
            },
            {
              "internalType": "bytes",
              "name": "extraSignature",
              "type": "bytes"
            },
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "root",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "proof",
                  "type": "bytes32[]"
                }
              ],
              "internalType": "struct AggressiveBidStructs.MerkleTree",
              "name": "merkleTree",
              "type": "tuple"
            },
            {
              "internalType": "uint256",
              "name": "blockNumber",
              "type": "uint256"
            }
          ],
          "indexed": false,
          "internalType": "struct AggressiveBidStructs.Input",
          "name": "sell",
          "type": "tuple"
        },
        {
          "components": [
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "trader",
                  "type": "address"
                },
                {
                  "internalType": "enum AggressiveBidStructs.Side",
                  "name": "side",
                  "type": "uint8"
                },
                {
                  "internalType": "enum AggressiveBidStructs.OrderType",
                  "name": "orderType",
                  "type": "uint8"
                },
                {
                  "internalType": "address",
                  "name": "collection",
                  "type": "address"
                },
                {
                  "internalType": "enum AggressiveBidStructs.AssetType",
                  "name": "assetType",
                  "type": "uint8"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "paymentToken",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "price",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "listingTime",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "expirationTime",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "trader_nonce",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "extraParams",
                  "type": "bytes"
                }
              ],
              "internalType": "struct AggressiveBidStructs.Order",
              "name": "order",
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
            },
            {
              "internalType": "bytes",
              "name": "extraSignature",
              "type": "bytes"
            },
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "root",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "proof",
                  "type": "bytes32[]"
                }
              ],
              "internalType": "struct AggressiveBidStructs.MerkleTree",
              "name": "merkleTree",
              "type": "tuple"
            },
            {
              "internalType": "uint256",
              "name": "blockNumber",
              "type": "uint256"
            }
          ],
          "indexed": false,
          "internalType": "struct AggressiveBidStructs.Input",
          "name": "buy",
          "type": "tuple"
        }
      ],
      "name": "Executed",
      "type": "event"
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
          "indexed": false,
          "internalType": "bytes32",
          "name": "hash",
          "type": "bytes32"
        }
      ],
      "name": "OrderCancelled",
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
          "name": "aggressive_bid_distbn_address",
          "type": "address"
        }
      ],
      "name": "SetAggressiveBidDistribution",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "aggressive_bid_pool",
          "type": "address"
        }
      ],
      "name": "SetAggressiveBidPool",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "new_verifier_address",
          "type": "address"
        }
      ],
      "name": "SetVerifierAddress",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "ysgh_pool_address",
          "type": "address"
        }
      ],
      "name": "SetYsghPool",
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
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint96",
          "name": "transfer_fee_numberator",
          "type": "uint96"
        }
      ],
      "name": "UpdatedTransferFeeFromAggressiveBidDistribution",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "aggressive_bid_distribution",
      "outputs": [
        {
          "internalType": "contract IAggressiveBidDistribution",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "aggressive_bid_pool_v2",
      "outputs": [
        {
          "internalType": "contract IAggressiveBidPoolV2",
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
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "cancelled_or_filled",
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
      "inputs": [
        {
          "components": [
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "trader",
                  "type": "address"
                },
                {
                  "internalType": "enum AggressiveBidStructs.Side",
                  "name": "side",
                  "type": "uint8"
                },
                {
                  "internalType": "enum AggressiveBidStructs.OrderType",
                  "name": "orderType",
                  "type": "uint8"
                },
                {
                  "internalType": "address",
                  "name": "collection",
                  "type": "address"
                },
                {
                  "internalType": "enum AggressiveBidStructs.AssetType",
                  "name": "assetType",
                  "type": "uint8"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "paymentToken",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "price",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "listingTime",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "expirationTime",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "trader_nonce",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "extraParams",
                  "type": "bytes"
                }
              ],
              "internalType": "struct AggressiveBidStructs.Order",
              "name": "order",
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
            },
            {
              "internalType": "bytes",
              "name": "extraSignature",
              "type": "bytes"
            },
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "root",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "proof",
                  "type": "bytes32[]"
                }
              ],
              "internalType": "struct AggressiveBidStructs.MerkleTree",
              "name": "merkleTree",
              "type": "tuple"
            },
            {
              "internalType": "uint256",
              "name": "blockNumber",
              "type": "uint256"
            }
          ],
          "internalType": "struct AggressiveBidStructs.Input",
          "name": "_input",
          "type": "tuple"
        }
      ],
      "name": "checkInput",
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
      "inputs": [
        {
          "components": [
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "trader",
                  "type": "address"
                },
                {
                  "internalType": "enum AggressiveBidStructs.Side",
                  "name": "side",
                  "type": "uint8"
                },
                {
                  "internalType": "enum AggressiveBidStructs.OrderType",
                  "name": "orderType",
                  "type": "uint8"
                },
                {
                  "internalType": "address",
                  "name": "collection",
                  "type": "address"
                },
                {
                  "internalType": "enum AggressiveBidStructs.AssetType",
                  "name": "assetType",
                  "type": "uint8"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "paymentToken",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "price",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "listingTime",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "expirationTime",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "trader_nonce",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "extraParams",
                  "type": "bytes"
                }
              ],
              "internalType": "struct AggressiveBidStructs.Order",
              "name": "order",
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
            },
            {
              "internalType": "bytes",
              "name": "extraSignature",
              "type": "bytes"
            },
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "root",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "proof",
                  "type": "bytes32[]"
                }
              ],
              "internalType": "struct AggressiveBidStructs.MerkleTree",
              "name": "merkleTree",
              "type": "tuple"
            },
            {
              "internalType": "uint256",
              "name": "blockNumber",
              "type": "uint256"
            }
          ],
          "internalType": "struct AggressiveBidStructs.Input",
          "name": "_sell",
          "type": "tuple"
        },
        {
          "components": [
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "trader",
                  "type": "address"
                },
                {
                  "internalType": "enum AggressiveBidStructs.Side",
                  "name": "side",
                  "type": "uint8"
                },
                {
                  "internalType": "enum AggressiveBidStructs.OrderType",
                  "name": "orderType",
                  "type": "uint8"
                },
                {
                  "internalType": "address",
                  "name": "collection",
                  "type": "address"
                },
                {
                  "internalType": "enum AggressiveBidStructs.AssetType",
                  "name": "assetType",
                  "type": "uint8"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "paymentToken",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "price",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "listingTime",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "expirationTime",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "trader_nonce",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "extraParams",
                  "type": "bytes"
                }
              ],
              "internalType": "struct AggressiveBidStructs.Order",
              "name": "order",
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
            },
            {
              "internalType": "bytes",
              "name": "extraSignature",
              "type": "bytes"
            },
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "root",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes32[]",
                  "name": "proof",
                  "type": "bytes32[]"
                }
              ],
              "internalType": "struct AggressiveBidStructs.MerkleTree",
              "name": "merkleTree",
              "type": "tuple"
            },
            {
              "internalType": "uint256",
              "name": "blockNumber",
              "type": "uint256"
            }
          ],
          "internalType": "struct AggressiveBidStructs.Input",
          "name": "_buy",
          "type": "tuple"
        }
      ],
      "name": "execute",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "fee_denominator",
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
              "name": "trader",
              "type": "address"
            },
            {
              "internalType": "enum AggressiveBidStructs.Side",
              "name": "side",
              "type": "uint8"
            },
            {
              "internalType": "enum AggressiveBidStructs.OrderType",
              "name": "orderType",
              "type": "uint8"
            },
            {
              "internalType": "address",
              "name": "collection",
              "type": "address"
            },
            {
              "internalType": "enum AggressiveBidStructs.AssetType",
              "name": "assetType",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "paymentToken",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "listingTime",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "expirationTime",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "trader_nonce",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "extraParams",
              "type": "bytes"
            }
          ],
          "internalType": "struct AggressiveBidStructs.Order",
          "name": "_order",
          "type": "tuple"
        }
      ],
      "name": "hashOrder",
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
          "internalType": "address",
          "name": "_aggressive_bid_distbn_address",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_ysgh_pool_address",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_aggressive_bid_pool_v2",
          "type": "address"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "nonces",
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
      "inputs": [
        {
          "internalType": "address",
          "name": "_aggressive_bid_distbn_address",
          "type": "address"
        }
      ],
      "name": "setAggressiveBidDistribution",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_aggressive_bid_pool_v2",
          "type": "address"
        }
      ],
      "name": "setAggressiveBidPool",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_verifier_address",
          "type": "address"
        }
      ],
      "name": "setVerifierAddress",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_ysgh_pool_address",
          "type": "address"
        }
      ],
      "name": "setYsghPool",
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
      "name": "transfer_fee_numberator",
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
      "name": "unpause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "updateTransferFeeFromAggressiveBidDistribution",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "verifier_address",
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
      "name": "ysgh_pool",
      "outputs": [
        {
          "internalType": "contract IYsghPool",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],
  
};

export default AggressiveBidV2_data;