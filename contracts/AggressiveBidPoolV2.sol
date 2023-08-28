// ##deployed index: 27
// ##deployed at: 2023/08/28 15:58:52
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./dependencies/Initializable.sol";
import "./dependencies/OwnableUpgradeable.sol";
import "./dependencies/PausableUpgradeable.sol";
import "./dependencies/ReentrancyGuardUpgradeable.sol";
import "./dependencies/IERC721.sol";
import "./dependencies/IERC165.sol";
import "./dependencies/Address.sol";
import "./libraries/UserStakeStructsV2.sol";
import "./interfaces/INFTBattlePoolV2.sol";
import "./interfaces/IApproveBySig.sol";
import "./interfaces/IAggressiveBid.sol";
import "./interfaces/IAggressiveBidPoolV2.sol";

contract AggressiveBidPoolV2 is IAggressiveBidPoolV2, Initializable, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable {

    bytes4 private constant INTERFACE_ID_APPROVEBYSIG = 0xc06dfe6c; // IApproveBySig.approveBySig.selector

    INFTBattlePoolV2 public override nft_battle_pool_v2;
    IAggressiveBid public override aggressive_bid;

    // user_address => (nft_address => (tokenId => amount))
    mapping(address => mapping(address => mapping(uint256 => uint256))) private users_nft_staked;

    // user_address => (nft_address => (tokenId => lastTradedAt))
    mapping(address => mapping(address => mapping(uint256 => uint256))) private users_nft_traded_at;

    // nft_address => (tokenId => owner_address)
    mapping(address => mapping(uint256 => address)) private nft_owners;

    modifier OnlyAggressiveBid() {
        require(msg.sender == address(aggressive_bid), "AggressiveBidPool: caller is not the AggressiveBid contract");
        _;
    }

    /// @notice This method is called by the proxy contract to initialize the contract.
    function initialize(address _nft_battle_pool) public initializer {
        __Ownable_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        require(Address.isContract(_nft_battle_pool), "AggressiveBidPool: nft_battle_address is not a contract");
        nft_battle_pool_v2 = INFTBattlePoolV2(_nft_battle_pool);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice 设置NFTBattlePool合约地址
    /// @param _nft_battle_pool_v2_address NFTBattlePool合约地址
    function setNFTBattlePool(address _nft_battle_pool_v2_address) external override onlyOwner {
        require(Address.isContract(_nft_battle_pool_v2_address), "AggressiveBidPool: nft_battle_address is not a contract");
        nft_battle_pool_v2 = INFTBattlePoolV2(_nft_battle_pool_v2_address);

        emit SetNFTBattlePool(_nft_battle_pool_v2_address);
    }

    /// @notice 设置AggressiveBid合约地址
    /// @param _aggressive_bid_address AggressiveBid合约地址
    function setAggressiveBid(address _aggressive_bid_address) external override onlyOwner {
        require(Address.isContract(_aggressive_bid_address), "AggressiveBidPool: aggressive_bid_address is not a contract");
        aggressive_bid = IAggressiveBid(_aggressive_bid_address);

        emit SetAggressiveBid(_aggressive_bid_address);
    }

    /// @notice 授权NFT和质押NFT
    /// @param _nft_address NFT地址
    /// @param _approve_data 授权签名数据
    function stakeNFT(address _nft_address, UserStakeStructsV2.ApprovalData calldata _approve_data) external override nonReentrant whenNotPaused {
        require(_nft_address != address(0), "AggressiveBidPool: NFT address is zero");

        IERC721 _nft = IERC721(_nft_address);
        require(_nft.ownerOf(_approve_data.tokenId) == _approve_data.userAddress, "AggressiveBidPool: NFT owner is not the owner of the token");
        require(IERC165(_nft_address).supportsInterface(INTERFACE_ID_APPROVEBYSIG), "AggressiveBidPool: NFT contract does not support IApproveBySig");

        IApproveBySig(_nft_address).approveBySig(_approve_data.userAddress, _approve_data.spender, _approve_data.tokenId, _approve_data.nonce, _approve_data.deadline, _approve_data.v, _approve_data.r, _approve_data.s);

        require(_nft.getApproved(_approve_data.tokenId) == address(this), "AggressiveBidPool: NFT contract does not approve this contract");
        _nft.transferFrom(_approve_data.userAddress, address(this), _approve_data.tokenId);
        _setUserNFTStaked(_approve_data.userAddress, _nft_address, _approve_data.tokenId, false);

        emit StakedNFT(_approve_data.userAddress, _nft_address, _approve_data.tokenId, 1);
    }

    /// @notice 从BattlePool池内转账NFT到AggressiveBidPool
    /// @param _nft_address NFT地址
    /// @param _tokenId NFT ID
    function stakeFromNFTBattlePool(address _nft_address, uint256 _tokenId) external override nonReentrant whenNotPaused {
        require(_nft_address != address(0), "AggressiveBidPool: NFT address is zero");

        address _owner = nft_battle_pool_v2.getNFTOwner(_nft_address, _tokenId);
        require(_owner == msg.sender, "AggressiveBidPool: NFT owner is not the owner of the token");

        nft_battle_pool_v2.redeemToAggressiveBidPool(msg.sender, _nft_address, _tokenId);

        IERC721 _nft = IERC721(_nft_address);
        require(_nft.ownerOf(_tokenId) == address(this), "AggressiveBidPool: AggressiveBid is not the owner of the token");

        _setUserNFTStaked(_owner, _nft_address, _tokenId, false);

        emit StakedFromNFTBattlePool(_owner, _nft_address, _tokenId, 1);
    }

    /// @notice 赎回自己的NFT
    /// @param _nft_address NFT地址
    /// @param _tokenId NFT ID
    function redeemNFT(address _nft_address, uint256 _tokenId) external override nonReentrant whenNotPaused {
        _redeem(msg.sender, _nft_address, _tokenId);
    }

    /// @notice 池内转账NFT
    /// @param _from 发送地址
    /// @param _to 接收地址
    /// @param _nft_address NFT地址
    /// @param _tokenId NFT ID
    /// @param _amount 转账数量
    function transferNFTFrom(address _from, address _to, address _nft_address, uint256 _tokenId, uint256 _amount) external override OnlyAggressiveBid whenNotPaused {
        require(_from != address(0), "AggressiveBidPool: _from address is zero");
        require(_to != address(0), "AggressiveBidPool: _to address is zero");
        require(_nft_address != address(0), "AggressiveBidPool: NFT address is zero");
        require(_from != _to, "AggressiveBidPool: _from address is equal to _to address");
        require(_amount == 1, "AggressiveBidPool: _amount is not equal to 1");

        require(_from == nft_owners[_nft_address][_tokenId], "AggressiveBidPool: _from is not the owner of the token");

        _removeUserNFTStakedData(_from, _nft_address, _tokenId);

        _setUserNFTStaked(_to, _nft_address, _tokenId, true);

        emit TransferedNFTFrom(_from, _to, _nft_address, _tokenId, _amount);
    }

    function isStakedNFT(address _user_address, address _nft_address, uint256 _tokenId) external view override returns (bool) {
        return users_nft_staked[_user_address][_nft_address][_tokenId] > 0;
    }

    /// @notice 获取NFT的拥有者
    /// @param _nft_address NFT地址
    /// @param _tokenId NFT的tokenId
    /// @return NFT的拥有者地址
    function getNFTOwner(address _nft_address, uint256 _tokenId) external view override returns (address) {
        return nft_owners[_nft_address][_tokenId];
    }

    function _redeem(address _owner_address, address _nft_address, uint256 _tokenId) private {
        require(_nft_address != address(0), "AggressiveBidPool: NFT address is zero");

        require(_owner_address == nft_owners[_nft_address][_tokenId], "AggressiveBidPool: _owner_address is not the owner of the token");

        IERC721 _nft = IERC721(_nft_address);
        require(_nft.ownerOf(_tokenId) == address(this), "AggressiveBidPool: AggressiveBid is not the owner of the token");

        _nft.transferFrom(address(this), _owner_address, _tokenId);

        _removeUserNFTStakedData(_owner_address, _nft_address, _tokenId);

        emit RedeemedNFT(_owner_address, _nft_address, _tokenId, 1);
    }

    function _setUserNFTStaked(address _user, address _nft_address, uint256 _tokenId, bool _is_trade) private {
        if (_is_trade) {
            users_nft_traded_at[_user][_nft_address][_tokenId] = block.timestamp;
        } else {
            users_nft_traded_at[_user][_nft_address][_tokenId] = 0;
        }

        users_nft_staked[_user][_nft_address][_tokenId] = 1;
        nft_owners[_nft_address][_tokenId] = _user;
    }

    function _removeUserNFTStakedData(address _user, address _nft_address, uint256 _tokenId) private {
        nft_owners[_nft_address][_tokenId] = address(0);
        users_nft_staked[_user][_nft_address][_tokenId] = 0;
        users_nft_traded_at[_user][_nft_address][_tokenId] = 0;
    }
}
