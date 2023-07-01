// ##deployed index: 2
// ##deployed at: 2023/07/01 17:19:41
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./dependencies/Initializable.sol";
import "./dependencies/OwnableUpgradeable.sol";
import "./dependencies/ReentrancyGuardUpgradeable.sol";

contract RoyaltyDistributor is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    constructor(){

    }


    /// @notice This method is called by the proxy contract to initialize the contract.
    function initialize() public initializer {
        __Ownable_init();
        __ReentrancyGuard_init();
    }

    function getUserClaimableAmount(address user) external view returns (uint256) {
        return 0;
    }

    receive() external payable {
    }
}
