# Solidity API

## NFTEscrow

### ProjectState

```solidity
enum ProjectState {
  newEscrow,
  nftDeposited,
  cancelNFT,
  ethDeposited,
  canceledBeforeDelivery,
  deliveryInitiated,
  delivered
}
```

### sellerAddress

```solidity
address payable sellerAddress
```

### buyerAddress

```solidity
address payable buyerAddress
```

### nftAddress

```solidity
address nftAddress
```

### tokenID

```solidity
uint256 tokenID
```

### buyerCancel

```solidity
bool buyerCancel
```

### sellerCancel

```solidity
bool sellerCancel
```

### projectState

```solidity
enum NFTEscrow.ProjectState projectState
```

### constructor

```solidity
constructor() public
```

### onERC721Received

```solidity
function onERC721Received(address operator, address from, uint256 tokenId, bytes data) public returns (bytes4)
```

_Whenever an {IERC721} `tokenId` token is transferred to this contract via {IERC721-safeTransferFrom}
by `operator` from `from`, this function is called.

It must return its Solidity selector to confirm the token transfer.
If any other value is returned or the interface is not implemented by the recipient, the transfer will be reverted.

The selector can be obtained in Solidity with `IERC721Receiver.onERC721Received.selector`._

### depositNFT

```solidity
function depositNFT(address _NFTAddress, uint256 _TokenID) public
```

### cancelAtNFT

```solidity
function cancelAtNFT() public
```

### cancelBeforeDelivery

```solidity
function cancelBeforeDelivery(bool _state) public payable
```

### depositETH

```solidity
function depositETH() public payable
```

### initiateDelivery

```solidity
function initiateDelivery() public
```

### confirmDelivery

```solidity
function confirmDelivery() public payable
```

### condition

```solidity
modifier condition(bool _condition)
```

### onlySeller

```solidity
modifier onlySeller()
```

### onlyBuyer

```solidity
modifier onlyBuyer()
```

### noDispute

```solidity
modifier noDispute()
```

### BuyerOrSeller

```solidity
modifier BuyerOrSeller()
```

### inProjectState

```solidity
modifier inProjectState(enum NFTEscrow.ProjectState _state)
```

### getBalance

```solidity
function getBalance() public view returns (uint256 balance)
```

## FractionalClaim

### ownerAddress

```solidity
address payable ownerAddress
```

### nftAddress

```solidity
address nftAddress
```

### tokenAddress

```solidity
address tokenAddress
```

### ClaimState

```solidity
enum ClaimState {
  initiated,
  accepting,
  closed
}
```

### claimState

```solidity
enum FractionalClaim.ClaimState claimState
```

### funds

```solidity
uint256 funds
```

### supply

```solidity
uint256 supply
```

### funded

```solidity
event funded()
```

### isOwnerOfNFT

```solidity
modifier isOwnerOfNFT(address _nftAddress, address _ownerAddress, uint256 _tokenID)
```

### onlyOwner

```solidity
modifier onlyOwner()
```

### inClaimState

```solidity
modifier inClaimState(enum FractionalClaim.ClaimState _state)
```

### correctToken

```solidity
modifier correctToken(address _token)
```

### constructor

```solidity
constructor(address _nftAddress, uint256 _tokenID) public
```

### fund

```solidity
function fund(address _token) public payable
```

### claim

```solidity
function claim(address _token, uint256 _amount) public payable
```

## FractionalNFT

### reNFTId

```solidity
uint256 reNFTId
```

### FNFTCreated

```solidity
event FNFTCreated(uint256 tokenId, string name, string symbol, uint256 totalSupply)
```

### constructor

```solidity
constructor() public
```

### mint

```solidity
function mint(address to, uint256 amount, uint256 _tokenId) public
```

## RealEstateNFT

### NFTTokenCreated

```solidity
event NFTTokenCreated(uint256 tokenId, string tokenURI, address owner)
```

### _tokenIdCounter

```solidity
struct Counters.Counter _tokenIdCounter
```

### NFT

```solidity
mapping(string => uint256) NFT
```

### constructor

```solidity
constructor() public
```

### safeMint

```solidity
function safeMint(address to) public
```

### pause

```solidity
function pause() public
```

### unpause

```solidity
function unpause() public
```

### _baseURI

```solidity
function _baseURI() internal pure returns (string)
```

_Base URI for computing {tokenURI}. If set, the resulting URI for each
token will be the concatenation of the `baseURI` and the `tokenId`. Empty
by default, can be overridden in child contracts._

### _beforeTokenTransfer

```solidity
function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal
```

### _burn

```solidity
function _burn(uint256 tokenId) internal
```

### tokenURI

```solidity
function tokenURI(uint256 tokenId) public view returns (string)
```

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view returns (bool)
```

### isNFTOwner

```solidity
modifier isNFTOwner(uint256 _tokenURI)
```

### mint

```solidity
function mint(address _to, string tokenURI_) external
```

