const RealEstateNFT = artifacts.require("RealEstateNFT");
const FractionalNFT = artifacts.require("FractionalNFT");
const FractionalClaim = artifacts.require("FractionalClaim");
const NFTEscrow = artifacts.require("NFTEscrow")

module.exports = function (deployer) {
  deployer.deploy(RealEstateNFT);
  deployer.deploy(FractionalNFT);
  //deployer.deploy(FractionalClaim);
  deployer.deploy(NFTEscrow);
};