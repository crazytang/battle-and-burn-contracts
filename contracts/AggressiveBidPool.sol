// ##deployed index: 9
// ##deployed at: 2023/08/05 20:51:31
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

    INFTBattlePool public nft_battle_pool;
    IAggressiveBid public override aggressive_bid;

    bytes4 private constant INTERFACE_ID_APPROVEBYSIG = 0xc06dfe6c; // IApproveBySig.approveBySig.selector

    address[] private users;

    mapping(address => UserStakeStructs.BidPoolUserStakedData) private users_staked_data;

    modifier OnlyAggressiveBid() {
        require(msg.sender == address(aggressive_bid), "AggressiveBidPool: ");
        _;
    }

    /// @notice This method is called by the proxy contract to initialize the contract.
    function initialize(address _nft_battle_pool, address _aggressive_bid) public initializer {
        __Ownable_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        require(Address.isContract(_nft_battle_pool), "AggressiveBidPool: nft_battle_address is not a contract");
        require(Address.isContract(_aggressive_bid), "AggressiveBidPool: aggressive_bid_address is not a contract");

        nft_battle_pool = INFTBattlePool(_nft_battle_pool);
        aggressive_bid = IAggressiveBid(_aggressive_bid);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function setNFTBattlePool(address _nft_battle_pool_address) external override onlyOwner {
        require(Address.isContract(_nft_battle_pool_address), "AggressiveBidPool: nft_battle_address is not a contract");
        nft_battle_pool = INFTBattlePool(_nft_battle_pool_address);
    }

    function setAggressiveBid(address _aggressive_bid_address) external override onlyOwner {
        require(Address.isContract(_aggressive_bid_address), "AggressiveBidPool: aggressive_bid_address is not a contract");
        aggressive_bid = IAggressiveBid(_aggressive_bid_address);
    }

    function stakeNFT(address _nft_address, UserStakeStructs.ApprovalData calldata _approve_data) external override nonReentrant whenNotPaused {
        require(_nft_address != address(0), "AggressiveBidPool: NFT address is zero");

        IERC721 _nft = IERC721(_nft_address);
        require(_nft.ownerOf(_approve_data.tokenId) == _approve_data.userAddress, "AggressiveBidPool: NFT owner is not the owner of the token");
        require(IERC165(_nft_address).supportsInterface(INTERFACE_ID_APPROVEBYSIG), "AggressiveBidPool: NFT contract does not support IApproveBySig");

        IApproveBySig(_nft_address).approveBySig(_approve_data.userAddress, _approve_data.spender, _approve_data.tokenId, _approve_data.nonce, _approve_data.deadline, _approve_data.v, _approve_data.r, _approve_data.s);

        require(_nft.getApproved(_approve_data.tokenId) == address(this), "AggressiveBidPool: NFT contract does not approve this contract");
        _nft.transferFrom(_approve_data.userAddress, address(this), _approve_data.tokenId);
        _setUserNFTStakedData(_approve_data.userAddress, _nft_address, _approve_data.tokenId);

        emit StakedNFT(_approve_data.userAddress, _nft_address, _approve_data.tokenId, 1);
    }

    function stakeFromNFTBattlePool(address _nft_address, uint256 _tokenId) external override nonReentrant whenNotPaused {
        require(_nft_address != address(0), "AggressiveBidPool: NFT address is zero");

        address _owner = nft_battle_pool.getNFTOwner(_nft_address, _tokenId);
        require(_owner != msg.sender, "AggressiveBidPool: NFT owner is not the owner of the token");


        nft_battle_pool.redeemToAggressiveBidPool(_nft_address, _tokenId);

        IERC721 _nft = IERC721(_nft_address);
        require(_nft.ownerOf(_tokenId) == address(this), "AggressiveBidPool: AggressiveBid is not the owner of the token");

        _setUserNFTStakedData(_owner, _nft_address, _tokenId);

        emit StakedFromNFTBattlePool(_owner, _nft_address, _tokenId, 1);
    }

    function redeemNFT(address _nft_address, uint256 _tokenId) external override nonReentrant whenNotPaused {
        _redeem(msg.sender, _nft_address, _tokenId);
    }

    function deposit() public payable override nonReentrant whenNotPaused {
        require(msg.value > 0, "AggressiveBidPool: Deposit amount is zero");

        users_staked_data[msg.sender].balance += msg.value;

        _addUserIfNotExist(msg.sender);

        _integrityCheck();

        emit Deposited(msg.sender, msg.value);
    }

    /// @notice 提现ETH
    /// @param _amount 提现数量
    function withdraw(uint256 _amount) external override whenNotPaused nonReentrant {
        require(address(this).balance >= _amount, "AggressiveBidPool: The contract is insufficient ETH balance for withdraw");
        require(users_staked_data[msg.sender].balance >= _amount, "AggressiveBidPool: insufficient ETH balance for withdraw");
        users_staked_data[msg.sender].balance -= _amount;

        (bool success,) = payable(msg.sender).call{value: _amount}("");
        require(success, "AggressiveBidPool: Transfer failed");

        _integrityCheck();
        emit Withdrawed(msg.sender, _amount);
    }

    /// @notice 转账ETH
    /// @dev 只记录ETH余额变化，不转账
    /// @param _from 发送地址
    /// @param _to 接收地址
    /// @param _amount 转账数量
    function transferFrom(address _from, address _to, uint256 _amount) external override OnlyAggressiveBid whenNotPaused {
        require(users_staked_data[_from].balance >= _amount, "AggressiveBidPool: insufficient ETH balance for transferFrom");
        users_staked_data[_from].balance -= _amount;
        users_staked_data[_to].balance += _amount;

        emit TransferFrom(_from, _to, _amount);
    }

    function getUserStakedData(address _user) external view override returns (UserStakeStructs.BidPoolUserStakedData memory) {
        return users_staked_data[_user];
    }

    /// @notice 获取用户的ETH余额
    /// @param _user 用户地址
    function getUserBalance(address _user) external view override returns (uint256) {
        return users_staked_data[_user].balance;
    }

    function _redeem(address _owner_address, address _nft_address, uint256 _tokenId) private {
        require(_nft_address != address(0), "AggressiveBidPool: NFT address is zero");

        UserStakeStructs.BidPoolUserStakedData memory _user_staked_data = users_staked_data[_owner_address];

        require(_userHasStakedNFT(_user_staked_data, _nft_address, _tokenId), "AggressiveBidPool: User has no staked NFT");

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
        if (users_staked_data[_user].balance == 0 && users_staked_data[_user].nftStakedDataList.length == 0) {
            for (uint256 i = 0; i < users.length; i++) {
                if (users[i] == _user) {
                    users[i] = users[users.length - 1];
                    users.pop();
                    return;
                }
            }
        }
    }

    function _integrityCheck() private view returns (bool) {
        uint256 _total_balance = 0;
        for (uint256 i = 0; i < users.length; i++) {
            for (uint256 j = 0; j < users_staked_data[users[i]].nftStakedDataList.length; j++) {
                UserStakeStructs.NFTStakedData memory _nft_staked_data = users_staked_data[users[i]].nftStakedDataList[j];

                if (_nft_staked_data.amount > 0 &&
                    address(this) != IERC721(_nft_staked_data.nftAddress).ownerOf(_nft_staked_data.tokenId)) {
                    revert("NFTBattle: Some NFT is not owned by this contract in the staked data");
                }
            }

            _total_balance += users_staked_data[users[i]].balance;
        }

        if (_total_balance != address(this).balance) {
            revert("AggressiveBidPool: ETH balance is not equal to the sum of user balances");
        }

        return true;
    }

    function _setUserNFTStakedData(address _user, address _nft_address, uint256 _tokenId) private {
        UserStakeStructs.BidPoolUserStakedData storage _staked_data = users_staked_data[_user];

        bool _is_exist = false;
        for (uint256 i = 0; i < _staked_data.nftStakedDataList.length; i++) {
            if (_staked_data.nftStakedDataList[i].nftAddress == _nft_address
                && _staked_data.nftStakedDataList[i].tokenId == _tokenId
                && _staked_data.nftStakedDataList[i].amount == 0
            ) {
                _staked_data.nftStakedDataList[i].amount = 1;
                _is_exist = true;
                break;
            }
        }
        if (!_is_exist) {
            _staked_data.userAddress = _user;
            _staked_data.nftStakedDataList.push(UserStakeStructs.NFTStakedData({
                nftAddress: _nft_address,
                tokenId: _tokenId,
                amount: 1
            }));
        }

        _addUserIfNotExist(_user);

        _integrityCheck();
    }

    function _removeUserNFTStakedData(address _user, address _nft_address, uint256 _tokenId) private {
        for (uint256 i = 0; i < users_staked_data[_user].nftStakedDataList.length; i++) {
            UserStakeStructs.NFTStakedData memory _nft_staked_data = users_staked_data[_user].nftStakedDataList[i];
            if (_nft_staked_data.nftAddress == _nft_address
                && _nft_staked_data.tokenId == _tokenId
            ) {
                users_staked_data[_user].nftStakedDataList[i] = users_staked_data[_user].nftStakedDataList[users_staked_data[_user].nftStakedDataList.length - 1];
                users_staked_data[_user].nftStakedDataList.pop();
                break;
            }
        }

        _removeUserIfAssetIsEmpty(_user);

        _integrityCheck();
    }

    function _userHasStakedNFT(UserStakeStructs.BidPoolUserStakedData memory _user_staked_data, address _nft_address, uint256 _tokenId) private pure returns (bool) {
        for (uint256 i = 0; i < _user_staked_data.nftStakedDataList.length; i++) {
            if (_user_staked_data.nftStakedDataList[i].nftAddress == _nft_address && _user_staked_data.nftStakedDataList[i].tokenId == _tokenId && _user_staked_data.nftStakedDataList[i].amount > 0) {
                return true;
            }
        }
        return false;
    }

    receive() external payable {
        deposit();
    }
}
