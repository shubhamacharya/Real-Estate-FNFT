const express = require('express');
const logger = require('../config/winston');
const router = express.Router();
const fnftServiceModule = require('../modules/fnftServiceModule');

const getSuccessJson = function(data) 
{
    return {
        success: true,
        data: data,
        message: ``
    };
};

const getErrorJson = function(error) {
    return {
        success: false,
        data: ``,
        message: error.message
    };
};

const createToken = async function(req, res) {
    try {
        console.log('req------->>',req.body);
        logger.info('Inside createToken route');
        console.log('Inside createToken route');
        const serviceResponse = await fnftServiceModule.createToken(req.body);
        res.status(200).json(getSuccessJson(serviceResponse));
    } catch (error) {
        logger.error(`Exception occurred in method createToken: ${error.stack}`);
        res.status(500).json(getErrorJson(error));
    }
};

const fractionToken = async (req,res) => {
    try {
        console.log('req------->>',req.body);
        logger.info('Inside fraction route');
        const serviceResponse = await fnftServiceModule.fractionToken(req.body);
        res.status(200).json(getSuccessJson(serviceResponse));
    } catch (error) {
        logger.error(`Exception occurred in method fractionToken: ${error.stack}`);
        res.status(500).json(getErrorJson(error));
    }
}

const transferERC20Token = async (req,res) => {
    try
    {
        console.log('req ------->',req.body);
        logger.info('Inside transferERC20Token route');
        console.log('Inside transferERC20Token route');
        const transferReceipt = await fnftServiceModule.transferERC20Token(req.body)
        res.status(200).json(getSuccessJson(transferReceipt.transactionHash))
    }
    catch(error){
        logger.error(`Excption occoured in route transferERC20Token : ${error.stack}`)
    }
}

const deployClaimContract = async (req,res) => {
    try {
        console.log('req -------->',req.body);
        logger.info('Inside deployClaimContract route');
        console.log('Inside deployClaimContract route');
        let address = await fnftServiceModule.deployClaimContract(req.body)
        if(address)
        {
            res.status(200).json(getSuccessJson(address))
        }

    } catch (error) {
        logger.error(`Excption occoured in route deployClaimContract route : ${error.stack}`)
    }
}

const fundFNFTContract = async (req,res) => {
    try {
        console.log('req -------->',req.body);
        logger.info('Inside fundFNFTContract route');
        console.log('Inside fundFNFTContract route');
        const receipt = await fnftServiceModule.fundFNFTContract(req.body)
        res.status(200).json(getSuccessJson(receipt.transactionHash))
    } catch(error){
        logger.error(`Excption occoured in route fundFNFTContract route : ${error.stack}`)
    }
}

const TotalFNFTClaimSupply = async (req,res) => {
    try {
        let result = await fnftServiceModule.getTotalFNFTClaimSupply(req.body)
        res.status(200).json(getSuccessJson(result))
    } catch (error) {
        throw error
    }
}

const claimStateOfToken = async (req,res) => {
    try {
        let state = await fnftServiceModule.getClaimStateOfToken()
        res.status(200).json(getSuccessJson(state))
    } catch (error) {
        throw error
    }
}

const ownerAddressOfClaim = async (req,res) => {
    try{
        let owner = await fnftServiceModule.getownerAddressOfClaim()
        res.status(200).json(getSuccessJson(owner))
    }catch(error)
    {
        throw error
    }
}

const nftAddressFromClaim = async (req,res) => {
    try{
        let nftAddress = await fnftServiceModule.getnftAddressFromClaim()
        res.status(200).json(getSuccessJson(nftAddress))
    }catch(error){
        throw error
    }
}

const tokenAddressFromClaim = async (req,res) => {
    try{
        let tokenAddress = await fnftServiceModule.getTokenAddressFromClaim()
        res.status(200).json(getSuccessJson(tokenAddress))
    }catch(error){
        throw error
    }
}

const approveFractionalClaim = async (req,res) => {
    logger.info(`inside approveFractionalClaim route`)
    try {
        let result = await fnftServiceModule.approveFractionalClaimForFNFT(req.body)
        if(result.status)
            logger.info(`approval given to contract`)
            res.status(200).json(getSuccessJson(result.transactionHash)) 
    } catch (error) {
        throw error
    }
}

const tokenAllowanceFractionalClaim = async (req,res) => {
    try {
        let allowance = await fnftServiceModule.getTokenAllowanceFromClaim(req.body)
        res.status(200).json(getSuccessJson(allowance))
    } catch (error) {
        throw error
    }
}

const claimFNFTTokens = async (req,res) => {
    logger.info(`inside claimFNFTToken route`)
    try {
        let claim = await fnftServiceModule.claimFNFTTokens(req.body)
        if(claim.status)
            res.status(200).json(getSuccessJson(claim.transactionHash))
    } catch (error) {
        throw error
    }
}

const addNFTForSell = async (req,res) => {
    logger.info(`inside addNFTForSell route`)
    try {  
        let add = await fnftServiceModule.addNFTForSell(req.body)
        res.status(200).json(getSuccessJson(add))
    } catch (error) {
        throw error
    }   
}

const depositeFNFTtoFNFTEscrow = async (req,res) => {
    try {
        let result = await fnftServiceModule.depositeFNFTtoFNFTEscrow(req.body.tokenId,req.body.owner)
        if(result.status)
        {
            logger.info(`Deposited the NFT token to NFTEscrow account successfully`)
            res.status(200).json(getSuccessJson(result.transactionHash))
        }
        else
        {
            logger.info(`No recepit reveived while depositing the NFT token to NFTEscrow account.`) 
        }
    } catch (error) {
        
       throw error 
    }
}

const fundNFTEscrow = async (req,res) => {
    try {
        let fund = await fnftServiceModule.fundNFTEscrow(req.body)
        if(fund.status)
        {
            logger.info(`Successfully Deposited ${req.body.amtInEth} ethers to NFTEscrow contract`)
            res.status(200).json(getSuccessJson(fund.transactionHash))
        }
    } catch (error) {
        throw error
    }
}

const initiateDelivery = async (req,res) => {
    try {
        
        let result = await fnftServiceModule.initiateDelivery(req.body)
        if(result.status)
        {
            logger.info(`Successfully initiated delivery to sell token.`)
            res.status(200).json(getSuccessJson(result.transactionHash)) 
        }
    } catch (error) {
        throw error
    }
}

const confirmNFTDeliveryByBuyer = async (req,res) => {
    try {
        let result = await fnftServiceModule.confirmNFTDeliveryByBuyer(req.body)
        if(result.status)
        {
            logger.info(`Delivery Confirmed by buyer.`)
            res.status(200).json(getSuccessJson(result.transactionHash))
        }
    } catch (error) {
        throw error
    }
}

router.post('/createToken',createToken);
router.post('/fractionToken',fractionToken);
router.post('/transferERC20Token',transferERC20Token);
router.post('/deployClaimContract',deployClaimContract);
router.post('/fundFNFTContract',fundFNFTContract)
router.post('/approveFractionalClaim',approveFractionalClaim)
router.post('/claimFNFT',claimFNFTTokens)

//router.post('/deployNFTEscrow',deployNFTEscrow)
router.post('/addNFTForSell',addNFTForSell)
router.post('/depositeFNFTtoFNFTEscrow',depositeFNFTtoFNFTEscrow)
router.post('/fundNFTEscrow',fundNFTEscrow)
router.post('/confirmNFTDeliveryByBuyer',confirmNFTDeliveryByBuyer)
router.post('/initiateDelivery',initiateDelivery)

router.get('/FNFTClaimSupply',TotalFNFTClaimSupply)
router.get('/claimStateOfToken',claimStateOfToken)
router.get('/ownerAddressOfClaim',ownerAddressOfClaim)
router.get('/nftAddressFromClaim',nftAddressFromClaim)
router.get('/tokenAddressFromClaim',tokenAddressFromClaim)
router.get('/tokenAllowanceFractionalClaim',tokenAllowanceFractionalClaim)



module.exports = router;