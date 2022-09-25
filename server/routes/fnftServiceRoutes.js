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

const getNFTTokenId = async (req,res) => {
    try {
        let result = await fnftServiceModule.getNFTTokenId(req.body)
        res.status(200).json(getSuccessJson(result))
    } catch (error) {
        throw error
    }
}

const getNFTContractAddress = async (req,res) => {
    try {
        let result = await fnftServiceModule.getNFTContractAddress(req.body)
        res.status(200).json(getSuccessJson(result))
    } catch (error) {
        throw error
    }
}

const getTotalNFTSupply = async (req,res) => {
    try {
        let result = await fnftServiceModule.getTotalNFTSupply(req.body)
        res.status(200).json(getSuccessJson(result))
    } catch (error) {
        throw error
    }
}

const getNFTBalance = async (req,res) => {
    try {
        let result = await fnftServiceModule.getNFTBalance(req.body)
        res.status(200).json(getSuccessJson(result))
    } catch (error) {
        throw error
    }
}

const getNameOfNFT = async (req,res) => {
    try {
        let result = await fnftServiceModule.getNameOfNFT(req.body)
        res.status(200).json(getSuccessJson(result))
    } catch (error) {
        throw error
    }
}

const getSymbolOfNFT = async (req,res) => {
    try {
        let result = await fnftServiceModule.getSymbolOfNFT(req.body)
        res.status(200).json(getSuccessJson(result))
    } catch (error) {
        throw error
    }
}

const getOwnerOfNFTContract = async (req,res) => {
    try {
        let result = await fnftServiceModule.getOwnerOfNFTContract(req.body)
        res.status(200).json(getSuccessJson(result))
    } catch (error) {
        throw error
    }
}

const getOwnerOfNFTByIndex = async (req,res) => {
    try {
        let result = await fnftServiceModule.getOwnerOfNFTByIndex(req.body)
        res.status(200).json(getSuccessJson(result))
    } catch (error) {
        throw error
    }
}

const getNFTTokenURI = async (req,res) => {
    try {
        let result = await fnftServiceModule.getNFTTokenURI(req.body)
        res.status(200).json(getSuccessJson(result))
    } catch (error) {
        throw error
    }
}

const getNFTTokenOfOwnerByIndex = async (req,res) => {
    try {
        let result = await fnftServiceModule.getNFTTokenOfOwnerByIndex(req.body)
        res.status(200).json(getSuccessJson(result))
    } catch (error) {
        throw error
    }
}

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

const getFNFTContractAdress = async (req,res) => {
    try {
        let allowance = await fnftServiceModule.getFNFTContractAdress(req.body)
        res.status(200).json(getSuccessJson(allowance))
    } catch (error) {
        throw error
    }
}

const getTotalFNFTSupply = async (req,res) => {
    try {
        let allowance = await fnftServiceModule.getTotalFNFTSupply(req.body)
        res.status(200).json(getSuccessJson(allowance))
    } catch (error) {
        throw error
    }
}

const getNameOfFNFT = async (req,res) => {
    try {
        let allowance = await fnftServiceModule.getNameOfFNFT(req.body)
        res.status(200).json(getSuccessJson(allowance))
    } catch (error) {
        throw error
    }
}

const getSymbolOfFNFT = async (req,res) => {
    try {
        let allowance = await fnftServiceModule.getSymbolOfFNFT(req.body)
        res.status(200).json(getSuccessJson(allowance))
    } catch (error) {
        throw error
    }
}

const getOwnerOfFNFT = async (req,res) => {
    try {
        let allowance = await fnftServiceModule.getOwnerOfFNFT(req.body)
        res.status(200).json(getSuccessJson(allowance))
    } catch (error) {
        throw error
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

const getFundedAmt = async (req,res) => {
    try {
        let result = await fnftServiceModule.getFundedAmt(req.body)
        res.status(200).json(getSuccessJson(result))
    } catch (error) {
        throw error
    }
} 

const getTotalFNFTClaimSupply = async (req,res) => {
    try {
        let result = await fnftServiceModule.getTotalFNFTClaimSupply(req.body)
        res.status(200).json(getSuccessJson(result))
    } catch (error) {
        throw error
    }
}

const getclaimStateOfToken = async (req,res) => {
    try {
        let state = await fnftServiceModule.getClaimStateOfToken(req.body)
        res.status(200).json(getSuccessJson(state))
    } catch (error) {
        throw error
    }
}

const getownerAddressOfClaim = async (req,res) => {
    try{
        let owner = await fnftServiceModule.getownerAddressOfClaim(req.body)
        res.status(200).json(getSuccessJson(owner))
    }catch(error)
    {
        throw error
    }
}

const getnftAddressFromClaim = async (req,res) => {
    try{
        let nftAddress = await fnftServiceModule.getnftAddressFromClaim(req.body)
        res.status(200).json(getSuccessJson(nftAddress))
    }catch(error){
        throw error
    }
}

const getTokenAddressFromClaim = async (req,res) => {
    try{
        let tokenAddress = await fnftServiceModule.getTokenAddressFromClaim(req.body)
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

const getTokenAllowanceFromClaim = async (req,res) => {
    try {
        let allowance = await fnftServiceModule.getTokenAllowanceFromClaim(req.body)
        res.status(200).json(getSuccessJson(allowance))
    } catch (error) {
        throw error
    }
}

const getFNFTBalance = async (req,res) => {
    try {
        let allowance = await fnftServiceModule.getFNFTBalance(req.body)
        res.status(200).json(getSuccessJson(allowance))
    } catch (error) {
        throw error
    }
}

const claimFNFTTokens = async (req,res) => {
    logger.info(`inside claimFNFTToken route`)
    try {
        let claim = await fnftServiceModule.claimFNFTTokens(req.body)
        if(claim)
            res.status(200).json(getSuccessJson(claim))
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
        if(result)
        {
            logger.info(`Successfully initiated delivery to sell token.`)
            res.status(200).json(getSuccessJson(result)) 
        }
    } catch (error) {
        throw error
    }
}

const confirmNFTDeliveryByBuyer = async (req,res) => {
    try {
        let result = await fnftServiceModule.confirmNFTDeliveryByBuyer(req.body)
        if(result)
        {
            logger.info(`Delivery Confirmed by buyer.`)
            res.status(200).json(getSuccessJson(result))
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

router.post('/addNFTForSell',addNFTForSell)
router.post('/depositeFNFTtoFNFTEscrow',depositeFNFTtoFNFTEscrow)
router.post('/fundNFTEscrow',fundNFTEscrow)
router.post('/confirmNFTDeliveryByBuyer',confirmNFTDeliveryByBuyer)
router.post('/initiateDelivery',initiateDelivery)

router.get('/getnftAddressFromClaim',getnftAddressFromClaim)
router.get('/getTokenAddressFromClaim',getTokenAddressFromClaim)
router.get('/getTokenAllowanceFromClaim',getTokenAllowanceFromClaim)
router.get('/getclaimStateOfToken',getclaimStateOfToken)
router.get('/getTotalFNFTClaimSupply',getTotalFNFTClaimSupply)
router.get('/getownerAddressOfClaim',getownerAddressOfClaim)
router.get('/getFNFTBalance',getFNFTBalance)
router.get('/getNFTTokenId',getNFTTokenId)
router.get('/getNFTContractAddress',getNFTContractAddress)
router.get('/getTotalNFTSupply',getTotalNFTSupply)
router.get('/getNFTBalance',getNFTBalance)
router.get('/getNameOfNFT',getNameOfNFT)
router.get('/getSymbolOfNFT',getSymbolOfNFT)
router.get('/getOwnerOfNFTContract',getOwnerOfNFTContract)
router.get('/getNFTTokenURI',getNFTTokenURI)
router.get('/getFNFTContractAdress',getFNFTContractAdress)
router.get('/getTotalFNFTSupply',getTotalFNFTSupply)
router.get('/getNameOfFNFT',getNameOfFNFT)
router.get('/getSymbolOfFNFT',getSymbolOfFNFT)
router.get('/getOwnerOfFNFT',getOwnerOfFNFT)
router.get('/getFundedAmt',getFundedAmt)

router.get('/getOwnerOfNFTByIndex',getOwnerOfNFTByIndex)
router.get('/getNFTTokenOfOwnerByIndex',getNFTTokenOfOwnerByIndex)

module.exports = router;