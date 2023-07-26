// ##deployed index: 16
// ##deployed at: 2023/07/26 14:28:40
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./dependencies/Initializable.sol";
import "./dependencies/OwnableUpgradeable.sol";
import "./dependencies/PausableUpgradeable.sol";
import "./dependencies/ReentrancyGuardUpgradeable.sol";
import "./dependencies/IERC721.sol";
import "./dependencies/IERC165.sol";
import "./dependencies/Address.sol";
import "./libraries/MatchStructs.sol";
import "./interfaces/IApproveBySig.sol";
import "./interfaces/INFTBattlePool.sol";

contract NFTBattlePool is INFTBattlePool, Initializable, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable {

    // 用户质押数据
    mapping(address => MatchStructs.NFTData[]) users_staked_data;

    address public override nft_battle_address;
    address public constant override burn_to_address = address(1);

    bytes4 private constant INTERFACE_ID_APPROVEBYSIG = 0xc06dfe6c; // IApproveBySig.approveBySig.selector

    address[] users;

    modifier onlyNFTBattle() {
        require(msg.sender == nft_battle_address, "NFTBattle: Only NFTBattle can call this function");
        _;
    }

    /// @notice This method is called by the proxy contract to initialize the contract.
    function initialize(address _nft_battle_address) public initializer {
        __Ownable_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        require(Address.isContract(_nft_battle_address), "NFTBattle: nft_battle_address is not a contract");
        nft_battle_address = _nft_battle_address;
    }

    /// @notice 设置NFTBattle合约地址
    /// @param _nft_battle_address NFTBattle合约地址
    function setNFTBattle(address _nft_battle_address) external override onlyOwner {
        require(Address.isContract(_nft_battle_address), "NFTBattle: nft_battle_address is not a contract");
        nft_battle_address = _nft_battle_address;

        emit SetNFTBattle(_nft_battle_address);
    }

    /// @notice 质押NFT
    /// @param _nft_address NFT地址
    /// @param _approve_data NFT的授权数据
    function stake(address _nft_address, MatchStructs.ApprovalData calldata _approve_data) external override whenNotPaused {
        require(_nft_address != address(0), "NFTBattle: NFT address is zero");

        IERC721 _nft = IERC721(_nft_address);
        require(_nft.ownerOf(_approve_data.tokenId) == _approve_data.owner, "NFTBattle: NFT owner is not the owner of the token");
        require(IERC165(_nft_address).supportsInterface(INTERFACE_ID_APPROVEBYSIG), "NFTBattle: NFT contract does not support IApproveBySig");

        IApproveBySig(_nft_address).approveBySig(_approve_data.owner, _approve_data.spender, _approve_data.tokenId, _approve_data.nonce, _approve_data.deadline, _approve_data.v, _approve_data.r, _approve_data.s);

        require(_nft.getApproved(_approve_data.tokenId) == address(this), "NFTBattle: NFT contract does not approve this contract");
        _nft.transferFrom(_approve_data.owner, address(this), _approve_data.tokenId);
        _setUserStakedData(_approve_data.owner, _nft_address, _approve_data.tokenId);

        _integretyCheck();

        emit Staked(_approve_data.owner, _nft_address, _approve_data.tokenId);
    }

    /// @notice 赎回NFT
    /// @param _nft_address NFT地址
    /// @param _tokenId NFT的tokenId
    function redeem(address _nft_address, uint256 _tokenId) external override whenNotPaused nonReentrant {
        _redeem(msg.sender, _nft_address, _tokenId);
    }

    /// @notice 在合约里面赎回NFT到指定地址
    /// @dev 只有NFTBattle合约可以调用
    /// @param _owner_address NFT的拥有者地址
    /// @param _nft_address NFT地址
    /// @param _tokenId NFT的tokenId
    function redeemToOwner(address _owner_address, address _nft_address, uint256 _tokenId) external override whenNotPaused onlyNFTBattle {
        _redeem(_owner_address, _nft_address, _tokenId);
    }

    /// @notice battle后，烧毁失败方的NFT
    /// @dev 只有NFTBattle合约可以调用
    /// @param _loser_address 失败方的地址
    /// @param _nft_address NFT地址
    /// @param _tokenId NFT的tokenId
    function burnNFT(address _loser_address, address _nft_address, uint256 _tokenId) external override whenNotPaused onlyNFTBattle {
        MatchStructs.NFTData memory _nft_data = this.getUserStakedData(_loser_address, _nft_address, _tokenId);
        require(_nft_data.amount > 0, "NFTBattle: NFT is not staked");
        require(_nft_data.isFrozen == false, "NFTBattle: NFT is frozen");

        IERC721 _nft = IERC721(_nft_address);
        require(_nft.ownerOf(_tokenId) == address(this), "NFTBattle: NFT is not owned by this contract");
        _nft.transferFrom(address(this), burn_to_address, _tokenId);

        _removeUserStakedData(_loser_address, _nft_address, _tokenId);

        _integretyCheck();

        emit BurnedNFT(_loser_address, _nft_address, _tokenId);
    }

    /// @notice 冻结NFT
    /// @dev 只有NFTBattle合约可以调用
    /// @param _nft_owner NFT的拥有者地址
    /// @param _nft_address NFT地址
    /// @param _tokenId NFT的tokenId
    /// @param _beneficiary_address 执行结果的受益人地址
    function freezeNFT(address _nft_owner, address _nft_address, uint256 _tokenId, address _beneficiary_address) external override whenNotPaused onlyNFTBattle {
        for (uint256 i = 0; i < users_staked_data[_nft_owner].length; i++) {
            if (users_staked_data[_nft_owner][i].nftAddress == _nft_address && users_staked_data[_nft_owner][i].tokenId == _tokenId) {
                if (users_staked_data[_nft_owner][i].isFrozen == true) {
                    return;
                }
                users_staked_data[_nft_owner][i].isFrozen = true;
                users_staked_data[_nft_owner][i].beneficiaryAddress = _beneficiary_address;

                emit FrozenNFT(_nft_owner, _nft_address, _tokenId, _beneficiary_address);
                break;
            }
        }
    }

    /// @notice 解冻NFT
    /// @param _nft_address NFT地址
    /// @param _tokenId NFT的tokenId
    /// @param _nft_redeem NFT是否赎回
    function unfreezeNFT(address _nft_address, uint256 _tokenId, bool _nft_redeem) external payable override whenNotPaused {
        require(msg.value >= 0 ether, "NFTBattle: msg.value is less than 0.01 ether");
        address _nft_owner = msg.sender;
        for (uint256 i = 0; i < users_staked_data[_nft_owner].length; i++) {
            if (users_staked_data[_nft_owner][i].nftAddress == _nft_address && users_staked_data[_nft_owner][i].tokenId == _tokenId) {
                if (users_staked_data[_nft_owner][i].isFrozen == false) {
                    return;
                }

                address _beneficiary_address = users_staked_data[_nft_owner][i].beneficiaryAddress;
                (bool success, ) = _beneficiary_address.call{value: msg.value}("");
                require(success, "NFTBattle: Failed to send to beneficiary");

                users_staked_data[_nft_owner][i].isFrozen = false;
                users_staked_data[_nft_owner][i].beneficiaryAddress = address(0);

                if (_nft_redeem) {
                    _redeem(_nft_owner, users_staked_data[_nft_owner][i].nftAddress, users_staked_data[_nft_owner][i].tokenId);
                }

                emit UnfrozenNFT(_nft_owner, _nft_address, _tokenId, _beneficiary_address, msg.value);
                break;
            }
        }
    }

    /// @notice 获取用户质押的NFT的数据
    /// @param _user 用户地址
    /// @param _nft_address NFT地址
    /// @param _tokenId NFT的tokenId
    /// @return NFT的数据
    function getUserStakedData(address _user, address _nft_address, uint256 _tokenId) external view override returns (MatchStructs.NFTData memory) {
        MatchStructs.NFTData memory _nft_data;
        for (uint256 i = 0; i < users_staked_data[_user].length; i++) {
            if (users_staked_data[_user][i].nftAddress == _nft_address && users_staked_data[_user][i].tokenId == _tokenId) {
                _nft_data = users_staked_data[_user][i];
                break;
            }
        }
        return _nft_data;
    }

    /// @notice 获取用户质押的所有NFT的数据
    /// @param _user 用户地址
    /// @return NFT的数据列表
    function getUserAllStatkedData(address _user) external view override returns (MatchStructs.NFTData[] memory) {
        return users_staked_data[_user];
    }

    /// @notice 获取NFT的拥有者
    /// @param _nft_address NFT地址
    /// @param _tokenId NFT的tokenId
    /// @return NFT的拥有者地址
    function getNFTOwner(address _nft_address, uint256 _tokenId) external view override returns (address) {
        for (uint256 i=0; i<users.length; i++) {
            for (uint256 j=0; j<users_staked_data[users[i]].length; j++) {
                if (users_staked_data[users[i]][j].nftAddress == _nft_address && users_staked_data[users[i]][j].tokenId == _tokenId && users_staked_data[users[i]][j].amount > 0) {
                    return users[i];
                }
            }
        }

        return address(0);
    }

    function _addUserIfNotExist(address _user) private {
        for (uint256 i = 0; i < users.length; i++) {
            if (users[i] == _user) {
                return;
            }
        }
        users.push(_user);
    }

    function _redeem(address _owner_address, address _nft_address, uint256 _tokenId) private {
        MatchStructs.NFTData memory _nft_data = this.getUserStakedData(_owner_address, _nft_address, _tokenId);
        require(_nft_data.amount > 0, "NFTBattle: NFT is not staked");
        require(_nft_data.isFrozen == false, "NFTBattle: NFT is frozen");

        IERC721 _nft = IERC721(_nft_address);
        require(_nft.ownerOf(_tokenId) == address(this), "NFTBattle: NFT is not owned by this contract");
        _nft.transferFrom(address(this), _owner_address, _tokenId);

        _removeUserStakedData(_owner_address, _nft_address, _tokenId);

        _integretyCheck();

        emit Redeemed(_owner_address, _nft_address, _tokenId);
    }

    function _setUserStakedData(address _user, address _nft_address, uint256 _tokenId) private {
        for (uint256 i = 0; i < users_staked_data[_user].length; i++) {
            if (users_staked_data[_user][i].nftAddress == _nft_address && users_staked_data[_user][i].tokenId == _tokenId) {
                return;
            }
        }

        MatchStructs.NFTData memory _nft_data = MatchStructs.NFTData({
            nftAddress: _nft_address,
            tokenId: _tokenId,
            amount: 1,
            stakedAt: block.timestamp,
            isFrozen: false,
            beneficiaryAddress: address(0)
        });

        users_staked_data[_user].push(_nft_data);

        _addUserIfNotExist(_user);
    }

    function _integretyCheck() private view returns (bool) {
        for (uint256 i = 0; i < users.length; i++) {
            for (uint256 j = 0; j < users_staked_data[users[i]].length; j++) {
                if (users_staked_data[users[i]][j].amount > 0 &&
                    address(this) != IERC721(users_staked_data[users[i]][j].nftAddress).ownerOf(users_staked_data[users[i]][j].tokenId)) {
                    revert("NFTBattle: Some NFT is not owned by this contract in the staked data");
                }
            }
        }

        return true;
    }

    function _removeUserStakedData(address _user, address _nft_address, uint256 _tokenId) private {
        for (uint256 i = 0; i < users_staked_data[_user].length; i++) {
            if (users_staked_data[_user][i].nftAddress == _nft_address && users_staked_data[_user][i].tokenId == _tokenId) {
                delete users_staked_data[_user][i];
                break;
            }
        }
    }

}
