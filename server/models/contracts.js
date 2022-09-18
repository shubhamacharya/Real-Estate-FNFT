const mongoose = require('mongoose');

const contract = mongoose.Schema({
    tokenId: {
        type: String,
        unique: true
    },
    ownerAddress: {
        type: String,
        default: 0x00
        //[true, "Please Enter the Email Address"],
    },
    RealEstateNFT: {
        type: String,
        default: 0x00
        //[true, "Please Enter the Email Address"],
    },
    fractionalClaim: {
        type: String,
        default: 0x00
        //[true, "Please Enter the Email Address"],
    },
    FractionalNFT: {
        type: String,
        default: 0x00
        //[true, "Please Enter the Email Address"],
    },
    escrowNFT: {
        type: String,
        default: 0x00
        //[true, "Please Enter the Email Address"],
    },
});

module.exports = mongoose.model('contract', contract)