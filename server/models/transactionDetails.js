const mongoose = require('mongoose');
const transactionDtails = mongoose.Schema({
    contractAddress: {
        type: String,
    },
    tokenId: {
        type: String,
        //required: true, // [true, "Please Enter the Token URI"],
    },
    quantity: {
        type: Number,
        //required: true, // [true, "Please Enter Total Supply"],
    },
    price: {
        type: Number,
        //required: true, //[true, "Please Enter the Price"],
    },
    to: {
        type: String,
        required: true, //[true, "Please Enter the Email Address"],
    },
    from: {
        type: String,
        required: true, //[true, "Please Enter the Email Address"],
    },
    txType: {
        //make it enum / fixed values for Buy & Sell
        type: String,
        //required: true, //[true, "Please Enter the trnsaction ID"],
    },
    blockNo: {
        type: Number,
        require: true
    },
    eventData: {
        type: {}
    },
    txId: {
        type: String
    }
})

module.exports = mongoose.model('transactionDtails', transactionDtails);
