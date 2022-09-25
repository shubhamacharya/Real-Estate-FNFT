//SPDX-License-Identifier: MIT
 
pragma solidity ^0.8.2;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract NFTEscrow is IERC721Receiver {
    
    enum ProjectState {newEscrow, nftDeposited, cancelNFT, ethDeposited, canceledBeforeDelivery, deliveryInitiated, delivered}
    
    address payable public sellerAddress;
    address payable public buyerAddress;
    address public nftAddress;
    uint256 tokenID;
    bool buyerCancel = false;
    bool sellerCancel = false;
    ProjectState public projectState;

    constructor(){
        sellerAddress = payable(msg.sender);
        projectState = ProjectState.newEscrow;
    }
    
    function onERC721Received( address operator, address from, uint256 tokenId, bytes calldata data ) public override returns (bytes4) {
        return this.onERC721Received.selector;
    }
    
    function depositNFT(address _NFTAddress, uint256 _TokenID) public inProjectState(ProjectState.newEscrow) onlySeller {
        
        nftAddress = _NFTAddress;
        tokenID = _TokenID;
        ERC721(nftAddress).safeTransferFrom(msg.sender, address(this), tokenID);
        projectState = ProjectState.nftDeposited;
    }
    
    function cancelAtNFT() public inProjectState(ProjectState.nftDeposited) onlySeller {
        ERC721(nftAddress).safeTransferFrom(address(this), msg.sender, tokenID);
        projectState = ProjectState.cancelNFT;
    }
  
    function cancelBeforeDelivery(bool _state) public inProjectState(ProjectState.ethDeposited) payable BuyerOrSeller {
        if (msg.sender == sellerAddress){
            sellerCancel = _state;
        }
        else{
            buyerCancel = _state;
        }
        
        if (sellerCancel == true && buyerCancel == true){
            ERC721(nftAddress).safeTransferFrom(address(this), sellerAddress, tokenID);
            buyerAddress.transfer(address(this).balance);
            projectState = ProjectState.canceledBeforeDelivery;     
        }
    }
    
    function depositETH() public payable inProjectState(ProjectState.nftDeposited) {
        buyerAddress = payable(msg.sender);
        projectState = ProjectState.ethDeposited;
    }
    
    function initiateDelivery() public inProjectState(ProjectState.ethDeposited) onlySeller noDispute {
        projectState = ProjectState.deliveryInitiated;
    }        
    
    function confirmDelivery() public payable inProjectState(ProjectState.deliveryInitiated) onlyBuyer {
        ERC721(nftAddress).safeTransferFrom(address(this), buyerAddress, tokenID);
        sellerAddress.transfer(address(this).balance);
        projectState = ProjectState.delivered;
    }
        
   	modifier condition(bool _condition) {
		require(_condition);
		_;
	}

	modifier onlySeller() {
		require(msg.sender == sellerAddress, "Caller address is not the seller.");
		_;
	}

	modifier onlyBuyer() {
		require(msg.sender == buyerAddress, "Caller address is not the buyer.");
		_;
	}
	
	modifier noDispute(){
	    require(buyerCancel == false && sellerCancel == false, "Either buyer or seller cancled deal." );
	    _;
	}
	
	modifier BuyerOrSeller() {
		require(msg.sender == buyerAddress || msg.sender == sellerAddress,"Caller is not buyer or seller.");
		_;
	}
	
	modifier inProjectState(ProjectState _state) {
		require(projectState == _state);
		_;
	}

    function getBalance() public view returns (uint256 balance) {
        return address(this).balance;
    }

    function getProjectState() public view returns (string memory) {
        ProjectState temp = projectState;
        if(temp == ProjectState.newEscrow) return "New Escrow";
        else if(temp == ProjectState.nftDeposited) return "NFT Deposited";
        else if(temp == ProjectState.cancelNFT) return "Cancel NFT";
        else if(temp == ProjectState.ethDeposited) return "ETH Deposited";
        else if(temp == ProjectState.canceledBeforeDelivery) return "Cancelled Before Delivery";
        else if(temp == ProjectState.deliveryInitiated) return "Delivery Initiated";
        else return "Delivered";
        
    }
} 
