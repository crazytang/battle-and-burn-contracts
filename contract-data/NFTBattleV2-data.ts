// deployed_index: 106
// deployed_at: 2023/08/27 16:27:47

import {ProxyContractData} from "../helpers/interfaces/proxy_contract_data_interface";
const NFTBattleV2_data: ProxyContractData = {
    env: 'dev',
    network: 'goerli',
    contract_name: 'NFTBattleV2',
    address: '0x5e33d70C664beF889A42891460598d1c9eEB17cA',
    proxy_address: '0x5e33d70C664beF889A42891460598d1c9eEB17cA',
    target_address: '0xF8783cBCd8a14Eb5E04970832C5A44F393A20223',
    libraries: [],
    abi:  [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
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
          "internalType": "string",
          "name": "merkleTreeURI",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "merkleTreeRoot",
          "type": "bytes32"
        }
      ],
      "name": "Determined",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
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
          "internalType": "string",
          "name": "winner_jpg",
          "type": "string"
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
          "internalType": "string",
          "name": "loser_jgp",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "merkleTreeURI",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "merkleTreeRoot",
          "type": "bytes32"
        }
      ],
      "name": "DeterminedIncludeJPG",
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
          "internalType": "bytes",
          "name": "arena_owner_signature",
          "type": "bytes"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "challenge_owner_signature",
          "type": "bytes"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "extra_signature",
          "type": "bytes"
        }
      ],
      "name": "MatchDataSignatures",
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
          "name": "create_nft_contract",
          "type": "address"
        }
      ],
      "name": "SetCreateNFTContract",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "creation_nft_address",
          "type": "address"
        }
      ],
      "name": "SetCreationNFTContract",
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
              "internalType": "uint256",
              "name": "matchListTime",
              "type": "uint256"
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
              "internalType": "string",
              "name": "arenaJPG",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "arenaOwner",
              "type": "address"
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
              "internalType": "string",
              "name": "challengeJPG",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "challengeOwner",
              "type": "address"
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
              "internalType": "bytes",
              "name": "extraSignature",
              "type": "bytes"
            }
          ],
          "internalType": "struct MatchStructsV2.MatchDataParam",
          "name": "_match_data_param",
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
      "stateMutability": "pure",
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
              "internalType": "string",
              "name": "votedJPG",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "NFTOwner",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "votedAt",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "extraSignature",
              "type": "bytes"
            }
          ],
          "internalType": "struct MatchStructsV2.UserVote",
          "name": "_user_vote",
          "type": "tuple"
        },
        {
          "internalType": "bytes",
          "name": "_signature",
          "type": "bytes"
        }
      ],
      "name": "checkUserVote",
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
      "name": "creation_nft_v2",
      "outputs": [
        {
          "internalType": "contract ICreationNFTV2",
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
          "components": [
            {
              "internalType": "bytes32",
              "name": "matchId",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "matchListTime",
              "type": "uint256"
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
              "internalType": "string",
              "name": "arenaJPG",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "arenaOwner",
              "type": "address"
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
              "internalType": "string",
              "name": "challengeJPG",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "challengeOwner",
              "type": "address"
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
              "internalType": "bytes",
              "name": "extraSignature",
              "type": "bytes"
            }
          ],
          "internalType": "struct MatchStructsV2.MatchDataParam",
          "name": "_match_data_param",
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
              "internalType": "uint256",
              "name": "matchListTime",
              "type": "uint256"
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
              "internalType": "string",
              "name": "arenaJPG",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "arenaOwner",
              "type": "address"
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
              "internalType": "string",
              "name": "challengeJPG",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "challengeOwner",
              "type": "address"
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
              "internalType": "bytes",
              "name": "extraSignature",
              "type": "bytes"
            }
          ],
          "internalType": "struct MatchStructsV2.MatchDataParam",
          "name": "_match_data_param",
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
          "components": [
            {
              "internalType": "bytes32",
              "name": "matchId",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "matchListTime",
              "type": "uint256"
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
              "internalType": "string",
              "name": "arenaJPG",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "arenaOwner",
              "type": "address"
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
              "internalType": "string",
              "name": "challengeJPG",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "challengeOwner",
              "type": "address"
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
              "internalType": "bytes",
              "name": "extraSignature",
              "type": "bytes"
            }
          ],
          "internalType": "struct MatchStructsV2.MatchDataParam",
          "name": "_match_data_param",
          "type": "tuple"
        },
        {
          "internalType": "bytes32",
          "name": "_token_meta_hash",
          "type": "bytes32"
        },
        {
          "internalType": "bool",
          "name": "_nft_redeem",
          "type": "bool"
        }
      ],
      "name": "determineIncludeJPG",
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
              "internalType": "uint256",
              "name": "matchListTime",
              "type": "uint256"
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
              "internalType": "string",
              "name": "arenaJPG",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "arenaOwner",
              "type": "address"
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
              "internalType": "string",
              "name": "challengeJPG",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "challengeOwner",
              "type": "address"
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
              "internalType": "bytes",
              "name": "extraSignature",
              "type": "bytes"
            }
          ],
          "internalType": "struct MatchStructsV2.MatchDataParam",
          "name": "_match_data_param",
          "type": "tuple"
        },
        {
          "internalType": "bytes32",
          "name": "_token_meta_hash",
          "type": "bytes32"
        }
      ],
      "name": "determineIncludeJPGBySys",
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
              "name": "arenaOwner",
              "type": "address"
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
              "internalType": "address",
              "name": "challengeOwner",
              "type": "address"
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
              "internalType": "bytes32",
              "name": "merkleTreeRoot",
              "type": "bytes32"
            },
            {
              "internalType": "enum MatchStructsV2.Winner",
              "name": "winner",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "determinedAt",
              "type": "uint256"
            }
          ],
          "internalType": "struct MatchStructsV2.MatchData",
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
            },
            {
              "internalType": "string",
              "name": "votedJPG",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "NFTOwner",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "votedAt",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "extraSignature",
              "type": "bytes"
            }
          ],
          "internalType": "struct MatchStructsV2.UserVote",
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
          "internalType": "address",
          "name": "_nft_address",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_token_id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_jpg",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "_jpg_owner",
          "type": "address"
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
      "name": "nft_battle_pool_v2",
      "outputs": [
        {
          "internalType": "contract INFTBattlePoolV2",
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
          "name": "_creation_nft_address",
          "type": "address"
        }
      ],
      "name": "setCreationNFT",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_nft_battle_pool_v2",
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
    }
  ],
  
};

export default NFTBattleV2_data;
