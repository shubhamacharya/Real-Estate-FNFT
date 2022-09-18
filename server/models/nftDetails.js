const mongoose = require('mongoose');
const nftDetails = mongoose.Schema({
    tokenId: {
        type: String,
        unique: true
    },
    tokenURI: {
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
    txId: {
        type: String,
        //required: true, //[true, "Please Enter the trnsaction ID"],
    },
    blockNo: {
        type: Number,
        //require: true
    },
    eventData: {
        type: {}
    },
    contractAddress: {
        type: String
    }
})

module.exports = mongoose.model('nftDetails', nftDetails);
