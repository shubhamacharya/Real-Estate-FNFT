const mongoose = require('mongoose');
const tokenSell = mongoose.Schema({
    tokenId: {
        type: String,
        unique: true
    },
    seller: {
        type: String,
        //required: true, // [true, "Please Enter the Token URI"],
    },
    totalSupply: {
        type: Number,
        //required: true, // [true, "Please Enter Total Supply"],
    },
    price: {
        type: Number,
        //required: true, //[true, "Please Enter the Price"],
    },
    ownerAddress: {
        type: String,
        //required: true, //[true, "Please Enter the Email Address"],
    },
    erc20Address: {
        type: String,
        //required: true, //[true, "Please Enter the trnsaction ID"],
    },
    quantity: {
        type: Number,
        //require: true
    }
})

module.exports = mongoose.model('tokenSell', tokenSell);
