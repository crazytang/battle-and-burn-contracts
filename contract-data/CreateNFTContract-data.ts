// deployed_index: 6
// deployed_at: 2023/07/27 20:36:48

import {ContractData} from "../helpers/interfaces/contract_data_interface";
const CreateNFTContract_data: ContractData = {
    env: 'test',
    network: 'arbitrum-goerli',
    contract_name: 'CreateNFTContract',
    address: '0x745374fea697c9E320eeBfE292E9c46b62ba2c4f',
    libraries: [],
    abi:  [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
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
