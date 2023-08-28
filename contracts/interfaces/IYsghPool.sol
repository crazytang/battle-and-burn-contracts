// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


interface IYsghPool {

    function aggressive_bid_address() external view returns (address);

    function setAggressiveBidAddress(address _aggressive_bid_address) external;

    function deposit() external payable;

    function depositTo(address _to) external payable;
    function withdraw(uint256 _amount) external;
    function withdrawTo(address _to, uint256 _amount) external;
    function transferFrom(address _from, address _to, uint256 _amount) external;
    function getUserBalance(address _user) external view returns (uint256);
}
