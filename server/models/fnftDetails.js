const mongoose = require('mongoose');
const fnftDetails = mongoose.Schema({
    contract: {
        type: String,
        unique: true
    },
    tokenOwner: {
        type: String,
        //required: true, // [true, "Please Enter the Token URI"],
    },
    NFTId: {
        type: Number,
        //required: true, // [true, "Please Enter Total Supply"],
    },
    quantity: {
        type: Number
    },
    txId: {
        type: String,
        //required: true, //[true, "Please Enter the trnsaction ID"],
    },
    blockNo: {
        type: Number,
        //require: true
    }
})

module.exports = mongoose.model('fnftDetails', fnftDetails);