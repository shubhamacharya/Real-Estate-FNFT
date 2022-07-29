const mongoose = require('mongoose');

const login = mongoose.Schema({
    email: {
        type: String,
        require: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        //require: [true, "At least 6 char long password"],
        //minlength: 6
    }
});

module.exports = mongoose.model('login', login)