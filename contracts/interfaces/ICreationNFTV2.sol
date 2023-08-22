// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/DistributionStructs.sol";
import "./IDistributionPolicyV1.sol";
import "./ICreationRewardPool.sol";

interface ICreationNFTV2 {

    event SetCreationRewardPool(address creation_reward_pool_address);
    event RemainingRewardToTreasury(address indexed treasury_address, uint256 amount);

    function creation_reward_pool() external view returns (ICreationRewardPool);
    function nonces(address _user_address) external view returns (uint256);

    function setCreationRewardPool(address _creation_reward_pool_address) external;
    function mint(uint256 _tokenId, bytes32 _tokenHash) external;
    function burn(uint256 _tokenId) external;

}
