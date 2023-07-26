// deployed_index: 31
// deployed_at: 2023/07/26 10:41:44

import {ProxyContractData} from "../helpers/interfaces/proxy_contract_data_interface";
const NFTBattle_data: ProxyContractData = {
    env: 'test',
    network: 'goerli',
    contract_name: 'NFTBattle',
    address: '0x87f39Ef7c49786A85AB5ECc17CD66b50606e7e92',
    proxy_address: '0x87f39Ef7c49786A85AB5ECc17CD66b50606e7e92',
    target_address: '0x5dDe63F24d731E81108228bdE5ad2Ae06481421F',
    libraries: [],
    abi:  [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "match_id",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "winner_nft",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "winner_tokenId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "loser_nft",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "loser_tokenId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "burned_to_address",
          "type": "address"
        }
      ],
      "name": "Determined",
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
          "name": "new_nft_battle_pool",
          "type": "address"
        }
      ],
      "name": "SetNFTBattlePool",
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
      "inputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "matchId",
              "type": "bytes32"
            },
            {
              "internalType": "string",
              "name": "matchName",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "matchStartTime",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "matchEndTime",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "voteCount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "voteArenaCount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "voteChallengeCount",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "arenaNFT",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "arenaTokenId",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "arenaOwnerSignature",
              "type": "bytes"
            },
            {
              "internalType": "address",
              "name": "challengeNFT",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "challengeTokenId",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "challengeOwnerSignature",
              "type": "bytes"
            },
            {
              "internalType": "string",
              "name": "merkleTreeURI",
              "type": "string"
            },
            {
              "internalType": "bytes32",
              "name": "merkleTreeRoot",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "burnedAt",
              "type": "uint256"
            }
          ],
          "internalType": "struct MatchStructs.MatchData",
          "name": "_match_data",
          "type": "tuple"
        }
      ],
      "name": "checkArenaAndChallengeSignatures",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        },
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
          "internalType": "bytes32",
          "name": "_hash",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "_signer",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "_signature",
          "type": "bytes"
        }
      ],
      "name": "checkSign",
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
          "components": [
            {
              "internalType": "bytes32",
              "name": "matchId",
              "type": "bytes32"
            },
            {
              "internalType": "string",
              "name": "matchName",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "matchStartTime",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "matchEndTime",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "voteCount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "voteArenaCount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "voteChallengeCount",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "arenaNFT",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "arenaTokenId",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "arenaOwnerSignature",
              "type": "bytes"
            },
            {
              "internalType": "address",
              "name": "challengeNFT",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "challengeTokenId",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "challengeOwnerSignature",
              "type": "bytes"
            },
            {
              "internalType": "string",
              "name": "merkleTreeURI",
              "type": "string"
            },
            {
              "internalType": "bytes32",
              "name": "merkleTreeRoot",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "burnedAt",
              "type": "uint256"
            }
          ],
          "internalType": "struct MatchStructs.MatchData",
          "name": "_match_data",
          "type": "tuple"
        },
        {
          "internalType": "bool",
          "name": "_redeem_nft",
          "type": "bool"
        }
      ],
      "name": "determine",
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
              "internalType": "string",
              "name": "matchName",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "matchStartTime",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "matchEndTime",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "voteCount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "voteArenaCount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "voteChallengeCount",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "arenaNFT",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "arenaTokenId",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "arenaOwnerSignature",
              "type": "bytes"
            },
            {
              "internalType": "address",
              "name": "challengeNFT",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "challengeTokenId",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "challengeOwnerSignature",
              "type": "bytes"
            },
            {
              "internalType": "string",
              "name": "merkleTreeURI",
              "type": "string"
            },
            {
              "internalType": "bytes32",
              "name": "merkleTreeRoot",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "burnedAt",
              "type": "uint256"
            }
          ],
          "internalType": "struct MatchStructs.MatchData",
          "name": "_match_data",
          "type": "tuple"
        }
      ],
      "name": "determineBySys",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_match_id",
          "type": "bytes32"
        }
      ],
      "name": "getMatchData",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bytes32",
              "name": "matchId",
              "type": "bytes32"
            },
            {
              "internalType": "string",
              "name": "matchName",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "matchStartTime",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "matchEndTime",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "voteCount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "voteArenaCount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "voteChallengeCount",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "arenaNFT",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "arenaTokenId",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "arenaOwnerSignature",
              "type": "bytes"
            },
            {
              "internalType": "address",
              "name": "challengeNFT",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "challengeTokenId",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "challengeOwnerSignature",
              "type": "bytes"
            },
            {
              "internalType": "string",
              "name": "merkleTreeURI",
              "type": "string"
            },
            {
              "internalType": "bytes32",
              "name": "merkleTreeRoot",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "burnedAt",
              "type": "uint256"
            }
          ],
          "internalType": "struct MatchStructs.MatchData",
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
          "name": "_nft_address",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_nft_tokenId",
          "type": "uint256"
        }
      ],
      "name": "getNFTId",
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
          "name": "_nft_address",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_nft_tokenId",
          "type": "uint256"
        }
      ],
      "name": "getNFTKOScore",
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
          "name": "_nft_address",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_nft_tokenId",
          "type": "uint256"
        }
      ],
      "name": "getNFTWonMatches",
      "outputs": [
        {
          "internalType": "bytes32[]",
          "name": "",
          "type": "bytes32[]"
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
      "name": "getUserNonce",
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
          "internalType": "bytes32",
          "name": "_match_id",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "_match_start_time",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_match_end_time",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_nft_address",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_token_id",
          "type": "uint256"
        }
      ],
      "name": "hashMatchData",
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
      "inputs": [],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nft_battle_pool",
      "outputs": [
        {
          "internalType": "contract INFTBattlePool",
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
          "name": "_nft_battle_pool",
          "type": "address"
        }
      ],
      "name": "setNFTBattlePool",
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

export default NFTBattle_data;
