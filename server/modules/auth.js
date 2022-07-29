const User = require('../models/user')
const Login = require('../models/login')
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4 } = require('uuid')
const logger = require('../config/winston');

const Authenticate = async(req, res, email, password) => {
    /* To Check Exisitance of User with the specified password in the Login Table*/
    const usr = await Login.findOne({ email })
    if (usr === null) {
        //If no user present then,Return error invaild email or user not present redirect to the registration page.
        throw Error('Incorrect Email');
    } else {
        //If user with the specified email is found then check for the authenticity of password.
        let result = await bcrypt.compare(password, usr.password);
        if (result) {
            return usr;
        }
        //Return error password is incorrect.
        else {
            throw Error('Incorrect Password');
        }
    }
}

const errorHandler = (err) => {
    //console.log(err.message, err.code); //Code is requied for DB Errors
    let errors = { email: '', password: '' };

    //Incorrect email while login
    if (err.message === 'Incorrect Email') {
        errors.email = 'Email is Not Registered'
    }

    //Incorrect password while login
    if (err.message === 'Incorrect Password') {
        errors.password = 'Wrong Password'
    }
    //Duplicate Error code
    if (err.code == 11000) {
        errors.email = 'Duplicate value Error.Aleready Registered'
    }
    //Validation Errors
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        })
    }
    if (err.message.includes('login validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        })
    }
    return errors;
}

const hashPassword = async(passwd) => {
    /* Converts the plain password into encrypted / hashed password using bcrypt*/
    const saltRounds = 10;

    return await bcrypt.hash(passwd,saltRounds)
}

const register = async(req, res) => {
    const user = new User();
    const login = new Login();
    logger.info(`Inside register method`)
    
    user.uid = v4();
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.contact = req.body.contact;
    login.email = user.email = req.body.email;
    user.address = req.body.address;
    user.profile = req.body.profile;

    try {
        logger.info(`Hashing user password`)
        login.password = await hashPassword(req.body.password);
    } catch (err) {
        logger.error(`error in Hashing user password`)
        console.error(err)
        return { error: err.message }
    }
    try {
        console.log(login);
        await user.save();
        await login.save();

        logger.info(`User Saved`)
        res.status(200)
        return res
    } catch (err) {
        logger.error(`User not saved.`)
        const errors = errorHandler(err)
        console.error(err)
        return { error: err.message }
    }
}

const login = async(req, res) => {
    /*Fetch email and password from the request body */
    logger.info(`Inside login method`)
    const email = req.body.email;
    const password = req.body.password;
    try {
        logger.info(`Authenticating user from DB`)
        const usr = await Authenticate(req, res, email, password);
        req.app.set('user', usr)
        res.status(200)
        return res
    } catch (err) {
        logger.error(`Error while Authenticating user from DB`)
        console.error(err)
        error = errorHandler(err);
        req.app.set('login_error', error);
    }
}

module.exports = { register, login}