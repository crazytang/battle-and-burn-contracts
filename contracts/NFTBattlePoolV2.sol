// ##deployed index: 59
// ##deployed at: 2023/09/02 17:02:55
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./dependencies/Initializable.sol";
import "./dependencies/OwnableUpgradeable.sol";
import "./dependencies/PausableUpgradeable.sol";
import "./dependencies/ReentrancyGuardUpgradeable.sol";
import "./dependencies/IERC721.sol";
import "./dependencies/IERC165.sol";
import "./dependencies/Address.sol";
import "./interfaces/IApproveBySig.sol";
import "./libraries/UserStakeStructsV2.sol";
import "./interfaces/INFTBattlePoolV2.sol";

contract NFTBattlePoolV2 is INFTBattlePoolV2, Initializable, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable {
    // NFT Id => owner
    mapping(bytes32 => address) nft_owners; // NFT的拥有者

    // User address => (NFT Id => amount), when amount > 0, means the user has staked the NFT
    mapping(address => mapping(bytes32 => uint256)) users_staked;

    // User address => (NFT Id => beneficiary) 用户的NFT被冻结后的受益人
    mapping(address => mapping(bytes32 => address)) users_staked_frozen_beneficiary;

    bytes4 private constant INTERFACE_ID_APPROVEBYSIG = 0xc06dfe6c; // IApproveBySig.approveBySig.selector

    address public override aggressive_bid_pool_address;
    address public override nft_battle_address;

    address public constant override burn_to_address = address(1);



    modifier onlyNFTBattle() {
        require(msg.sender == nft_battle_address, "NFTBattlePoolV2: Only NFTBattle can call this function");
        _;
    }

    modifier onlyAggressiveBidPool() {
        require(msg.sender == aggressive_bid_pool_address, "NFTBattlePoolV2: Only AggressiveBid can call this function");
        _;
    }

    /// @notice This method is called by the proxy contract to initialize the contract.
    function initialize(address _nft_battle_address) public initializer {
        __Ownable_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        require(Address.isContract(_nft_battle_address), "NFTBattlePoolV2: nft_battle_address is not a contract");
        nft_battle_address = _nft_battle_address;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    /// @notice 设置NFTBattle合约地址
    /// @param _nft_battle_address NFTBattle合约地址
    function setNFTBattle(address _nft_battle_address) external override onlyOwner {
        require(Address.isContract(_nft_battle_address), "NFTBattlePoolV2: nft_battle_address is not a contract");
        nft_battle_address = _nft_battle_address;

        emit SetNFTBattle(_nft_battle_address);
    }

    function setAggressiveBidPool(address _aggressive_bid_pool_address) external override onlyOwner {
        require(Address.isContract(_aggressive_bid_pool_address), "NFTBattlePoolV2: aggressive_bid_pool_address is not a contract");
        aggressive_bid_pool_address = _aggressive_bid_pool_address;

        emit SetAggressiveBidPool(_aggressive_bid_pool_address);
    }

    /// @notice 质押NFT
    /// @param _nft_address NFT地址
    /// @param _approve_data NFT的授权数据
    function stake(address _nft_address, UserStakeStructsV2.ApprovalData calldata _approve_data) external override whenNotPaused {
        require(_nft_address != address(0), "NFTBattlePoolV2: NFT address is zero");

        IERC721 _nft = IERC721(_nft_address);
        require(_nft.ownerOf(_approve_data.tokenId) == _approve_data.userAddress, "NFTBattlePoolV2: NFT owner is not the owner of the token");
        require(IERC165(_nft_address).supportsInterface(INTERFACE_ID_APPROVEBYSIG), "NFTBattlePoolV2: NFT contract does not support IApproveBySig");

        IApproveBySig(_nft_address).approveBySig(_approve_data.userAddress, _approve_data.spender, _approve_data.tokenId, _approve_data.nonce, _approve_data.deadline, _approve_data.v, _approve_data.r, _approve_data.s);

        require(_nft.getApproved(_approve_data.tokenId) == address(this), "NFTBattlePoolV2: NFT contract does not approve this contract");
        _nft.transferFrom(_approve_data.userAddress, address(this), _approve_data.tokenId);

        bytes32 _nft_id = _getNFTId(_nft_address, _approve_data.tokenId);
        _setUserStakedData(_approve_data.userAddress, _nft_id);

        emit Staked(_approve_data.userAddress, _nft_address, _approve_data.tokenId);
    }

    /// @notice 将自己的NFT质押到池子，并且转移持有人
    /// @param _to 转移持有人的地址
    /// @param _nft_address NFT地址
    /// @param _tokenId NFT的tokenId
    function stakeFrom(address _to, address _nft_address, uint256 _tokenId) external override whenNotPaused {
        require(_nft_address != address(0), "NFTBattlePoolV2: NFT address is zero");

        IERC721 _nft = IERC721(_nft_address);
        require(_nft.ownerOf(_tokenId) == msg.sender, "NFTBattlePoolV2: msg.sender is not the owner of the token");
        require(_nft.getApproved(_tokenId) == address(this), "NFTBattlePoolV2: NFT contract does not approve this contract");
        _nft.transferFrom(msg.sender, address(this), _tokenId);

        bytes32 _nft_id = _getNFTId(_nft_address, _tokenId);
        _setUserStakedData(_to, _nft_id);

        emit Staked(_to, _nft_address, _tokenId);
    }

    /// @notice 将刚转移过来的无主的NFT转移到指定用户
    /// @dev 只有NFTBattle合约可以调用
    /// @param _to 转移持有人的地址
    /// @param _nft_address NFT地址
    /// @param _tokenId NFT的tokenId
    function transferTo(address _to, address _nft_address, uint256 _tokenId) external override whenNotPaused onlyNFTBattle {
        require(_nft_address != address(0), "NFTBattlePoolV2: NFT address is zero");
        IERC721 _nft = IERC721(_nft_address);
        require(_nft.ownerOf(_tokenId) == address(this), "NFTBattlePoolV2: NFT is not owned by this contract");

        bytes32 _nft_id = _getNFTId(_nft_address, _tokenId);
        require(nft_owners[_nft_id] == address(0), "NFTBattlePoolV2: NFT had staked by someone");

        _setUserStakedData(_to, _nft_id);

        emit TransferedTo(msg.sender, _to, _nft_address, _tokenId);
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

    function redeemToAggressiveBidPool(address _owner, address _nft_address, uint256 _tokenId) external override whenNotPaused onlyAggressiveBidPool {
        _redeemFrom(_owner, aggressive_bid_pool_address, _nft_address, _tokenId);
    }

    /// @notice battle后，烧毁失败方的NFT
    /// @dev 只有NFTBattle合约可以调用
    /// @param _loser_address 失败方的地址
    /// @param _nft_address NFT地址
    /// @param _tokenId NFT的tokenId
    function burnNFT(address _loser_address, address _nft_address, uint256 _tokenId) external override whenNotPaused onlyNFTBattle {
        IERC721 _nft = IERC721(_nft_address);
        require(_nft.ownerOf(_tokenId) == address(this), "NFTBattlePoolV2: NFT is not owned by this contract");

        bytes32 _nft_id = _getNFTId(_nft_address, _tokenId);
        require(nft_owners[_nft_id] == _loser_address, "NFTBattlePoolV2: NFT is not owned by this address");

        _nft.transferFrom(address(this), burn_to_address, _tokenId);

        _removeUserStakedData(_loser_address, _nft_id);

        emit BurnedNFT(_loser_address, _nft_address, _tokenId, burn_to_address);
    }

    /// @notice 冻结NFT
    /// @dev 只有NFTBattle合约可以调用
    /// @param _nft_owner NFT的拥有者地址
    /// @param _nft_address NFT地址
    /// @param _tokenId NFT的tokenId
    /// @param _beneficiary_address 执行结果的受益人地址
    function freezeNFT(address _nft_owner, address _nft_address, uint256 _tokenId, address _beneficiary_address) external override whenNotPaused onlyNFTBattle {
        bytes32 _nft_id = _getNFTId(_nft_address, _tokenId);
        require(users_staked[_nft_owner][_nft_id] > 0, "NFTBattlePoolV2: NFT is not staked");
        require(users_staked_frozen_beneficiary[_nft_owner][_nft_id] == address(0), "NFTBattlePoolV2: NFT is frozen");

        users_staked_frozen_beneficiary[_nft_owner][_nft_id] = _beneficiary_address;
        emit FrozenNFT(_nft_owner, _nft_address, _tokenId, _beneficiary_address);
    }

    /// @notice 解冻NFT
    /// @param _nft_address NFT地址
    /// @param _tokenId NFT的tokenId
    /// @param _nft_redeem NFT是否赎回
    function unfreezeNFT(address _nft_address, uint256 _tokenId, bool _nft_redeem) external payable override whenNotPaused {
        require(msg.value >= 0.01 ether, "NFTBattlePoolV2: msg.value is less than 0.01 ether");

        bytes32 _nft_id = _getNFTId(_nft_address, _tokenId);
        require(users_staked[msg.sender][_nft_id] > 0, "NFTBattlePoolV2: NFT is not staked");

        if (users_staked_frozen_beneficiary[msg.sender][_nft_id] == address(0)) {
            return;
        }

        address _beneficiary_address = users_staked_frozen_beneficiary[msg.sender][_nft_id];
        (bool success, ) = _beneficiary_address.call{value: msg.value}("");
        require(success, "NFTBattlePoolV2: Failed to send to beneficiary");

        delete users_staked_frozen_beneficiary[msg.sender][_nft_id];

        if (_nft_redeem) {
            _redeem(msg.sender, _nft_address, _tokenId);
        }

        emit UnfrozenNFT(msg.sender, _nft_address, _tokenId, _beneficiary_address, msg.value);
    }

    /// @notice 判断用户的NFT是否可用
    /// @param _user 用户地址
    /// @param _nft_address NFT地址
    /// @param _tokenId NFT的tokenId
    /// @return NFT是否可用
    function userNFTIsAvailable(address _user, address _nft_address, uint256 _tokenId) external view override returns (bool) {
        if (_user == address(0) || _nft_address == address(0)) {
            return false;
        }

        bytes32 _nft_id = _getNFTId(_nft_address, _tokenId);
        return users_staked[_user][_nft_id] > 0
            && users_staked_frozen_beneficiary[_user][_nft_id] == address(0);
    }

    function isStakedNFT(address _user_address, address _nft_address, uint256 _tokenId) external view override returns (bool) {
        bytes32 _nft_id = _getNFTId(_nft_address, _tokenId);
        return users_staked[_user_address][_nft_id] > 0;
    }

    function isFrozenNFT(address _user_address, address _nft_address, uint256 _tokenId) external view override returns (bool) {
        bytes32 _nft_id = _getNFTId(_nft_address, _tokenId);
        return users_staked_frozen_beneficiary[_user_address][_nft_id] != address(0);
    }

    function getNFTId(address _nft_address, uint256 _tokenId) external pure override returns(bytes32) {
        return _getNFTId(_nft_address, _tokenId);
    }

    /// @notice 获取NFT的拥有者
    /// @param _nft_address NFT地址
    /// @param _tokenId NFT的tokenId
    /// @return NFT的拥有者地址
    function getNFTOwner(address _nft_address, uint256 _tokenId) external view override returns (address) {
        return nft_owners[_getNFTId(_nft_address, _tokenId)];
    }

    function _redeemFrom(address _owner_address, address _to, address _nft_address, uint256 _tokenId) private {
        bytes32 _nft_id = _getNFTId(_nft_address, _tokenId);
        require(users_staked[_owner_address][_nft_id] > 0, "NFTBattlePoolV2: NFT is not staked");
        require(users_staked_frozen_beneficiary[_owner_address][_nft_id] == address(0), "NFTBattlePoolV2: NFT is frozen");
        require(_owner_address == nft_owners[_nft_id], "NFTBattlePoolV2: NFT is not owned by this address");

        IERC721 _nft = IERC721(_nft_address);
        require(_nft.ownerOf(_tokenId) == address(this), "NFTBattlePoolV2: NFT is not owned by this contract");
        _nft.transferFrom(address(this), _to, _tokenId);

        _removeUserStakedData(_owner_address, _nft_id);

        emit RedeemedFrom(_owner_address, _to, _nft_address, _tokenId);
    }

    function _redeem(address _owner_address, address _nft_address, uint256 _tokenId) private {
        _redeemFrom(_owner_address, _owner_address, _nft_address, _tokenId);
    }

    function _setUserStakedData(address _user, bytes32 _nft_id) private {
        if (users_staked[_user][_nft_id] == 1) {
            return;
        }

        users_staked[_user][_nft_id] = 1;
        nft_owners[_nft_id] = _user;
    }

    function _removeUserStakedData(address _user, bytes32 _nft_id) private {
//        nft_owners[_nft_id] = address(0);
//        users_staked[_user][_nft_id] = 0;
        delete nft_owners[_nft_id];
        delete users_staked[_user][_nft_id];
    }

    function _getNFTId(address _nft_address, uint256 _tokenId) private pure returns(bytes32) {
        return keccak256(abi.encode(_nft_address, _tokenId));
    }
}
