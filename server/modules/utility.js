
const _ = require('lodash');
const walletIns = require(`../modules/walletProvider`);
require('dotenv').config();
const logger = require(`.././config/winston`);
const MetaMaskConnector = require('node-metamask');

let web3;
let contractInstances;
const MAX_RETRY_COUNT = 5;


// (async function () {
//   logger.info('Invoked IIFE in utility.js');
//   // Get the wallet provider instance
//    web3 = await walletIns.getWalletProvider();
//   // JSON mapping to keep contracts object reference
//   contractInstances = {};
//  })();



/**
 * Helper method to get contract instance
 * @param contractName
 * @param abi
 * @returns {Promise<*>}
 */
//  const getContractInstance = async function(contractName, abi) {
//     try {
//       let instance = contractInstances[`${contractName}`];
//       console.log('Contract name', contractName);
//       if(!instance) {
//         const contractAddress = process.env['FNFT_CONTRACT_ADDRESS'];
//         logger.info(`Fetched contract address::: ${contractAddress}`);
//         if (!contractAddress) {
//          logger.info(`Unable to fetch contract: ${contractName} address!`);
//         }
//         logger.info(`Creating contract instance for ${contractName}`);
//         instance = new web3.eth.Contract(abi, contractAddress);
//         contractInstances[`${contractName}`] = instance;
//         logger.info(`Created contract instance for ${contractName}`);
//       }
//       console.log('Instance ', JSON.stringify(instance));
//       return instance;
//     } catch (e) {
//       logger.error(`Exception occurred in getContractInstance method for ${contractName} :: ${e.stack}`);
//       throw e;
//     }
//   };

/**
 * Helper method to invoke get contract method calls.
 * Retry logic is also implemented to handle failures.
 * @param instance
 * @param method
 * @param payload
 * @param retryCount
 * @returns {Promise<*|*|undefined>}
 */
const invokeContractGetMethod = async function(instance, method, payload, retryCount = 0) {
  try {
    logger.info(`invokeContractGetMethod ... Invoking method: ${method} with retryCount: ${retryCount} and payload:: `, payload);
    const contractResponse = await instance.methods[method](...payload)
        .call({ from: process.env['HD_WALLET_ACCOUNT'] });
    logger.info(`invokeContractGetMethod ... Method: ${method} invoked successfully`);
    return contractResponse;
  } catch (error) {
    if (error.message.indexOf('JSON RPC') !== -1 || error.message.indexOf('Returned error: execution aborted') !== -1) {
      ++retryCount;
      if (retryCount < MAX_RETRY_COUNT) {
        logger.info(`invokeContractGetMethod ... retrying for method: ${method} with delay of ${TIMEOUT_VAL}ms due to error: ${error.message}!`);
        await new Promise(resolve => setTimeout(resolve, TIMEOUT_VAL));
        return invokeContractGetMethod(instance, method, payload, retryCount);
      } else {
        logger.error(`Exception occurred in invokeContractGetMethod method :: ${error.stack}`);
        throw error;
      }
    } else {
      logger.error(`Exception occurred in invokeContractGetMethod method :: ${error.stack}`);
      throw error;
    }
  }
};

function between(min, max) {  
  return Math.floor(
    Math.random() * (max - min + 1) + min
  )
}

module.exports = {
  //getContractInstance,
  between
  //invokeContractGetMethod
};
