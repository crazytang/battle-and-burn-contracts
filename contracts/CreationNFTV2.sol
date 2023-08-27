// ##deployed index: 52
// ##deployed at: 2023/08/27 15:41:36
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./dependencies/ERC721Enumerable.sol";
import "./dependencies/Ownable.sol";
import "./dependencies/ECDSA.sol";
import "./dependencies/ERC2981.sol";
import "./interfaces/ICreationNFTV2.sol";
import "./interfaces/IApproveBySig.sol";
import "./interfaces/ICreationRewardPool.sol";

contract CreationNFTV2 is ICreationNFTV2, IApproveBySig, ERC721Enumerable, ERC2981, Ownable {

    using ECDSA for bytes32;

    /// @notice version
    uint8 constant public version = 0x2;

    string constant _name = "Creation NFT V2";
    string constant _symbol = "CRNV2";

    string tokenBaseURI;

    ICreationRewardPool public override creation_reward_pool;

    // tokenId => tokenHash
    mapping(uint256 => bytes32) private tokenMetaHashes;

    // User address => nonce
    mapping(address => uint256) public override nonces;

    /// @notice 构造函数
    constructor(string memory __baseURI, address _creation_reward_pool_address) ERC721(_name, _symbol){
        require(Address.isContract(_creation_reward_pool_address), "CreationNFT: _distribution_policy_address is not contract");
        creation_reward_pool = ICreationRewardPool(_creation_reward_pool_address);

        tokenBaseURI = __baseURI;
    }

    function setCreationRewardPool(address _creation_reward_pool_address) external override onlyOwner {
        require(Address.isContract(_creation_reward_pool_address), "CreationNFT: _creation_reward_pool_address is not contract");
        creation_reward_pool = ICreationRewardPool(_creation_reward_pool_address);
        emit SetCreationRewardPool(_creation_reward_pool_address);
    }

    /// @notice 铸造
    function mint(uint256 _tokenId, bytes32 _tokenMetaHash) external {
        require(_tokenId == totalSupply(), "CreationNFT: _tokenId must be equal to totalSupply");

        tokenMetaHashes[_tokenId] = _tokenMetaHash;
        _mint(msg.sender, _tokenId);
    }

    /// @notice 铸造给指定地址
    function mintTo(address _to, uint256 _tokenId, bytes32 _tokenMetaHash) external override {
        require(_tokenId == totalSupply(), "CreationNFT: _tokenId must be equal to totalSupply");

        tokenMetaHashes[_tokenId] = _tokenMetaHash;
        _mint(_to, _tokenId);
    }

    function burn(uint256 _tokenId) external override {
        require(_isApprovedOrOwner(msg.sender, _tokenId), "CreationNFT: caller is not owner nor approved");
        delete tokenMetaHashes[_tokenId];

        _burn(_tokenId);
    }

    /// @notice 通过签名授权
    /// @param _owner 所有者地址
    /// @param _spender 授权地址
    /// @param _tokenId tokenId
    /// @param _nonce nonce
    /// @param _deadline 截止时间
    function approveBySig(address _owner, address _spender, uint256 _tokenId, uint256 _nonce, uint256 _deadline, uint8 _v, bytes32 _r, bytes32 _s) external override {
        require(_owner != address(0), "CreationNFT: _owner is the zero address");
        require(_spender != address(0), "CreationNFT: _spender is the zero address");
        require(ownerOf(_tokenId) == _owner, "CreationNFT: _owner do not owned the _tokenId");
        require(block.timestamp <= _deadline, "CreationNFT: Permit expired");
        require(_nonce == nonces[_owner], "CreationNFT: invalid nonce");

        bytes32 PERMIT_TYPEHASH = keccak256("Permit(address owner,address spender,uint256 tokenId,uint256 nonce,uint256 deadline)");
        bytes32 _hash = keccak256(abi.encode(
            PERMIT_TYPEHASH,
            _owner,
            _spender,
            _tokenId,
            nonces[_owner]++,
            _deadline
        ));

        address _signer = ecrecover(_hash, _v, _r, _s);
        require(_signer == _owner, "CreationNFT: invalid signature");

        _approve(_spender, _tokenId);
    }

    /// @notice 改由分配策略合约来分配
    /// @param _tokenId tokenId
    /// @param _salePrice 销售价格
    /// @return 收款地址，收款金额
    function royaltyInfo(uint256 _tokenId, uint256 _salePrice) public view override returns (address, uint256) {
        uint96 royalty_fee = creation_reward_pool.royalty_fee();
        uint256 royaltyAmount = (_salePrice * royalty_fee) / _feeDenominator();

        _tokenId = 0;
        return (address(this), royaltyAmount);
    }

    function _baseURI() internal view override returns (string memory) {
        return tokenBaseURI;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Enumerable, ERC2981) returns (bool) {
        return interfaceId == type(IApproveBySig).interfaceId || interfaceId == type(IERC2981).interfaceId || interfaceId == type(ERC721Enumerable).interfaceId || super.supportsInterface(interfaceId);
    }
}
