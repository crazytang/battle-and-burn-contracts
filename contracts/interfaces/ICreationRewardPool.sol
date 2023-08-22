// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IDistributionPolicyV1.sol";

interface ICreationRewardPool {

    function distribution_policy() external view returns (IDistributionPolicyV1);

    function royalty_fee() external view returns (uint96);
}
