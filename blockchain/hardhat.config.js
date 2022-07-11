require("solidity-coverage");
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-waffle");

module.exports = {
    solidity: "0.8.7",
    settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      },
      networks: {
        hardhat: {
          gas: 12000000,
          blockGasLimit: 0x1fffffffffffff,
          allowUnlimitedContractSize: true,
          timeout: 1800000
      }
    }
}
