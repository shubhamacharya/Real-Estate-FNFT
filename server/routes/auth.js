const express = require('express');
const router = express.Router();
const authModule = require('../modules/auth')
const logger = require('../config/winston');

const login = async (req,res) => {
    try {
        logger.info(`Inside login route`)
        let response = await authModule.login(req,res)
        if(response.statusCode === 200)
        {
            logger.info(`Login Success`)
            res.json('Login Success')
        }
    } catch (error) {
        res.json('Login Error')
    }
}

const register = async (req,res) => {
    try {
        logger.info(`Inside register route`)
        let response = await authModule.register(req,res)
        if(response.statusCode === 200)
        {
            logger.info(`Registration Success`)
            res.json('Registration Success')
        }
    } catch (error) {
        res.json('Registration Error')
    }
}

router.post('/signup',register);
router.post('/signin',login);

module.exports = router;