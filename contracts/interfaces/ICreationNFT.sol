// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/DistributionStructs.sol";
import "./IDistributionPolicyV1.sol";

interface ICreationNFT {

    event SetDistributionPolicy(address distribution_policy_address);
    event RemainingRewardToTreasury(address indexed treasury_address, uint256 amount);
    event AddedRewardUser(address new_user_address);

    function nonces(address _user_address) external view returns (uint256);

    function distribution_policy() external view returns (IDistributionPolicyV1);
//    function users_reward_data(address _user_address) external view returns (DistributionStructs.UserRewardData memory);

    function setDistributionPolicy(address _distribution_policy_address) external;
    function mint(address _to, uint256 _tokenId) external;

//    function setRoyalty(address _to, uint96 _fee) external;

//    function setBaseURI(string calldata tokenURI) external;
    function claimReward() external;


    function baseURI() external view returns (string memory);

    function maxSupply() external view returns (uint256);

    function getDistributionRole() external view returns (DistributionStructs.DistributionRole memory);

    function getUserRewardData(address _user_address) external view returns (DistributionStructs.UserRewardData memory);
    function getClaimableRewardAmount(address _user) external view returns (uint256);
}
