// deployed_index: 2
// deployed_at: 2023/06/02 14:01:07

import {ContractData} from "../helpers/interfaces/contract_data_interface";
const TestContract_data: ContractData = {
    env: 'test',
    network: 'arbitrum-goerli',
    contract_name: 'TestContract',
    address: '0x8F4E37f0960A2aBbb27F51DaeEAF8330b84a4c79',
    libraries: [],
    abi:  [
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
