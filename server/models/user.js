const mongoose = require('mongoose');
const { isEmail } = require('validator'); //isEmail is Function inside validator
const user = mongoose.Schema({
    uid: {
        type: String,
        unique: true
    },
    firstName: {
        type: String,
        required: true, // [true, "Please Enter the First Name"],
        lowercase: true
    },
    lastName: {
        type: String,
        required: true, // [true, "Please Enter the Last Name"],
        lowercase: true
    },
    contact: {
        type: Number,
        required: true, //[true, "Please Enter the Phone Number"],
        default: false
    },
    email: {
        type: String,
        required: true, //[true, "Please Enter the Email Address"],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please Enter a Valid Email']
    },
    address: {
        type: String,
        required: true, //[true, "Please Enter the Address"],
    },
    profile: {
        type: String,
        default: "NO IMG"
    }
})

module.exports = mongoose.model('user', user);