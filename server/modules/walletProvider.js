
const Web3 = require('web3');
require('dotenv').config();
const webhookLink = process.env.webhookLink;
const logger = require(`../config/winston`);

let web3;
const getWalletProvider = async function() {
  logger.info('getWalletProvider method invoked')
    let httpProvider;
    if (typeof (httpProvider) === 'undefined') {
        httpProvider = new Web3.providers.HttpProvider(webhookLink, {keepAlive: false});
        web3 = new Web3(httpProvider);
        web3.setProvider(httpProvider);
        web3.eth.handleRevert = true;
        web3.eth.transactionPollingTimeout = 1500;
        web3.eth.extend({
            property: 'txpool',
            methods: [{
              name: 'status',
              call: 'txpool_status'
            }]
          });
        //const txnsStatus = await web3.eth.txpool.status();
        //logger.debug(`===============TxPoolStatus============ ${parseInt(txnsStatus['pending'],10)}`);
    }
    return web3;
};

module.exports = {
    getWalletProvider
};

