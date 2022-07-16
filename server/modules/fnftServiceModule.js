const logger = require('../config/winston');
//const walletIns = require('./walletProvider');
const FractionalNFTJSON = require('../contractJSONs/FractionalNFT.json')
const FNFTokenJSON = require('../contractJSONs/FNFToken.json')
const FractionalClaim = require('../contractJSONs/FractionalClaim.json')
const utility = require('./utility');
const deploy = require('./deploy')

let ownerAddress

let web3,FractionalNFTAddress,FractionalNFTInstance;
let FractionalClaimInstance,FNFTokenInstance,FractionalNFT,FractionalNFTReceipt;

const deployContract = async (address) => {
    [web3,FractionalNFT] = await deploy(process.env.FractionalNFT,address)
}

const createToken = async function(reqBody){
    try {
        logger.info('method createTokens invoked');
        logger.info('reqBody',reqBody);
        let transactioHash;
        ownerAddress = reqBody.address
        await deployContract(reqBody.address)
        FractionalNFTInstance = new web3.eth.Contract(FractionalNFTJSON.abi)
        FractionalNFTInstance.options.address = await getNFTContractAddress()
        //console.log('============>', JSON.stringify(FractionalNFTInstance.methods));
        //logger.info(`contractInstance methods--${JSON.stringify(FractionalNFTInstance.methods)}`);
        const transactionObject = {
            from: reqBody.address,
            // gasPrice: 0,
            gas: '6721975'
          };

        reqObj = {}
        reqObj.toAddress = reqBody.toAddress
        reqObj.tokenURI = reqBody.tokenURI
        reqObj.totalNoOfFractions = reqBody.totalNoOfFractions
        console.log('reqObj-------',reqObj);
        
        FractionalNFTReceipt = await FractionalNFTInstance.methods.mint(reqBody.toAddress,reqBody.tokenURI,reqBody.totalNoOfFractions).send(transactionObject)
        transactioHash = FractionalNFTReceipt.transactionHash;
        logger.debug(`Transaction Receipt = ${FractionalNFTReceipt.transactionHash} Block Number= ${FractionalNFTReceipt.blockNumber}`)
        
        if (FractionalNFTReceipt) {
           await deployFNFTContract() 
        }
        return {
            transactionReceipt: transactioHash,
        };
     }catch (error) {
        logger.error(`Exception occoured in createToken method ${error.stack}`);
        throw error.message;
    }
};

const getNFTTokenId = () => {
    return FractionalNFTReceipt.events['Transfer']['returnValues'][2]
}

const getNFTTokenIdByIndex = async (index=0) => {
    return FractionalNFTInstance.methods.tokenByIndex(index)
}

const getFNFTContractAdress = async () => {
    const res = await FractionalNFTInstance.methods.FNFT(getNFTTokenId()).call()
    return res['fractionalToken'];
}

const getNFTContractAddress = async () => {
    return await FractionalNFT.options.address
}

const deployFNFTContract = async () => {
    logger.info('loading FNFToken contract');
    try
    {
        FNFTokenInstance = new web3.eth.Contract(FNFTokenJSON.abi)
        FNFTokenInstance.options.address = await getFNFTContractAdress()

        logger.info(`FNFToken contract loaded`);
    }
    catch(error)
    {
        logger.error(`Exception occurred in deployFNFTContract method :: ${error.stack}`);
        throw error;
    }
    
}

const getTotalNFTSupply = async () => {
    return await FractionalNFTInstance.methods.totalSupply().call()   
}

const getTotalFNFTSupply = async () => {
    return await FNFTokenInstance.methods.totalSupply().call();
}

//Add Owner As Parameter in below Function
const getFNFTBalance = async (owner) => {
    let bal = await FNFTokenInstance.methods.balanceOf(owner).call();
    return (bal / await web3.utils.toWei(web3.utils.BN(1),'ether'))
}

const getNFTBalance = (owner) => {
    return FractionalNFTInstance.methods.balanceOf(owner).call();
}

const getNameOfNFT = () => {
    return FractionalNFTInstance.methods.name().call()
}

const getNameOfFNFT =  () => {
    return FNFTokenInstance.methods.name().call()
}

const getSymbolOfNFT = () => {
    return FractionalNFTInstance.methods.symbol().call()
}

const getSymbolOfFNFT = () => {
    return  FNFTokenInstance.methods.symbol().call()
}

const getOwnerOfNFT =  () => {
    return FractionalNFTInstance.methods.owner().call()
}

const getOwnerOfFNFT =  () => {
    return  FNFTokenInstance.methods.owner().call()
}

const getOwnerOfNFTByIndex =  (index=0) => {
    return  FractionalNFTInstance.methods.ownerOf(index).call()
}

const getNFTTokenURI =  (tokenId) => {
    return FractionalNFTInstance.methods.tokenURI(tokenId).call()
}

const getNFTTokenOfOwnerByIndex = (tokenId,owner) => {
    return FractionalNFTInstance.methods.tokenOfOwnerByIndex(owner,tokenId).call()
}

//Add Owner As Parameter in below Function
const transferERC20Token = async (reqBody) => {
    try {
        logger.info('method transferERC20 token');
        logger.info('reqBody',reqBody)
        transferReceipt = await FNFTokenInstance.methods.transfer(reqBody.buyerAddress,reqBody.amountOfTokens)
        .send({from : ownerAddress})
        if(transferReceipt.status)
        {   
            logger.info('ERC20 tokens transfered successfully')
            return transferReceipt
        }
    } catch (error) {
       logger.error(`Exception occoured in transferERC20Token method ${error.stack}`);
       throw error 
    }
}

//Add Owner As Parameter in below Function
const deployClaimContract = async (reqBody) => {
    let args = []
    logger.info('reqBody',reqBody)
    logger.info('loading FractionalClaim contract');
    try {
        args.push(FractionalNFTInstance.options.address)
        args.push(web3.utils.BN(reqBody.tokenId))
        let web3L
        [web3L,FractionalClaimInstance] = await deploy(process.env.FractionalClaim,ownerAddress,params=args)
        logger.info(`FractionalClaim contract loaded`);
    } catch (error) {
        logger.error(`Exception occurred in deployClaimContract method :: ${error.stack}`);
        throw error;
    }
    //FractionalClaimInstance = await FractionalClaim.new(FractionalNFTInstance.address, reqBody.tokenId);   
}

//Add Owner As Parameter in below Function
const fundFNFTContract = async (amountInEth) => {
    logger.info('Inside fundFNFTContract method');
    console.log('Inside fundFNFTContract method');
    const transactionObject = {
        from: ownerAddress,
        value: web3.utils.toWei(web3.utils.BN(amountInEth)),
        gas: '6721975'
      };
    try
    {
        logger.info('transfering amount');
        console.log('transfering amount');
        
        let result = await FractionalClaimInstance.methods.fund(FNFTokenInstance.options.address)
                    .send(transactionObject)
        
        if(result.status && result.events.funded)
        {
            logger.info('Amount transfered successfully')
            console.log('Amount transfered successfully')
            return result
        }
    }catch(error){
        logger.info(`error while transfering amount  ${error.stack}`);
        console.log(`error while transfering amount  ${error.stack}`);
        throw error
    }
}

const getFundedAmt = async () => {
    let funds = await FractionalClaimInstance.methods.funds().call()
    return web3.utils.fromWei(funds,'ether')
}

const getTotalFNFTClaimSupply = async () => {
    let supp = await FractionalClaimInstance.methods.supply().call()
    console.log('supp', supp);
    return supp
}

const getClaimStateOfToken = async () => {
    let state = await FractionalClaimInstance.methods.claimState().call()
    return state
}

const getownerAddressOfClaim = async () => {
    let owner = await FractionalClaimInstance.methods.ownerAddress().call()
    return owner
}

const getnftAddressFromClaim = async () => {
    let nftAddress = await FractionalClaimInstance.methods.nftAddress().call()
    return nftAddress
}

const getTokenAddressFromClaim = async () => {
    let tokenAddress = await FractionalClaimInstance.methods.tokenAddress().call()
    return tokenAddress
}

//Add Owner As Parameter in below Function
const approveFractionalClaimForFNFT = async (amountInEth) => {
    let amt = web3.utils.toWei(amountInEth,'ether')
    let result = await FNFTokenInstance.methods.approve(FractionalClaimInstance.options.address,amt)
                    .send({from:ownerAddress})
    return result
}

const getTokenAllowanceFromClaim = async (owner) => {
    console.log(owner);
    let result = await FNFTokenInstance.methods.allowance(owner,FractionalClaimInstance.options.address).call()
    return web3.utils.fromWei(result,'ether')
}

const claimFNFTTokens = async (reqBody) => {
    
    logger.info(`inside claimFNFTTokens function`)
    let amountOfTokens = reqBody.body.amountOfTokens
    let tokenOwner = reqBody.body.tokenOwner

    return await FractionalClaimInstance.methods.claim(FNFTokenInstance.options.address,amountOfTokens)
                .send({from:tokenOwner})
}

module.exports = {
    createToken,
    getFNFTContractAdress,
    deployFNFTContract,
    getNFTTokenId,
    getTotalNFTSupply,
    getTotalFNFTSupply,
    getFNFTBalance,
    getNFTBalance,
    getNFTTokenIdByIndex,
    getNameOfNFT,
    getNameOfFNFT,
    getSymbolOfNFT,
    getSymbolOfFNFT,
    getOwnerOfNFT,
    getOwnerOfFNFT,
    getOwnerOfNFTByIndex,
    getNFTTokenURI,
    getNFTTokenOfOwnerByIndex,
    transferERC20Token,
    
    deployClaimContract,
    fundFNFTContract,
    getFundedAmt,
    getTotalFNFTClaimSupply,
    getClaimStateOfToken,
    getownerAddressOfClaim,
    getnftAddressFromClaim,
    getTokenAddressFromClaim,
    approveFractionalClaimForFNFT,
    getTokenAllowanceFromClaim,
    claimFNFTTokens
};