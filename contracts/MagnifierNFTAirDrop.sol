// ##deployed index: 7
// ##deployed at: 2023/08/03 19:26:36
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./dependencies/IERC1155Receiver.sol";
import "./dependencies/Ownable.sol";
import "./dependencies/Address.sol";
import "./interfaces/IMagnifierNFT.sol";

contract MagnifierNFTAirDrop is IERC1155Receiver, Ownable {
    uint96 public constant MAX_SUPPLY = 100;
    mapping(address => bool) public user_claimed;

    IMagnifierNFT public magnifier_nft;
    uint256 public magnifier_nft_token_id;
    uint256 public total_claimed;
    uint256 public deadline;

    address public refund_address;

    event Claimed(address indexed user, uint256 amount);
    event Refunded(address indexed user, uint256 amount);

    constructor(address _magnifier_nft_address, uint256 _deadline){
        require(Address.isContract(_magnifier_nft_address), "NFT address is not a contract");
        magnifier_nft = IMagnifierNFT(_magnifier_nft_address);
        deadline = _deadline;
    }

    function claim() external {
        require(block.timestamp < deadline, "Airdrop has ended");
        require(magnifier_nft.balanceOf(address(this), magnifier_nft_token_id) > 0, "Airdrop has claimed out");
        require(!Address.isContract(msg.sender), "Contract not allowed");
        require(!user_claimed[msg.sender], "You had already claimed");

        uint256 _claim_amount = 1;
        magnifier_nft.safeTransferFrom(address(this), msg.sender, magnifier_nft_token_id, _claim_amount, "");
        user_claimed[msg.sender] = true;

        total_claimed += _claim_amount;
        emit Claimed(msg.sender, _claim_amount);
    }

    function refund() external {
        require(block.timestamp > deadline, "Airdrop has not ended");
        require(refund_address != address(0), "Refund address not set");
        require(!Address.isContract(refund_address), "Contract not allowed");

        uint256 _refund_amount = magnifier_nft.balanceOf(address(this), magnifier_nft_token_id);
        require(_refund_amount > 0, "Airdrop has claimed out");

        magnifier_nft.safeTransferFrom(address(this), refund_address, magnifier_nft_token_id, _refund_amount, "");

        emit Refunded(refund_address, _refund_amount);
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == type(IERC1155Receiver).interfaceId;
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external returns (bytes4) {
        refund_address = operator;
        magnifier_nft_token_id = id;
        return bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"));
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external returns (bytes4) {
        return bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"));
    }
}
