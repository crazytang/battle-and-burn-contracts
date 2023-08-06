// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IAggressiveBidDistribution.sol";
import "./IAggressiveBidPool.sol";
import "../libraries/AggressiveBidStructs.sol";

interface IAggressiveBid {

    event OrderCancelled(bytes32 hash);
    event SetAggressiveBidDistribution(address aggressive_bid_distbn_address);
    event SetAggressiveBidPool(address aggressive_bid_pool);
    event SetVerifierAddress(address new_verifier_address);
    event Executed(address indexed caller, AggressiveBidStructs.Input sell, AggressiveBidStructs.Input buy);

    function aggressive_bid_distribution() external view returns (IAggressiveBidDistribution);
    function aggressive_bid_pool() external view returns (IAggressiveBidPool);
    function cancelled_or_filled(bytes32 _hash) external view returns (bool);
    function nonces(address _user) external view returns (uint256);

    function setAggressiveBidDistribution(address _aggressive_bid_distbn_address) external;
    function setAggressiveBidPool(address _aggressive_bid_pool) external;
    function setVerifierAddress(address _verifier_address) external;
    function execute(AggressiveBidStructs.Input calldata _sell, AggressiveBidStructs.Input calldata _buy) external;

    function hashOrder(AggressiveBidStructs.Order calldata _order) external pure returns (bytes32);
    function checkInput(AggressiveBidStructs.Input calldata _input) external view returns (bool);
}
