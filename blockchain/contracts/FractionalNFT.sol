// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract FractionalNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Pausable, Ownable, ERC721Burnable 
{
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    struct _fnft{
        uint256 tokenId;
        address fractionalToken;
    }

    mapping(uint256 => _fnft) public FNFT;
    // Constructor of ERC721 requires Name of NFT and Symbol of NFT
    constructor() ERC721("FractionalNFT", "FNFT") {}  

    // _beforeTokenTransfer used by ERC-721 internally in _mint function
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal whenNotPaused override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function mint(address _to, string memory tokenURI_, uint256 _totalFractionalTokens) external onlyOwner() 
    {
        _safeMint(_to, _tokenIdCounter.current());
        _setTokenURI(_tokenIdCounter.current(), tokenURI_);

        //Create a ERC20 Token Contract for this newly minted NFT
        FNFToken _fnftoken = new FNFToken();                                      //initialize
        _fnftoken.mint(msg.sender, _totalFractionalTokens);   //now mint the fractional tokens and send it to the owner of this NFT           
        _fnft memory fnft;                                                          //constructor
        fnft.tokenId = _tokenIdCounter.current();                           
        fnft.fractionalToken = address(_fnftoken);
        FNFT[_tokenIdCounter.current()]  = fnft;                                    //bind the fractional token address to this NFT token just minted
        _tokenIdCounter.increment();
    }
}

contract FNFToken is ERC20, ERC20Burnable, Ownable {
    constructor() ERC20("FNFToken", "FNT") {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
