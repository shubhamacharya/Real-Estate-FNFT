const logger = require('../config/winston');

const RealEstateNFTJSON = require('../contractJSONs/RealEstateNFT.json')
const FractionalNFTJSON = require('../contractJSONs/FractionalNFT.json')
const FractionalClaimJSON = require('../contractJSONs/FractionalClaim.json')
const NFTEscrowJSON = require('../contractJSONs/NFTEscrow.json')

const {deploy,getWeb3Obj} = require('./deploy')

const nftDetails = require('../models/nftDetails');
const transactionDetails =  require('../models/transactionDetails');
const Contract = require('../models/contracts');
const fnftDetails = require('../models/fnftDetails');
const tokenSellDetails = require('../models/tokenSell')


let RealEstateNFTInstance,NFTEscrowInstance,FractionalClaimInstance,FractionalNFTInstance,web3

const getTransactionObject = (fromAddress,value=0,gas='6721975') => {
    return {
        from: fromAddress,
        value: web3.utils.toWei(web3.utils.BN(value)),
        gas: '6721975'
      }
}

const deployContract = async (ownerAddress,contractName,param=[]) => {
    try{
        web3 = await getWeb3Obj();
        return await deploy(contractName,ownerAddress,param)
    }
    catch(error)
    {
        throw error
    }
}

const loadRealEstateNFTContract = async(contractAddress) => {
    RealEstateNFTInstance = new web3.eth.Contract(RealEstateNFTJSON.abi,contractAddress);
    RealEstateNFTInstance.options.address = contractAddress
    return RealEstateNFTInstance
}

const createToken = async (reqBody) => {
    try {
        logger.info('method createTokens invoked');
        logger.info('reqBody', reqBody);
        
        const nftInfo = new nftDetails()
        const contracts = new Contract()
        const transactionInfo = new transactionDetails()

        let transactioHash;
        let contractAddress = await deployContract(reqBody.deployerAddress, process.env.RealEstateNFT);

        await loadRealEstateNFTContract(contractAddress);

        reqObj = {};
        reqObj.toAddress = reqBody.toAddress;
        reqObj.tokenURI = reqBody.tokenURI;
        console.log('reqObj-------', reqObj);

        //RealEstateNFTInstance.options.address = contractAddress
        //console.log("Create token addresses "+contractAddress+"  "+RealEstateNFTInstance.options.address);
        RealEstateNFTReceipt = await RealEstateNFTInstance.methods.mint(reqBody.toAddress, reqBody.tokenURI).send(getTransactionObject(reqBody.deployerAddress));
        transactioHash = RealEstateNFTReceipt.transactionHash
        logger.debug(`Transaction Receipt = ${RealEstateNFTReceipt.transactionHash} Block Number= ${RealEstateNFTReceipt.blockNumber}`);

        nftInfo.tokenId = RealEstateNFTReceipt.events.NFTTokenCreated.returnValues.tokenId
        nftInfo.tokenURI = RealEstateNFTReceipt.events.NFTTokenCreated.returnValues.tokenURI
        nftInfo.totalSupply = RealEstateNFTReceipt.events.NFTTokenCreated.returnValues.noOfFraction
        nftInfo.ownerAddress = RealEstateNFTReceipt.events.NFTTokenCreated.returnValues.owner
        //nftInfo.price = reqBody.price
        nftInfo.blockNo = RealEstateNFTReceipt.blockNumber
        nftInfo.txId = RealEstateNFTReceipt.transactionHash
        nftInfo.contractAddress = RealEstateNFTInstance._address
        nftInfo.eventData = RealEstateNFTReceipt.events

        contracts.ownerAddress = reqBody.toAddress
        contracts.RealEstateNFT = contractAddress
        contracts.tokenId = RealEstateNFTReceipt.events.NFTTokenCreated.returnValues.tokenId

        transactionInfo.tokenId = RealEstateNFTReceipt.events.NFTTokenCreated.returnValues.tokenId
        transactionInfo.to = RealEstateNFTReceipt.to
        transactionInfo.from = RealEstateNFTReceipt.from
        transactionInfo.txType = RealEstateNFTReceipt.type
        transactionInfo.blockNo = RealEstateNFTReceipt.blockNumber
        transactionInfo.eventData = RealEstateNFTReceipt.events
        transactionInfo.txId = RealEstateNFTReceipt.transactionHash

        await nftInfo.save()
        await contracts.save()
        await transactionInfo.save()

        return {
            transactionReceipt: transactioHash,
        };
    } catch (error) {
        logger.error(`Exception occoured in createToken method ${error.stack}`);
        throw error.message;
    }
};

const fractionToken = async(reqBody) => {
    logger.info('method createTokens invoked');
    logger.info('reqBody',reqBody);
    
    reqObj = {}
    reqObj.toAddress = reqBody.ownerAddress
    reqObj.NFTTokenId = reqBody.NFTTokenId
    reqObj.noOfFractions = reqBody.noOfFractions

    let FractionalNFTReceipt;

    let fnftInfo = new fnftDetails()
    let transactionInfo = new transactionDetails()

    let contractAddress = await deployContract(reqBody.ownerAddress,process.env.FractionalNFT)
    
    await loadFractionalNFTContract(contractAddress)
    
    await Contract.updateOne({tokenId:reqObj.NFTTokenId,ownerAddress:reqObj.toAddress},{FractionalNFT:contractAddress}).exec()//,{FractionalNFT:contractAddress})

    FractionalNFTReceipt = await FractionalNFTInstance.methods.mint(reqObj.toAddress,reqObj.noOfFractions,reqObj.NFTTokenId).send(getTransactionObject(reqObj.toAddress))
    logger.debug(`Transaction Receipt = ${FractionalNFTReceipt.transactionHash} Block Number = ${FractionalNFTReceipt.blockNumber}`);

    fnftInfo.contract = FractionalNFTReceipt.events.FNFTCreated.address
    fnftInfo.NFTId = FractionalNFTReceipt.events.FNFTCreated.returnValues.tokenId
    fnftInfo.blockNo = FractionalNFTReceipt.events.FNFTCreated.blockNumber
    fnftInfo.quantity = FractionalNFTReceipt.events.Transfer.returnValues.value / Math.pow(10,18)
    fnftInfo.txId = FractionalNFTReceipt.events.FNFTCreated.transactionHash

    transactionInfo.tokenId = FractionalNFTReceipt.events.FNFTCreated.returnValues.tokenId
    transactionInfo.quantity = FractionalNFTReceipt.events.Transfer.returnValues.value / Math.pow(10,18)
    transactionInfo.to = FractionalNFTReceipt.to
    transactionInfo.from = FractionalNFTReceipt.from
    transactionInfo.txType = FractionalNFTReceipt.type
    transactionInfo.blockNo = FractionalNFTReceipt.blockNumber
    transactionInfo.eventData = FractionalNFTReceipt.events 
    transactionInfo.txId = FractionalNFTReceipt.transactionHash

    await fnftInfo.save()
    await transactionInfo.save()
    return FractionalNFTReceipt.transactioHash
}

const deployClaimContract = async (reqBody) => {
    let param = []
    logger.info('reqBody',reqBody)
    logger.info('Deploying FractionalClaim contract');
    try {
        param[1] = reqBody.tokenId
        let tempRec = await Contract.findOne({tokenId : reqBody.tokenId}).exec() 
        param[0] = tempRec['RealEstateNFT']
        let contractAddress = await deployContract(reqBody.ownerAddress,process.env.FractionalClaim,param)
        await loadFractionalClaim(contractAddress)

        logger.info(`FractionalClaim contract loaded`);

        Contract.updateOne({tokenId : reqBody.tokenId,ownerAddress : reqBody.ownerAddress},{fractionalClaim : contractAddress}).exec()
        return contractAddress
    } catch (error) {
        logger.error(`Exception occurred in deployClaimContract method :: ${error.stack}`);
        throw error;
    }
}

const addNFTForSell = async(reqBody) => {
    try{
        logger.info('method addNFTForSell invoked');
        logger.info('reqBody', reqBody);

        reqObj = {}
        reqObj.sellerAddress = reqBody.sellerAddress;
        reqObj.deployerAddress = reqBody.deployerAddress;
        reqObj.tokenId = reqBody.tokenId;

        let contractAddress = await deployContract(reqObj.deployerAddress,process.env.Escrow)
        await loadNFTEscrowContract(contractAddress);

        let tempRec = await Contract.findOne({tokenId : reqObj.tokenId,ownerAddress : reqObj.sellerAddress}).exec()

        let addForSellReceipt = await depositeNFTtoNFTEscrow(reqObj.tokenId,reqObj.sellerAddress,tempRec.RealEstateNFT,contractAddress)
        
        Contract.updateOne({tokenId : reqObj.tokenId,ownerAddress : reqObj.sellerAddress},{escrowNFT:contractAddress}).exec()
        logger.info(`Added NFT for Sale`)

        transactionInfo = new transactionDetails()
        tokenSellInfo = new tokenSellDetails()
        
        transactionInfo.tokenId = reqObj.tokenId
        tokenSellInfo.tokenId = reqObj.tokenId

        tokenSellInfo.totalSupply = tokenSellInfo.quantity = await RealEstateNFTInstance.methods.totalSupply().call()
        transactionInfo.to = addForSellReceipt.to

        transactionInfo.from = addForSellReceipt.from
        tokenSellInfo.seller = addForSellReceipt.from
        tokenSellInfo.owner = addForSellReceipt.to

        transactionInfo.txType = addForSellReceipt.type
        transactionInfo.blockNo = addForSellReceipt.blockNumber
        transactionInfo.eventData = addForSellReceipt.events
        transactionInfo.txId = addForSellReceipt.transactionHash

        await transactionInfo.save()
        await tokenSellInfo.save()
        return addForSellReceipt.transactionHash
    }
    catch(error)
    {
        console.error(error)
        logger.info(`NFTEscrow contract deployment error`)
    }
}

const approveNFT = async (tokenId,owner,RealEstateNFTAddress,EscrowAddress) => {
    try{
        logger.info(`Approving NFT for contract NFTEscrow`)
        loadRealEstateNFTContract(RealEstateNFTAddress)
        let NFTApproveReceipt = await RealEstateNFTInstance.methods.approve(EscrowAddress,tokenId).send(getTransactionObject(owner))
        if(NFTApproveReceipt.status)
        {
            logger.info(`Approved NFT for contract NFTEscrow`)
            return NFTApproveReceipt;
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

const loadFractionalNFTContract = async(contractAddress) => {
    FractionalNFTInstance =  await new web3.eth.Contract(FractionalNFTJSON.abi,contractAddress);
    //FractionalNFTInstance.options.address = contractAddress
    return FractionalNFTInstance
}

const loadNFTEscrowContract = async(contractAddress) => {
    NFTEscrowInstance = new web3.eth.Contract(NFTEscrowJSON.abi,contractAddress)
    //NFTEscrowInstance.options.address = contractAddress
    return NFTEscrowInstance
}

const loadFractionalClaim = async (contractAddress) => {
    FractionalClaimInstance = new web3.eth.Contract(FractionalClaimJSON.abi,contractAddress)
    //FractionalClaimInstance.options.address = contractAddress
    return FractionalClaimInstance 
}

const depositeNFTtoNFTEscrow = async (tokenId,owner,RealEstateNFTAddress,EscrowAddress) => {
    logger.info(`Depositing the NFT token to NFTEscrow account`)
    //let nftAddress = await getNFTContractAddress();

    console.log("NFT Id in depositeNFTtoNFTEscrow ",tokenId)
    console.log("NFT Address in depositeNFTtoNFTEscrow ",RealEstateNFTAddress)
    try{
        await approveNFT(tokenId,owner,RealEstateNFTAddress,EscrowAddress);
        let depositeReceipt = await NFTEscrowInstance.methods.depositNFT(RealEstateNFTAddress,tokenId)
            .send(getTransactionObject(owner))
            logger.info(`Deposited the NFT to NFTEscrow account`)
        return depositeReceipt
    }
    catch(error)
    {
        console.log("Error in depositeFNFT ",error)
    }
}

const transferERC20Token = async (reqBody) => {
    try {
        logger.info('method transferERC20 token');
        logger.info('reqBody',reqBody)
        //console.log("FractionalNFTInstance ===> ",FractionalNFTInstance);
        let transactionInfo = new transactionDetails()
        let tempRec = await Contract.findOne({tokenId:reqBody.tokenId})
        //console.log("Temp Rec \n"+tempRec);
        let contractAddress = tempRec['FractionalNFT']
        let ownerAddress = tempRec['ownerAddress']

        FractionalNFTInstance = await loadFractionalNFTContract(contractAddress)
        
        let transferReceipt = await FractionalNFTInstance.methods.transfer(reqBody.buyerAddress,reqBody.amountOfTokens)
        .send(getTransactionObject(ownerAddress))

        transactionInfo.tokenId = tempRec.tokenId
        transactionInfo.quantity = transferReceipt.events.Transfer.returnValues.value
        transactionInfo.to = transferReceipt.to
        transactionInfo.from = transferReceipt.from
        transactionInfo.txType = transferReceipt.type
        transactionInfo.blockNo = transferReceipt.blockNumber
        transactionInfo.eventData = transferReceipt.events 
        transactionInfo.txId = transferReceipt.transactionHash

        if(transferReceipt.status)
        {   
            await transactionInfo.save()
            logger.info('ERC20 tokens transfered successfully')
            return transferReceipt.transactionHash
        }
    } catch (error) {
       logger.error(`Exception occoured in transferERC20Token method ${error.stack}`);
       throw error 
    }
}

const fundFNFTContract = async (reqBody) => {
    logger.info('Inside fundFNFTContract method');
    console.log('Inside fundFNFTContract method');
    
    try
    {
        let transactionInfo = new transactionDetails()
        logger.info('transfering amount');
        console.log('transfering amount');
        let tempRec = await Contract.findOne({tokenId : reqBody.tokenId,ownerAddress : reqBody.ownerAddress}).exec()
        await loadFractionalClaim(tempRec['fractionalClaim'])
        //console.log(`AmtInEth ==> ${reqBody.amtInEth}\t\tAmtInWei ==> ${amt}`);
        let FNFTFundReceipt = await FractionalClaimInstance.methods.fund(tempRec['FractionalNFT'])
                    .send(getTransactionObject(fromAddress=reqBody.ownerAddress,value=reqBody.amtInEth))
        
        if(FNFTFundReceipt.status && FNFTFundReceipt.events.funded)
        {
            transactionInfo.tokenId = reqBody.tokenId
            transactionInfo.from = FNFTFundReceipt.from
            transactionInfo.to = FNFTFundReceipt.to
            transactionInfo.txType = FNFTFundReceipt.type
            transactionInfo.blockNo = FNFTFundReceipt.blockNumber
            transactionInfo.eventData = FNFTFundReceipt.events
            transactionInfo.txId = FNFTFundReceipt.transactionHash

            logger.info('Amount transfered successfully')
            console.log('Amount transfered successfully')
            await transactionInfo.save()
            return FNFTFundReceipt.transactionHash
        }
    }catch(error){
        logger.info(`error while transfering amount  ${error.stack}`);
        console.log(`error while transfering amount  ${error.stack}`);
        throw error
    }
}

const approveFractionalClaimForFNFT = async (reqBody) => {
    let transactionInfo = new transactionDetails()
    web3 = await getWeb3Obj()
    let amt = await web3.utils.toWei(web3.utils.BN(reqBody.amountInEth),'ether')
    
    let tempRec = await Contract.findOne({tokenId:reqBody.tokenId}).exec()
    FractionalNFTInstance = await loadFractionalNFTContract(tempRec['FractionalNFT'])
    let approvalReceipt = await FractionalNFTInstance.methods.approve(tempRec['fractionalClaim'],amt)
                    .send(getTransactionObject(fromAddress=reqBody.fractionOwner))

    transactionInfo.tokenId = reqBody.tokenId
    transactionInfo.from = approvalReceipt.from
    transactionInfo.to = approvalReceipt.to
    transactionInfo.txType = approvalReceipt.type
    transactionInfo.blockNo = approvalReceipt.blockNumber
    transactionInfo.eventData = approvalReceipt.events
    transactionInfo.txId = approvalReceipt.transactionHash
    
    await transactionInfo.save()
    return approvalReceipt
}

const getTokenAllowanceFromClaim = async (reqBody) => {
    let tempRec = await Contract.findOne({tokenId : reqBody.tokenId}).exec();
    loadFractionalNFTContract(tempRec['FractionalNFT'])
    loadFractionalClaim(tempRec['fractionalClaim'])
    let result = await FractionalNFTInstance.methods.allowance(reqBody.owner,tempRec['fractionalClaim']).call()
    console.log(result)
    return web3.utils.fromWei(result,'ether')
}

const claimFNFTTokens = async (reqBody) => {
    
    logger.info(`inside claimFNFTTokens function`)
    let amountOfTokens = await web3.utils.toWei(web3.utils.BN(reqBody.amountOfTokens),'ether')
    let tokenOwner = reqBody.tokenOwner
    let tempRec = await Contract.findOne({tokenId:reqBody.tokenId}).exec()
    FractionalClaimInstance = await loadFractionalClaim(tempRec['fractionalClaim'])
    FractionalNFTInstance = await loadFractionalNFTContract(tempRec['FractionalNFT'])

    let claimReceipt = await FractionalClaimInstance.methods.claim(FractionalNFTInstance.options.address,amountOfTokens)
                .send(getTransactionObject(fromAddress=tokenOwner))
    console.log(claimReceipt);
    return claimReceipt.transactionHash
}

const fundNFTEscrow = async (reqBody) => {
    transactionInfo = new transactionDetails()

    await loadNFTEscrowContract(reqBody.contractAddress)
    logger.info(`Depositing ${reqBody.amtInEth} ether to NFTEscrow contract`)
    let fundNFTEscrowReceipt = await NFTEscrowInstance.methods.depositETH()
            .send(getTransactionObject(from=reqBody.buyer,value=reqBody.amtInEth))
    
    transactionInfo.tokenId = reqObj.tokenId
    transactionInfo.to = fundNFTEscrowReceipt.to
    transactionInfo.from = fundNFTEscrowReceipt.from
    transactionInfo.txType = fundNFTEscrowReceipt.type
    transactionInfo.blockNo = fundNFTEscrowReceipt.blockNumber
    transactionInfo.eventData = fundNFTEscrowReceipt.events
    transactionInfo.price = reqBody.amtInEth
    transactionInfo.txId = fundNFTEscrowReceipt.transactionHash
    
    await transactionInfo.save()
    return fundNFTEscrowReceipt
}

const initiateDelivery = async (reqBody) => {
    try
    {
        let transactionInfo = new transactionDetails()

        await loadNFTEscrowContract(reqBody.contractAddress) 
        logger.info(`Initiating delivery to sell token.`)
        let NFTDeliveryReceipt = await NFTEscrowInstance.methods.initiateDelivery()
                .send(getTransactionObject(fromAddress=reqBody.seller))
        logger.info(`Initiated delivery to sell token.`)
        
        let tempRec = await Contract.findOne({escrowNFT : reqBody.contractAddress})
        
        transactionInfo.tokenId = tempRec.tokenId
        transactionInfo.to = NFTDeliveryReceipt.to
        transactionInfo.from = NFTDeliveryReceipt.from
        transactionInfo.txType = NFTDeliveryReceipt.type
        transactionInfo.blockNo = NFTDeliveryReceipt.blockNumber
        transactionInfo.eventData = NFTDeliveryReceipt.events
        transactionInfo.txId = NFTDeliveryReceipt.transactionHash
        
        await transactionInfo.save()
        return NFTDeliveryReceipt
    }
    catch(error)
    {
        throw error
    }
}

const confirmNFTDeliveryByBuyer = async (reqBody) => {
    try
    {
        await loadNFTEscrowContract(reqBody.contractAddress)
        logger.info(`Getting confirmation of delivery from buyer.`)
        let NFTConfirmationReceipt = await NFTEscrowInstance.methods.confirmDelivery()
                    .send(getTransactionObject(fromAddress=reqBody.buyer))
        logger.info(`Delivery confirmed from buyer.`)
        console.log(NFTConfirmationReceipt);

        let transactionInfo = new transactionDetails()
        
        let tempRec = await Contract.findOne({escrowNFT : reqBody.contractAddress})
        await loadFractionalNFTContract(tempRec.RealEstateNFT)
        
        transactionInfo.tokenId = tempRec.tokenId
        transactionInfo.to = NFTConfirmationReceipt.to
        transactionInfo.from = NFTConfirmationReceipt.from
        transactionInfo.txType = NFTConfirmationReceipt.type
        transactionInfo.blockNo = NFTConfirmationReceipt.blockNumber
        transactionInfo.eventData = NFTConfirmationReceipt.events
        transactionInfo.txId = NFTConfirmationReceipt.transactionHash

        nftDetails.updateOne({tokenId:tempRec.tokenId},{ownerAddress:reqBody.buyer
                                                        ,blockNo:NFTConfirmationReceipt.blockNo,
                                                        transactioHash:NFTConfirmationReceipt.transactioHash}).exec()
        await transactionInfo.save()

        return NFTConfirmationReceipt
    }catch(error)
    {
        throw error
    }
}

const getNFTTokenId = () => {
    return RealEstateNFTReceipt.events['Transfer']['returnValues'][2]
}

const getNFTTokenIdByIndex = async (index=0) => {
    return RealEstateNFTInstance.methods.tokenByIndex(index)
}

const getFNFTContractAdress = async () => {
    const res = await RealEstateNFTInstance.methods.FNFT(getNFTTokenId()).call()
    return res['FractionalNFT'];
}

const getNFTContractAddress = async () => {
    return await RealEstateNFTInstance.options.address
}   

const getTotalNFTSupply = async () => {
    return await RealEstateNFTInstance.methods.totalSupply().call()   
}

const getTotalFNFTSupply = async () => {
    return await FractionalNFTInstance.methods.totalSupply().call();
}

const getFNFTBalance = async (owner) => {
    let bal = await FractionalNFTInstance.methods.balanceOf(owner).call();
    return (bal / await web3.utils.toWei(web3.utils.BN(1),'ether'))
}

const getNFTBalance = (owner) => {
    return RealEstateNFTInstance.methods.balanceOf(owner).call();
}

const getNameOfNFT = () => {
    return RealEstateNFTInstance.methods.name().call()
}

const getNameOfFNFT =  () => {
    return FractionalNFTInstance.methods.name().call()
}

const getSymbolOfNFT = () => {
    return RealEstateNFTInstance.methods.symbol().call()
}

const getSymbolOfFNFT = () => {
    return  FractionalNFTInstance.methods.symbol().call()
}

const getOwnerOfNFTContract =  async (contractAddress) => {
    let instance = await loadRealEstateNFTContract(contractAddress)
    return await instance.methods.owner().call()
}

const getOwnerOfFNFT =  () => {
    return  FractionalNFTInstance.methods.owner().call()
}

const getOwnerOfNFTByIndex = async (contractAddress,index=0) => {
    let instance = await loadRealEstateNFTContract(contractAddress)
    return  instance.methods.ownerOf(index).call()
}

const getNFTTokenURI =  (tokenId) => {
    return RealEstateNFTInstance.methods.tokenURI(tokenId).call()
}

const getNFTTokenOfOwnerByIndex = (tokenId,owner) => {
    return RealEstateNFTInstance.methods.tokenOfOwnerByIndex(owner,tokenId).call()
}



const getFundedAmt = async () => {
    let funds = await FractionalClaimInstance.methods.funds().call()
    return web3.utils.fromWei(funds,'ether')
}

const getTotalFNFTClaimSupply = async (reqBody) => {
    let tempRec = await Contract.findOne({tokenId : reqBody.tokenId}).exec()
    await loadFractionalClaim(tempRec['FractionalClaim']);
    FractionalClaimInstance.options.address = tempRec['FractionalClaim']
    let supp = await FractionalClaimInstance.methods.supply().call()
    console.log('supp', supp);
    return supp
}

const getClaimStateOfToken = async (reqBody) => {
    let tempRec = await Contract.findOne({tokenId : reqBody.tokenId}).exec()
    FractionalClaimInstance = await loadFractionalClaim(tempRec['FractionalClaim']);
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

module.exports = {
    createToken,
    fractionToken,
    loadFractionalNFTContract,
    getFNFTContractAdress,
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
    getOwnerOfNFTContract,
    getOwnerOfFNFT,
    getOwnerOfNFTByIndex,
    getNFTTokenURI,
    getNFTTokenOfOwnerByIndex,
    transferERC20Token,
    approveNFT,
    
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

    loadNFTEscrowContract,
    addNFTForSell,
    fundNFTEscrow,
    initiateDelivery,
    confirmNFTDeliveryByBuyer
};