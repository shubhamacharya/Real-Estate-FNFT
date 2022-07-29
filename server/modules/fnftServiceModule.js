const logger = require('../config/winston');
const FractionalNFTJSON = require('../contractJSONs/FractionalNFT.json')
const FNFTokenJSON = require('../contractJSONs/FNFToken.json')
const FractionalClaim = require('../contractJSONs/FractionalClaim.json')
const {deploy,getWeb3Obj} = require('./deploy')

let ownerAddress

let FractionalNFTInstance,NFTEscrowInstance;
let FractionalClaimInstance,FNFTokenInstance,FractionalNFT,FractionalNFTReceipt;

let web3 

const getTransactionObject = (fromAddress,value=0,gas='6721975') => {
    return {
        from: fromAddress,
        value: web3.utils.toWei(web3.utils.BN(value)),
        // gasPrice: 0,
        gas: '6721975'
      }
}

const deployContract = async (address) => {
    try{
        web3 = await getWeb3Obj();
        FractionalNFTInstance = await deploy(process.env.FractionalNFT,address)
    }
    catch(error)
    {
        throw error
    }
}

const createToken = async function(reqBody){
    try {
        logger.info('method createTokens invoked');
        logger.info('reqBody',reqBody);
        let transactioHash;
        ownerAddress = reqBody.address
        await deployContract(reqBody.address)
        if(!FractionalNFTInstance.options.address)
        {
            throw Error("Fractional Instance Error")
        }
        //FractionalNFTInstance = new web3.eth.Contract(FractionalNFTJSON.abi)
        //FractionalNFTInstance.options.address = await getNFTContractAddress()
        //console.log('============>', JSON.stringify(FractionalNFTInstance.methods));
        //logger.info(`contractInstance methods--${JSON.stringify(FractionalNFTInstance.methods)}`);
        // const transactionObject = {
        //     from: reqBody.address,
        //     // gasPrice: 0,
        //     gas: '6721975'
        //   };

        reqObj = {}
        reqObj.toAddress = reqBody.toAddress
        reqObj.tokenURI = reqBody.tokenURI
        reqObj.totalNoOfFractions = reqBody.totalNoOfFractions
        console.log('reqObj-------',reqObj);
        
        FractionalNFTReceipt = await FractionalNFTInstance.methods.mint(reqBody.toAddress,reqBody.tokenURI,reqBody.totalNoOfFractions)
                            .send(getTransactionObject(reqBody.address))
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
    return await FractionalNFTInstance.options.address
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
        let transferReceipt = await FNFTokenInstance.methods.transfer(reqBody.buyerAddress,reqBody.amountOfTokens)
        .send(getTransactionObject(ownerAddress))
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
        
        FractionalClaimInstance = await deploy(process.env.FractionalClaim,ownerAddress,params=args)
        logger.info(`FractionalClaim contract loaded`);
        return FractionalClaimInstance.options.address
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
    
    try
    {
        logger.info('transfering amount');
        console.log('transfering amount');
        
        let result = await FractionalClaimInstance.methods.fund(FNFTokenInstance.options.address)
                    .send(getTransactionObject(fromAddress=ownerAddress,value=amountInEth))
        
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
const approveFractionalClaimForFNFT = async (owner,amountInEth) => {
    let amt = web3.utils.toWei(amountInEth,'ether')
    let result = await FNFTokenInstance.methods.approve(FractionalClaimInstance.options.address,amt)
                    .send(getTransactionObject(fromAddress=owner))
    return result
}

const getTokenAllowanceFromClaim = async (owner) => {
    let result = await FNFTokenInstance.methods.allowance(owner,FractionalClaimInstance.options.address).call()
    console.log(result)
    return web3.utils.fromWei(result,'ether')
}

const claimFNFTTokens = async (reqBody) => {
    
    logger.info(`inside claimFNFTTokens function`)
    let amountOfTokens = reqBody.body.amountOfTokens
    let tokenOwner = reqBody.body.tokenOwner

    return await FractionalClaimInstance.methods.claim(FNFTokenInstance.options.address,amountOfTokens)
                .send(getTransactionObject(fromAddress=tokenOwner))
}

const deployNFTEscrow = async (address) => {
    logger.info('Deployer Address',address)
    logger.info('deploying NFTEscrow contract');
    try{
        NFTEscrowInstance = await deploy(process.env.NFTEscrow,address)
        logger.info(`NFTEscrow contract deployed`);
        return NFTEscrowInstance.options.address
    }
    catch(error)
    {
        console.error(error)
        logger.info(`NFTEscrow contract deployment error`)
    }
}

const approveEscrowNFT = async (owner,tokenId) => {
    try{
        logger.info(`Approving NFT for contract NFTEscrow`)
        let res = await FractionalNFTInstance.methods.approve(NFTEscrowInstance.options.address,tokenId)
        .send(getTransactionObject(from=owner))
        if(res.status)
        {
            logger.info(`Approved NFT for contract NFTEscrow`)
            return res.transactionHash;
        }
        else
        {
            logger.error(`Error while Approving NFT for contract NFTEscrow`)
        }
    }
    catch(error)
    {
        throw error
    }
}

const depositeFNFTtoFNFTEscrow = async (tokenId,owner) => {
    logger.info(`Depositing the NFT token to NFTEscrow account`)
    let nftAddress = await getNFTContractAddress();

    console.log("NFT Address in depositeFNFTtoFNFTEscrow ",nftAddress)
    console.log("NFT Escrow Address in depositeFNFTtoFNFTEscrow ",NFTEscrowInstance.options.address)
    try{
        let res = await NFTEscrowInstance.methods.depositNFT(nftAddress,tokenId)
        .send(getTransactionObject(fromAddress=owner))
        //console.log(res);
        return res
    }
    catch(error)
    {
        console.log("Error in depositeFNFT ",error)
    }
}

const fundNFTEscrow = async (buyer,amtInEth) => {
    logger.info(`Depositing ${amtInEth} ether to NFTEscrow contract`)
    let res = await NFTEscrowInstance.methods.depositETH()
            .send(getTransactionObject(from=buyer,value=amtInEth))
    return res
}

const initiateDelivery = async (seller) => {
    try
    {
        logger.info(`Initiating delivery to sell token.`)
        let res = await NFTEscrowInstance.methods.initiateDelivery()
                .send(getTransactionObject(fromAddress=seller))
        return res
    }
    catch(error)
    {
        throw error
    }
}

const confirmNFTDeliveryByBuyer = async (buyer) => {
    try
    {
        logger.info(`Getting confirmation of delivery from buyer.`)
        let res = await NFTEscrowInstance.methods.confirmDelivery()
                    .send(getTransactionObject(fromAddress=buyer))
        return res
    }catch(error)
    {
        throw error
    }
}

module.exports = {
    createToken,
    getFNFTContractAdress,
    deployFNFTContract,
    getNFTContractAddress,
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
    claimFNFTTokens,

    deployNFTEscrow,
    approveEscrowNFT,
    depositeFNFTtoFNFTEscrow,
    fundNFTEscrow,
    initiateDelivery,
    confirmNFTDeliveryByBuyer
};