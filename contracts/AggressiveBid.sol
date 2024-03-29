// ##deployed index: 9
// ##deployed at: 2023/08/06 18:19:10
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./dependencies/Initializable.sol";
import "./dependencies/OwnableUpgradeable.sol";
import "./dependencies/PausableUpgradeable.sol";
import "./dependencies/ReentrancyGuardUpgradeable.sol";
import "./dependencies/Address.sol";
import "./dependencies/IERC721.sol";
import "./dependencies/IERC1155.sol";
import "./dependencies/ECDSA.sol";
import "./dependencies/MerkleProof.sol";
import "./interfaces/IAggressiveBid.sol";
import "./interfaces/IAggressiveBidDistribution.sol";
import "./interfaces/IAggressiveBidPool.sol";
import "./libraries/AggressiveBidStructs.sol";
import "./libraries/UserStakeStructs.sol";

contract AggressiveBid is IAggressiveBid, Initializable, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable {

    using Address for address;  // for isContract
    using ECDSA for bytes32;

    IAggressiveBidDistribution public override aggressive_bid_distribution;
    IAggressiveBidPool public override aggressive_bid_pool;
    address public verifier_address;

    mapping(address => uint256) public override nonces;
    mapping(bytes32 => bool) public override cancelled_or_filled;

    /// @notice This method is called by the proxy contract to initialize the contract.
    function initialize(address _aggressive_bid_distbn_address, address _aggressive_bid_pool) public initializer {
        __Ownable_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        require(_aggressive_bid_distbn_address.isContract(), "AggressiveBid: _aggressive_bid_distbn_address is not a contract address");
        aggressive_bid_distribution = IAggressiveBidDistribution(_aggressive_bid_distbn_address);

        require(_aggressive_bid_pool.isContract(), "AggressiveBid: _aggressive_bid_pool is not a contract address");
        aggressive_bid_pool = IAggressiveBidPool(_aggressive_bid_pool);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function setAggressiveBidDistribution(address _aggressive_bid_distbn_address) external override onlyOwner {
        require(_aggressive_bid_distbn_address.isContract(), "AggressiveBid: _aggressive_bid_distbn_address is not a contract address");
        aggressive_bid_distribution = IAggressiveBidDistribution(_aggressive_bid_distbn_address);

        emit SetAggressiveBidDistribution(_aggressive_bid_distbn_address);
    }

    function setAggressiveBidPool(address _aggressive_bid_pool) external override onlyOwner {
        require(_aggressive_bid_pool.isContract(), "AggressiveBid: _aggressive_bid_pool is not a contract address");
        aggressive_bid_pool = IAggressiveBidPool(_aggressive_bid_pool);

        emit SetAggressiveBidPool(_aggressive_bid_pool);
    }

    function setVerifierAddress(address _verifier_address) external override onlyOwner {
        require(_verifier_address != address(0), "AggressiveBid: verifier address is zero address");
        verifier_address = _verifier_address;

        emit SetVerifierAddress(_verifier_address);
    }

    function execute(AggressiveBidStructs.Input calldata _sell, AggressiveBidStructs.Input calldata _buy) external override nonReentrant whenNotPaused {
        bytes32 _sell_order_hash = _hashOrder(_sell.order);
        bytes32 _buy_order_hash = _hashOrder(_buy.order);

        require(!cancelled_or_filled[_sell_order_hash], "AggressiveBid: sell order is cancelled or filled");
        require(!cancelled_or_filled[_buy_order_hash], "AggressiveBid: buy order is cancelled or filled");

        _checkOrderParameter(_sell.order);
        _checkOrderParameter(_buy.order);

        _checkOrderMath(_sell, _buy);
        _checkOrderAuthentication(_sell.order, _sell_order_hash, _sell.v, _sell.r, _sell.s);
        _checkOrderAuthentication(_buy.order, _buy_order_hash, _buy.v, _buy.r, _buy.s);

        _checkOrderExtraSignature(_sell_order_hash, _sell.extraSignature);
        _checkOrderExtraSignature(_buy_order_hash, _buy.extraSignature);

        if (_sell.order.orderType != AggressiveBidStructs.OrderType.FixedPrice) {
            _checkOrderMerkleProof(_buy, _buy_order_hash);
        }

        _fundsTransfer(_sell.order, _buy.order);
        _tokensTransfer(_sell.order.collection, _sell.order.trader, _buy.order.trader, _sell.order.tokenId, _sell.order.amount);

        cancelled_or_filled[_sell_order_hash] = true;
        cancelled_or_filled[_buy_order_hash] = true;

        nonces[_sell.order.trader] += 1;
        nonces[_buy.order.trader] += 1;

        emit Executed(msg.sender, _sell, _buy);
    }

    function hashOrder(AggressiveBidStructs.Order calldata _order) external pure override returns (bytes32) {
        return _hashOrder(_order);
    }

    function checkInput(AggressiveBidStructs.Input calldata _input) external view override returns (bool) {
        bytes32 _order_hash = _hashOrder(_input.order);
        _checkOrderParameter(_input.order);
        _checkOrderAuthentication(_input.order, _order_hash, _input.v, _input.r, _input.s);
        _checkOrderExtraSignature(_order_hash, _input.extraSignature);
        return true;
    }

    function _fundsTransfer(AggressiveBidStructs.Order calldata _sell_order, AggressiveBidStructs.Order calldata _buy_order) internal {
        uint96 _transfer_fee_numberator = aggressive_bid_distribution.bid_royalty_rate();
        uint96 _fee_denominator = aggressive_bid_distribution.denominator();

        require(_transfer_fee_numberator <= _fee_denominator,
            "AggressiveBid: transfer fee numberator must be less than or equal to fee denominator");

        uint256 _fee = _buy_order.price * _transfer_fee_numberator / _fee_denominator;

//        uint256 _to_seller_amount = _buy_order.price - _fee;

        if (_buy_order.paymentToken == address(0)) {
            UserStakeStructs.BidPoolUserStakedData memory _user_staked_data = aggressive_bid_pool.getUserStakedData(_buy_order.trader);

            require(_user_staked_data.balance >= _buy_order.price,
                "AggressiveBid: user's ETH balance must be greater or equal than price");

            aggressive_bid_pool.transferETHFrom(_buy_order.trader, _sell_order.trader, _buy_order.price,
                address(aggressive_bid_distribution), _fee);
        } else {
            revert("AggressiveBid: paymentToken is not supported");
        }
    }

    function _tokensTransfer(
        address collection,
        address from,
        address to,
        uint256 tokenId,
        uint256 amount
    ) internal {
        aggressive_bid_pool.transferNFTFrom(from, to, collection, tokenId, amount);
    }

    function _hashOrder(AggressiveBidStructs.Order calldata _order) private pure returns (bytes32) {
        return keccak256(bytes.concat(keccak256(abi.encode(
            _order.trader,
            _order.side,
            _order.orderType,
            _order.collection,
            _order.assetType,
            _order.tokenId,
            _order.amount,
            _order.paymentToken,
            _order.price,
            _order.listingTime,
            _order.expirationTime,
            _order.trader_nonce,
            _order.extraParams
        ))));
    }

    function _checkOrderParameter(AggressiveBidStructs.Order calldata _order) private view {
        require(_order.trader != address(0), "AggressiveBid: trader must be a valid address");
        require(_order.side == AggressiveBidStructs.Side.Buy || _order.side == AggressiveBidStructs.Side.Sell, "AggressiveBid: side must be buy or sell");
        require(_order.orderType == AggressiveBidStructs.OrderType.FixedPrice, "AggressiveBid: orderType must be fixed price");
        require(_order.collection != address(0), "AggressiveBid: collection must be a valid address");
        require(_order.assetType == AggressiveBidStructs.AssetType.ERC721 || _order.assetType == AggressiveBidStructs.AssetType.ERC1155, "AggressiveBid: assetType must be ERC721 or ERC1155");
        require(_order.tokenId >= 0, "AggressiveBid: tokenId must be greater or equal than 0");
        require(_order.amount > 0, "AggressiveBid: amount must be greater than 0");
        require(_order.price > 0, "AggressiveBid: price must be greater than 0");
        require(_order.listingTime < block.timestamp, "AggressiveBid: listingTime must be less than current timestamp");
        require(_order.expirationTime > block.timestamp, "AggressiveBid: expirationTime must be greater than current timestamp");

        if (_order.side == AggressiveBidStructs.Side.Buy) {
            require(_order.trader_nonce == nonces[_order.trader], "AggressiveBid: Buyer's trader_nonce must be equal to trader's nonce");
        }
    }

    function _checkOrderMath(AggressiveBidStructs.Input calldata _sell, AggressiveBidStructs.Input calldata _buy) private pure {
        require(_sell.order.side != _buy.order.side, "AggressiveBid: side must be opposite");
        require(_sell.order.orderType == _buy.order.orderType, "AggressiveBid: orderType must be fixed price");
        require(_sell.order.collection == _buy.order.collection, "AggressiveBid: collection must be equal to buy collection");
        require(_sell.order.assetType == _buy.order.assetType, "AggressiveBid: assetType must be equal to buy assetType");
        require(_sell.order.tokenId == _buy.order.tokenId, "AggressiveBid: tokenId must be equal to buy tokenId");
        require(_buy.order.price >= _sell.order.price, "AggressiveBid: price must be equal to buy price");
        require(_buy.order.amount == _sell.order.amount, "AggressiveBid: amount must be equal to buy amount");
    }

    function _checkOrderAuthentication(AggressiveBidStructs.Order calldata _order, bytes32 _order_hash, uint8 v, bytes32 r, bytes32 s) private pure {
        require(_order_hash.recover(v, r, s) == _order.trader, "AggressiveBid: order signature is invalid");
    }

    function _checkOrderExtraSignature(bytes32 _extra_hash, bytes calldata _extra_signature) private view {
        require(_extra_hash.recover(_extra_signature) == verifier_address,
            "AggressiveBid: order extra signature is invalid");
    }

    function _checkOrderMerkleProof(AggressiveBidStructs.Input calldata _buy, bytes32 _order_hash) private pure {
        require(MerkleProof.verify(_buy.merkleTree.proof, _buy.merkleTree.root, _order_hash),
            "AggressiveBid: order merkle proof is invalid");
    }

}
