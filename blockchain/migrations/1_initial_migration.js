const FractionalNFT = artifacts.require("FractionalNFT");
const FNFToken = artifacts.require("FNFToken");
//const FractionalClaim = artifacts.require("FractionalClaim")

module.exports = function (deployer) {
  deployer.deploy(FractionalNFT);
  deployer.deploy(FNFToken);
  //deployer.deploy(FractionalClaim);
};
