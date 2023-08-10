// deployed_index: 7
// deployed_at: 2023/08/10 14:35:27

import {ContractData} from "../helpers/interfaces/contract_data_interface";
const CreateNFTContract_data: ContractData = {
    env: 'test',
    network: 'arbitrum-goerli',
    contract_name: 'CreateNFTContract',
    address: '0xe5757C7F05Db0F86F79bfA22700E387316bD7f07',
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
          "indexed": true,
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "nft_address",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "CreatedNFT",
      "type": "event"
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
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "symbol",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "baseURI",
              "type": "string"
            },
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
              "name": "distribution_role_params",
              "type": "tuple"
            },
            {
              "internalType": "address",
              "name": "distribution_policy_address",
              "type": "address"
            }
          ],
          "internalType": "struct DistributionStructs.CreationNFTParams",
          "name": "_creation_nft_params",
          "type": "tuple"
        },
        {
          "internalType": "address",
          "name": "_nft_battle_pool_address",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "nft_redeem",
          "type": "bool"
        }
      ],
      "name": "jpgToNFT",
      "outputs": [
        {
          "internalType": "contract CreationNFT",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  
};

export default CreateNFTContract_data;
