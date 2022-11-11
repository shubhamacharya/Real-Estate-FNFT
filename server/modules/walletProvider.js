const Web3 = require('web3');
require('dotenv').config();
const webhookLink = process.env.webhookLink;
const logger = require(`../config/winston`);

var web3js;
const getWalletProvider = async function() {
  logger.info('getWalletProvider method invoked')
    /*let httpProvider;
    if (typeof (httpProvider) === 'undefined') {
        httpProvider = new Web3.providers.HttpProvider(webhookLink, {keepAlive: false});
        web3js = new Web3(httpProvider);
        web3js.setProvider(httpProvider);
        web3js.eth.handleRevert = true;
        web3js.eth.transactionPollingTimeout = 1500;
        web3js.eth.extend({
            property: 'txpool',
            methods: [{
              name: 'status',
              call: 'txpool_status'
            }]
          });
        //const txnsStatus = await web3js.eth.txpool.status();
        //logger.debug(`===============TxPoolStatus============ ${parseInt(txnsStatus['pending'],10)}`);
    }*/
    web3js = new Web3(Web3.givenProvider || webhookLink);
    return web3js;
};

module.exports = {
    getWalletProvider
};

