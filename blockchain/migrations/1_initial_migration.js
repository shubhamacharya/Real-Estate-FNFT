const FractionalNFT = artifacts.require("FractionalNFT");
const FNFToken = artifacts.require("FNFToken");
const NFTEscrow = artifacts.require("NFTEscrow")

module.exports = function (deployer) {
  deployer.deploy(FractionalNFT);
  deployer.deploy(FNFToken);
  deployer.deploy(NFTEscrow);
};