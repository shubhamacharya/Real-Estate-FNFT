// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FractionalNFT is ERC20, ERC20Burnable, Ownable {
    // struct _fnft{
    //     uint256 tokenId;
    //     address fractionalToken;
    // }
    uint public reNFTId;

    // mapping(uint256 => _fnft) public FNFT;
    
    event FNFTCreated(uint tokenId, string name, string symbol, uint256 totalSupply);

    constructor() ERC20("FractionalNFT", "FNFT") {}

    function mint(address to, uint256 amount, uint256 _tokenId) public onlyOwner {
        _mint(to, amount /* 1000000000000000000*/);
        // _fnft memory fnft;
        // fnft.tokenId = _tokenId;
        // fnft.fractionalToken = address(this);
        // FNFT[_tokenId]  = fnft;
        reNFTId = _tokenId;
        emit FNFTCreated(_tokenId, super.name(), super.symbol(), amount);
    }

    //  function transferFNFToken(address _to, uint256 _tokenURI, uint256 _amount) onlyOwner private //isNFTOwner(_tokenURI)
    // {
    //     FNFToken _fnftoken = FNFToken(FNFT[_tokenURI].fractionalToken);
    //     _fnftoken.transfer(_to, _amount * 1000000000000000000);
    // }
}
