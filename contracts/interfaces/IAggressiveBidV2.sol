// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IAggressiveBidDistribution.sol";
import "./IAggressiveBidPoolV2.sol";
import "../libraries/AggressiveBidStructs.sol";
import "./IYsghPool.sol";

interface IAggressiveBidV2 {

    event OrderCancelled(bytes32 hash);
    event SetAggressiveBidDistribution(address aggressive_bid_distbn_address);
    event SetAggressiveBidPool(address aggressive_bid_pool);
    event SetYsghPool(address ysgh_pool_address);
    event SetVerifierAddress(address new_verifier_address);
    event UpdatedTransferFeeFromAggressiveBidDistribution(uint96 transfer_fee_numberator);
    event Executed(address indexed caller, AggressiveBidStructs.Input sell, AggressiveBidStructs.Input buy);

    function aggressive_bid_distribution() external view returns (IAggressiveBidDistribution);
    function aggressive_bid_pool_v2() external view returns (IAggressiveBidPoolV2);
    function ysgh_pool() external view returns (IYsghPool);
    function cancelled_or_filled(bytes32 _hash) external view returns (bool);
    function nonces(address _user) external view returns (uint256);

    function setAggressiveBidDistribution(address _aggressive_bid_distbn_address) external;
    function setAggressiveBidPool(address _aggressive_bid_pool) external;
    function setYsghPool(address _ysgh_pool_address) external;

    function setVerifierAddress(address _verifier_address) external;
    function updateTransferFeeFromAggressiveBidDistribution() external;
    function execute(AggressiveBidStructs.Input calldata _sell, AggressiveBidStructs.Input calldata _buy) external;

    function hashOrder(AggressiveBidStructs.Order calldata _order) external pure returns (bytes32);
    function checkInput(AggressiveBidStructs.Input calldata _input) external view returns (bool);
}
