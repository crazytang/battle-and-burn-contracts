// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


interface IYsghPool {
    function deposit() external payable;
    //    function depositWETH(uint256 _amount) external;
    function withdraw(uint256 _amount) external;
    function withdrawTo(address _to, uint256 _amount) external;
    //    function withdrawWETH(uint256 _amount) external;
    function transferFrom(address _from, address _to, uint256 _amount) external;
    //    function transferWETHFrom(address _from, address _to, uint256 _amount) external;

    function getUserBalance(address _user) external view returns (uint256);
}
