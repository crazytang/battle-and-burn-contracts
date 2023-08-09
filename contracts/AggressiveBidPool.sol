// ##deployed index: 19
// ##deployed at: 2023/08/10 01:02:58
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./dependencies/Initializable.sol";
import "./dependencies/OwnableUpgradeable.sol";
import "./dependencies/PausableUpgradeable.sol";
import "./dependencies/ReentrancyGuardUpgradeable.sol";
import "./dependencies/IERC721.sol";
import "./dependencies/IERC165.sol";
import "./dependencies/Address.sol";
import "./interfaces/INFTBattlePool.sol";
import "./interfaces/IAggressiveBidPool.sol";
import "./interfaces/IApproveBySig.sol";
import "./libraries/UserStakeStructs.sol";
import "./interfaces/IAggressiveBid.sol";

contract AggressiveBidPool is IAggressiveBidPool, Initializable, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable {

    INFTBattlePool public override nft_battle_pool;
    IAggressiveBid public override aggressive_bid;


    bytes4 private constant INTERFACE_ID_APPROVEBYSIG = 0xc06dfe6c; // IApproveBySig.approveBySig.selector

    address[] private users;

//    mapping(address => UserStakeStructs.BidPoolUserStakedData) private users_staked_data;
    mapping(address => UserStakeStructs.UserNFTStakedData[]) private users_nft_staked_data;

    modifier OnlyAggressiveBid() {
        require(msg.sender == address(aggressive_bid), "AggressiveBidPool: ");
        _;
    }

    /// @notice This method is called by the proxy contract to initialize the contract.
    function initialize(address _nft_battle_pool) public initializer {
        __Ownable_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        require(Address.isContract(_nft_battle_pool), "AggressiveBidPool: nft_battle_address is not a contract");
        nft_battle_pool = INFTBattlePool(_nft_battle_pool);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice 设置NFTBattlePool合约地址
    /// @param _nft_battle_pool_address NFTBattlePool合约地址
    function setNFTBattlePool(address _nft_battle_pool_address) external override onlyOwner {
        require(Address.isContract(_nft_battle_pool_address), "AggressiveBidPool: nft_battle_address is not a contract");
        nft_battle_pool = INFTBattlePool(_nft_battle_pool_address);

        emit SetNFTBattlePool(_nft_battle_pool_address);
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
    function stakeNFT(address _nft_address, UserStakeStructs.ApprovalData calldata _approve_data) external override nonReentrant whenNotPaused {
        require(_nft_address != address(0), "AggressiveBidPool: NFT address is zero");

        IERC721 _nft = IERC721(_nft_address);
        require(_nft.ownerOf(_approve_data.tokenId) == _approve_data.userAddress, "AggressiveBidPool: NFT owner is not the owner of the token");
        require(IERC165(_nft_address).supportsInterface(INTERFACE_ID_APPROVEBYSIG), "AggressiveBidPool: NFT contract does not support IApproveBySig");

        IApproveBySig(_nft_address).approveBySig(_approve_data.userAddress, _approve_data.spender, _approve_data.tokenId, _approve_data.nonce, _approve_data.deadline, _approve_data.v, _approve_data.r, _approve_data.s);

        require(_nft.getApproved(_approve_data.tokenId) == address(this), "AggressiveBidPool: NFT contract does not approve this contract");
        _nft.transferFrom(_approve_data.userAddress, address(this), _approve_data.tokenId);
        _setUserNFTStakedData(_approve_data.userAddress, _nft_address, _approve_data.tokenId, false);

        emit StakedNFT(_approve_data.userAddress, _nft_address, _approve_data.tokenId, 1);
    }

    /// @notice 从BattlePool池内转账NFT到AggressiveBidPool
    /// @param _nft_address NFT地址
    /// @param _tokenId NFT ID
    function stakeFromNFTBattlePool(address _nft_address, uint256 _tokenId) external override nonReentrant whenNotPaused {
        require(_nft_address != address(0), "AggressiveBidPool: NFT address is zero");

        address _owner = nft_battle_pool.getNFTOwner(_nft_address, _tokenId);
        require(_owner == msg.sender, "AggressiveBidPool: NFT owner is not the owner of the token");

        nft_battle_pool.redeemToAggressiveBidPool(msg.sender, _nft_address, _tokenId);

        IERC721 _nft = IERC721(_nft_address);
        require(_nft.ownerOf(_tokenId) == address(this), "AggressiveBidPool: AggressiveBid is not the owner of the token");

        _setUserNFTStakedData(_owner, _nft_address, _tokenId, false);

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

        require(_from == _getNFTOwner(_nft_address, _tokenId), "AggressiveBidPool: _from is not the owner of the token");

        _removeUserNFTStakedData(_from, _nft_address, _tokenId, false);

        _setUserNFTStakedData(_to, _nft_address, _tokenId, true);

        emit TransferedNFTFrom(_from, _to, _nft_address, _tokenId, _amount);
    }

    /// @notice 获取用户质押的NFT数据
    /// @param _user_address 用户地址
    /// @param _nft_address NFT地址
    /// @param _tokenId NFT的tokenId
    /// @return 用户质押的NFT数据
    function getUserNFTStakedData(address _user_address, address _nft_address, uint256 _tokenId) external view override returns (UserStakeStructs.UserNFTStakedData memory) {
        return _getUserNFTStakedData(_user_address, _nft_address, _tokenId);
    }

    /// @notice 获取用户质押的NFT数据列表
    /// @param _user_address 用户地址
    /// @return 用户质押的NFT数据列表
    function getUserNFTStakedDataList(address _user_address) external view override returns (UserStakeStructs.UserNFTStakedData[] memory) {
        return users_nft_staked_data[_user_address];
    }

    /// @notice 获取NFT的拥有者
    /// @param _nft_address NFT地址
    /// @param _tokenId NFT的tokenId
    /// @return NFT的拥有者地址
    function getNFTOwner(address _nft_address, uint256 _tokenId) external view override returns (address) {
        return _getNFTOwner(_nft_address, _tokenId);
    }

    function _redeem(address _owner_address, address _nft_address, uint256 _tokenId) private {
        require(_nft_address != address(0), "AggressiveBidPool: NFT address is zero");

        require(_owner_address == _getNFTOwner(_nft_address, _tokenId), "AggressiveBidPool: _owner_address is not the owner of the token");

        IERC721 _nft = IERC721(_nft_address);
        require(_nft.ownerOf(_tokenId) == address(this), "AggressiveBidPool: AggressiveBid is not the owner of the token");

        _nft.transferFrom(address(this), _owner_address, _tokenId);

        _removeUserNFTStakedData(_owner_address, _nft_address, _tokenId);

        emit RedeemedNFT(_owner_address, _nft_address, _tokenId, 1);
    }

    function _getNFTId(address _nft_address, uint256 _tokenId) private pure returns(uint256) {
        return uint256(keccak256(abi.encodePacked(_nft_address, _tokenId)));
    }

    function _addUserIfNotExist(address _user) private {
        for (uint256 i = 0; i < users.length; i++) {
            if (users[i] == _user) {
                return;
            }
        }
        users.push(_user);
    }

    function _removeUserIfAssetIsEmpty(address _user) private {
        if (users_nft_staked_data[_user].length == 0) {
            for (uint256 i = 0; i < users.length; i++) {
                if (users[i] == _user) {
                    users[i] = users[users.length - 1];
                    users.pop();
                    break;
                }
            }
        }
    }

    function _integrityCheck() private view returns (bool) {
        for (uint256 i = 0; i < users.length; i++) {
            for (uint256 j = 0; j < users_nft_staked_data[users[i]].length; j++) {
                UserStakeStructs.UserNFTStakedData memory _nft_staked_data = users_nft_staked_data[users[i]][j];
                if (_nft_staked_data.userAddress != users[i]) {
                    revert("NFTBattle: User address is not equal to the user address in the staked data");
                }
                if (_nft_staked_data.nftAddress == address(0)) {
                    revert("NFTBattle: NFT address is zero in the staked data");
                }
                if (_nft_staked_data.amount > 0
                    && address(this) != IERC721(_nft_staked_data.nftAddress).ownerOf(_nft_staked_data.tokenId)) {
                    revert("NFTBattle: Some NFT is not owned by this contract in the staked data");
                }
            }
        }
        return true;
    }

    function _setUserNFTStakedData(address _user, address _nft_address, uint256 _tokenId, bool _is_trade) private {
        bool _is_exist = false;
        for (uint256 i = 0; i < users_nft_staked_data[_user].length; i++) {
            if (users_nft_staked_data[_user][i].userAddress == _user
                && users_nft_staked_data[_user][i].nftAddress == _nft_address
                && users_nft_staked_data[_user][i].tokenId == _tokenId
                && users_nft_staked_data[_user][i].amount == 0
            ) {
                users_nft_staked_data[_user][i].amount = 1;
                _is_exist = true;
                break;
            }
        }
        // 如果不存在，则添加
        if (!_is_exist) {
            users_nft_staked_data[_user].push(UserStakeStructs.UserNFTStakedData({
                userAddress: _user,
                nftAddress: _nft_address,
                tokenId: _tokenId,
                amount: 1,
                lastTradedAt: _is_trade ? block.timestamp : 0
            }));
        }

        _addUserIfNotExist(_user);

        _integrityCheck();
    }

    function _removeUserNFTStakedData(address _user, address _nft_address, uint256 _tokenId) private {
        _removeUserNFTStakedData(_user, _nft_address, _tokenId, true);
    }

    function _removeUserNFTStakedData(address _user, address _nft_address, uint256 _tokenId, bool _integrity_check) private {
        for (uint256 i = 0; i < users_nft_staked_data[_user].length; i++) {
            UserStakeStructs.UserNFTStakedData memory _nft_staked_data = users_nft_staked_data[_user][i];
            if (_nft_staked_data.nftAddress == _nft_address && _nft_staked_data.tokenId == _tokenId) {
                users_nft_staked_data[_user][i] = users_nft_staked_data[_user][users_nft_staked_data[_user].length - 1];
                users_nft_staked_data[_user].pop();
                break;
            }
        }

        _removeUserIfAssetIsEmpty(_user);

        if (_integrity_check) {
            _integrityCheck();
        }
    }

    function _getUserNFTStakedData(address _user_address, address _nft_address, uint256 _tokenId) private view returns (UserStakeStructs.UserNFTStakedData memory) {
        UserStakeStructs.UserNFTStakedData memory user_nft_staked_data;
        for (uint256 i=0; i<users_nft_staked_data[_user_address].length; i++) {
            if (users_nft_staked_data[_user_address][i].nftAddress == _nft_address && users_nft_staked_data[_user_address][i].tokenId == _tokenId) {
                user_nft_staked_data = users_nft_staked_data[_user_address][i];
            }
        }

        return user_nft_staked_data;
    }
    function _getNFTOwner(address _nft_address, uint256 _tokenId) private view returns (address) {
        UserStakeStructs.UserNFTStakedData memory nftStakedData;

        for (uint256 i = 0; i < users.length; i++) {
            nftStakedData = _getUserNFTStakedData(users[i], _nft_address, _tokenId);
            if (nftStakedData.nftAddress != address(0)) {
                return users[i];
            }
        }

        return address(0);
    }
}
