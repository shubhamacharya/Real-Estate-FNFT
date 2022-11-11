const logger = require('../config/winston');
const fs = require('fs/promises')
const formidable = require("formidable");
var path = require('path');

const RealEstateNFTJSON = require('../contractJSONs/RealEstateNFT.json')
const FractionalNFTJSON = require('../contractJSONs/FractionalNFT.json')
const FractionalClaimJSON = require('../contractJSONs/FractionalClaim.json')
const NFTEscrowJSON = require('../contractJSONs/NFTEscrow.json')
const {deploy,getWeb3Obj} = require('./deploy')

const nftDetails = require('../models/nftDetails');
const transactionDetails =  require('../models/transactionDetails');
const ContractModel = require('../models/contracts');
const fnftDetails = require('../models/fnftDetails');
const tokenSellDetails = require('../models/tokenSell')

var imgFileExt
var RealEstateNFTInstance,NFTEscrowInstance,FractionalClaimInstance,FractionalNFTInstance,web3js

const getTransactionObject = (fromAddress,value=0,gas='6721975') => {
    return {
        from: fromAddress,
        value: web3js.utils.toWei(web3js.utils.BN(value)),
        gas: '6721975'
      }
}

const deployContract = async (ownerAddress,contractName,param=[]) => {
    try{
        web3js = await getWeb3Obj();
        return await deploy(contractName,ownerAddress,param)
    }
    catch(error)
    {
        throw error
    }
}

const isFileValid = (file) => {
    const type = imgFileExt = file.type.split("/").pop();
    const validTypes = ["jpg", "jpeg", "png", "pdf"];
    if (validTypes.indexOf(type) === -1) {
      return false;
    }
    return true;
  };

const loadRealEstateNFTContract = async (contractAddress) => {
    web3js = await getWeb3Obj()
    RealEstateNFTInstance = new web3js.eth.Contract(RealEstateNFTJSON.abi,contractAddress);
    RealEstateNFTInstance.options.address = contractAddress
    return RealEstateNFTInstance
}

const deployRealEstate = async (deployer) => {
    let contractAddress = await deployContract(deployer, process.env.RealEstateNFT);
    return contractAddress
}

const createToken = async (reqBody) => {
    try {
        const nftInfo = new nftDetails()
        const contracts = new ContractModel()
        const transactionInfo = new transactionDetails()

        let transactionHash;

        logger.info('method createTokens invoked');
        const form = formidable.IncomingForm();
        const uploadFolder = path.resolve(process.env.NFTImage,"NFT");
        
        form.multiples = true;
        form.maxFileSize = 50 * 1024 * 1024;
        form.uploadDir = uploadFolder;
        reqObj = {};

        new Promise(function(resolve, reject) 
        {
            form.parse(reqBody, (err, fields, files) => {
            
            if (err) {
              reject("Error parsing the files");
            }
            else
            {
                resolve({fields,files})
            }
        })
    }).then(async({fields,files}) => {
        if (!files.img.length) {
            const file = reqObj.imgFile = files.img;
            const buffer = new Buffer.from(await fs.readFile(file.path),"base64");
            reqObj.fileName = encodeURIComponent(file.name.replace(/\s/g, "-"));
            if (!isFileValid(file)) {
              console.log("The file type is not a valid type");
            }
            try {
                if(!await fs.stat(`${uploadFolder}`)) {
                    await fs.mkdir(`${uploadFolder}`,{recursive:true});
                }
                await fs.writeFile(file.path,buffer,function (err) {
                    if(err) 
                        return console.error(err)
                    else
                        console.log(`Image File > file.path`);
                })
                
            } catch (error) {
              console.log(error);
            }
        }
        var realEstateAddress
        var realEstateObj = await ContractModel.findOne({ownerAddress : fields.toAddress}).exec()
        
        if(realEstateObj)
            realEstateAddress = realEstateObj['RealEstateNFT']
        
        if(!realEstateAddress)
        {
            realEstateAddress = await deployRealEstate(fields.toAddress)
            contracts.ownerAddress = fields.toAddress
        contracts.RealEstateNFT = realEstateAddress
        }
        RealEstateNFTInstance = await loadRealEstateNFTContract(realEstateAddress);
        RealEstateNFTReceipt = await RealEstateNFTInstance.methods.mint(fields.toAddress, fields.tokenURI)
                                .send(getTransactionObject(fields.toAddress));
        transactionHash = RealEstateNFTReceipt.transactionHash
        logger.debug(`Transaction Receipt = ${RealEstateNFTReceipt.transactionHash} Block Number= ${RealEstateNFTReceipt.blockNumber}`);

        nftInfo.tokenId = RealEstateNFTReceipt.events.NFTTokenCreated.returnValues.tokenId
        nftInfo.tokenURI = RealEstateNFTReceipt.events.NFTTokenCreated.returnValues.tokenURI
        nftInfo.totalSupply = RealEstateNFTReceipt.events.NFTTokenCreated.returnValues.noOfFraction
        
        //Rename image file to userAddress_tokenId.extension
        nftInfo.ownerAddress = RealEstateNFTReceipt.events.NFTTokenCreated.returnValues.owner
        let fileName = RealEstateNFTReceipt.events.NFTTokenCreated.returnValues.owner+"_"+RealEstateNFTReceipt.events.NFTTokenCreated.returnValues.tokenId+"."+imgFileExt
        await fs.rename(reqObj.imgFile.path, path.join(uploadFolder, fileName))

        nftInfo.tokenImg = fileName
        nftInfo.blockNo = RealEstateNFTReceipt.blockNumber
        nftInfo.txId = RealEstateNFTReceipt.transactionHash
        nftInfo.contractAddress = RealEstateNFTInstance._address
        nftInfo.eventData = RealEstateNFTReceipt.events
        nftInfo.price = fields.price
        nftInfo.name = fields.name

        transactionInfo.contractAddress = RealEstateNFTReceipt.events.Transfer.address
        transactionInfo.tokenId = RealEstateNFTReceipt.events.NFTTokenCreated.returnValues.tokenId
        transactionInfo.to = RealEstateNFTReceipt.events.Transfer.returnValues.to
        transactionInfo.from = RealEstateNFTReceipt.events.Transfer.returnValues.from
        transactionInfo.txType = RealEstateNFTReceipt.type
        transactionInfo.blockNo = RealEstateNFTReceipt.blockNumber
        transactionInfo.eventData = RealEstateNFTReceipt.events
        transactionInfo.txId = RealEstateNFTReceipt.transactionHash

        await nftInfo.save()
        await contracts.save()
        await transactionInfo.save()
        return String(transactionHash)
        })
    } 
    catch (error) {
        logger.error(`Exception occoured in createToken method ${error.stack}`);
        throw error.message;
    }
};

/*const getNameOfNFT = async (reqBody) => {
    let tempRec = await ContractModel.findOne({tokenId:reqBody.tokenId}).exec()
    loadRealEstateNFTContract(tempRec['RealEstateNFT'])
    return await RealEstateNFTInstance.methods.name().call()  
}*/

const getSymbolOfNFT = async (reqBody) => {
    let tempRec = await ContractModel.findOne({ownerAddress : reqBody.ownerAddress})
    await loadRealEstateNFTContract(tempRec['RealEstateNFT'])
    return await RealEstateNFTInstance.methods.symbol().call()
}

const getTotalNFTSupply = async (reqBody) => {
    let tempRec = await ContractModel.findOne({ownerAddress:reqBody.ownerAddress})
    loadRealEstateNFTContract(tempRec['RealEstateNFT'])
    return await RealEstateNFTInstance.methods.totalSupply().call()   
}

/*const getNFTBalance = async (reqBody) => {
    let tempRec = await ContractModel.findOne({tokenId:reqBody.tokenId})
    loadRealEstateNFTContract(tempRec['RealEstateNFT'])
    return await RealEstateNFTInstance.methods.balanceOf(reqBody.owner).call();
}*/

const getNFTTokenURI = async (reqBody) => {
    let tempRec = await ContractModel.findOne({ownerAddress:reqBody.ownerAddress})
    await loadRealEstateNFTContract(tempRec['RealEstateNFT'])
    return await RealEstateNFTInstance.methods.tokenURI(reqBody.tokenId).call()
}
/*
const getOwnerOfNFTContract = async (reqBody) => {
    let tempRec = await ContractModel.findOne({tokenId:reqBody.tokenId})
    loadRealEstateNFTContract(tempRec['RealEstateNFT'])
    return await RealEstateNFTInstance.methods.owner().call()
}

//Needs Improvement : Fecting token id to get tokenId
/*const getNFTTokenId = (reqBody) => {
    let tempRec = ContractModel.findOne({tokenId:reqBody.tokenId}).exec()
    loadRealEstateNFTContract(tempRec['RealEstateNFT'])
    return RealEstateNFTReceipt.events['Transfer']['returnValues'][2]
}*/

/*const getNFTTokenIdByIndex = async (index=0) => {
    let tempRec = ContractModel.findOne({tokenId:reqBody.tokenId}).exec()
    loadRealEstateNFTContract(tempRec['RealEstateNFT'])
    return RealEstateNFTInstance.methods.tokenByIndex(index)
}*/

const getNFTContractAddress = async (reqBody) => {
    let tempRec = await ContractModel.findOne({ownerAddress:reqBody.ownerAddress}).exec()
    return tempRec['RealEstateNFT']
} 

/*const getOwnerOfNFTByIndex = async (reqBody) => {
    let tempRec = ContractModel.findOne({tokenId:reqBody.tokenId})
    loadRealEstateNFTContract(tempRec['RealEstateNFT'])
    return  RealEstateNFTInstance.methods.ownerOf(index).call()
}*/

/*const getNFTTokenOfOwnerByIndex = async (reqBody) => {
    let tempRec = await ContractModel.findOne({tokenId:reqBody.tokenId})
    loadRealEstateNFTContract(tempRec['RealEstateNFT'])
    return await RealEstateNFTInstance.methods.tokenOfOwnerByIndex(reqBody.owner,reqBody.tokenId).call()
}*/

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
    
    await ContractModel.updateOne({tokenId:reqObj.NFTTokenId,ownerAddress:reqObj.toAddress},{FractionalNFT:contractAddress}).exec()//,{FractionalNFT:contractAddress})

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
    return FractionalNFTReceipt.transactionHash
}

const loadFractionalNFTContract = async(contractAddress) => {
    FractionalNFTInstance =  await new web3js.eth.Contract(FractionalNFTJSON.abi,contractAddress);
    //FractionalNFTInstance.options.address = contractAddress
    return FractionalNFTInstance
}

/*const getTotalFNFTSupply = async (reqBody) => {
    let tempRec = await ContractModel.findOne({tokenId:reqBody.tokenId})
    loadRealEstateNFTContract(tempRec['FractionalNFT'])
    return await FractionalNFTInstance.methods.totalSupply().call();
}

const getFNFTBalance = async (reqBody) => {
    let tempRec = await ContractModel.findOne({tokenId:reqBody.tokenId})
    loadFractionalNFTContract(tempRec['FractionalNFT'])
    return await FractionalNFTInstance.methods.balanceOf(reqBody.owner).call();
}

const getNameOfFNFT =  async (reqBody) => {
    let tempRec = await ContractModel.findOne({tokenId:reqBody.tokenId})
    loadFractionalNFTContract(tempRec['FractionalNFT'])
    return await FractionalNFTInstance.methods.name().call()
}

const getSymbolOfFNFT = async (reqBody) => {
    let tempRec = await ContractModel.findOne({tokenId:reqBody.tokenId})
    loadFractionalNFTContract(tempRec['FractionalNFT'])
    return await FractionalNFTInstance.methods.symbol().call()
}

const getOwnerOfFNFT =  async (reqBody) => {
    let tempRec = await ContractModel.findOne({tokenId:reqBody.tokenId})
    loadFractionalNFTContract(tempRec['FractionalNFT'])
    return await FractionalNFTInstance.methods.owner().call()
}*/

const transferERC20Token = async (reqBody) => {
    try {
        logger.info('method transferERC20 token');
        logger.info('reqBody',reqBody)
        //console.log("FractionalNFTInstance ===> ",FractionalNFTInstance);
        let transactionInfo = new transactionDetails()
        let tempRec = await ContractModel.findOne({tokenId:reqBody.tokenId})
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

const loadFractionalClaimContract = async (contractAddress) => {
    FractionalClaimInstance = new web3js.eth.Contract(FractionalClaimJSON.abi,contractAddress)
    //FractionalClaimInstance.options.address = contractAddress
    return FractionalClaimInstance 
}

const deployClaimContract = async (reqBody) => {
    let param = []
    logger.info('reqBody',reqBody)
    logger.info('Deploying FractionalClaim contract');
    try {
        param[1] = reqBody.tokenId
        let tempRec = await ContractModel.findOne({tokenId : reqBody.tokenId}).exec() 
        param[0] = tempRec['RealEstateNFT']
        let contractAddress = await deployContract(reqBody.ownerAddress,process.env.FractionalClaim,param)
        await loadFractionalClaimContract(contractAddress)

        logger.info(`FractionalClaim contract loaded`);

        ContractModel.updateOne({tokenId : reqBody.tokenId,ownerAddress : reqBody.ownerAddress},{fractionalClaim : contractAddress}).exec()
        return contractAddress
    } catch (error) {
        logger.error(`Exception occurred in deployClaimContract method :: ${error.stack}`);
        throw error;
    }
}

/*const getClaimStateOfToken = async (reqBody) => {
    let tempRec = await ContractModel.findOne({tokenId : reqBody.tokenId}).exec()
    loadFractionalClaimContract(tempRec['fractionalClaim']);
    return await FractionalClaimInstance.methods.claimState().call()  
}*/

const fundFNFTContract = async (reqBody) => {
    logger.info('Inside fundFNFTContract method');
    console.log('Inside fundFNFTContract method');
    
    try
    {
        let transactionInfo = new transactionDetails()
        logger.info('transfering amount');
        console.log('transfering amount');
        let tempRec = await ContractModel.findOne({tokenId : reqBody.tokenId,ownerAddress : reqBody.ownerAddress}).exec()
        await loadFractionalClaimContract(tempRec['fractionalClaim'])
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

/*const getFundedAmt = async (reqBody) => {
    let tempRec = await ContractModel.findOne({tokenId:reqBody.tokenId})
    loadFractionalClaimContract(tempRec['fractionalClaim'])
    let funds = await FractionalClaimInstance.methods.funds().call()
    return await web3js.utils.fromWei(funds,'ether')
}*/

const approveFractionalClaimForFNFT = async (reqBody) => {
    let transactionInfo = new transactionDetails()
    web3js = await getWeb3Obj()
    //let amt = await web3js.utils.toWei(await web3js.utils.BN(reqBody.approvedAmtInEth))
    let tempRec = await ContractModel.findOne({tokenId:reqBody.tokenId}).exec()
    FractionalNFTInstance = await loadFractionalNFTContract(tempRec['FractionalNFT'])
    let approvalReceipt = await FractionalNFTInstance.methods.approve(tempRec['fractionalClaim'],reqBody.approvedAmtInEth)
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

/*const getTokenAllowanceFromClaim = async (reqBody) => {
    let tempRec = await ContractModel.findOne({tokenId : reqBody.tokenId}).exec();
    loadFractionalNFTContract(tempRec['FractionalNFT'])
    loadFractionalClaimContract(tempRec['fractionalClaim'])
    return await FractionalNFTInstance.methods.allowance(reqBody.owner,tempRec['fractionalClaim']).call()
}

const getownerAddressOfClaim = async (reqBody) => {
    let tempRec = await ContractModel.findOne({tokenId : reqBody.tokenId}).exec()
    FractionalClaimInstance = await loadFractionalClaimContract(tempRec['fractionalClaim']);
    return await FractionalClaimInstance.methods.ownerAddress().call()
}

const getnftAddressFromClaim = async (reqBody) => {
    let tempRec = await ContractModel.findOne({tokenId : reqBody.tokenId}).exec()
    FractionalClaimInstance = await loadFractionalClaimContract(tempRec['fractionalClaim']);
    return await FractionalClaimInstance.methods.nftAddress().call()
}

const getTokenAddressFromClaim = async (reqBody) => {
    let tempRec = await ContractModel.findOne({tokenId : reqBody.tokenId}).exec()
    FractionalClaimInstance = await loadFractionalClaimContract(tempRec['fractionalClaim']);
    return await FractionalClaimInstance.methods.tokenAddress().call()
}

const getTotalFNFTClaimSupply = async (reqBody) => {
    let tempRec = await ContractModel.findOne({tokenId : reqBody.tokenId}).exec()
    await loadFractionalClaimContract(tempRec['fractionalClaim']);
    //FractionalClaimInstance.options.address = tempRec['fractionalClaim']
    return await FractionalClaimInstance.methods.supply().call()
    //console.log('supp', supp);
    //return supp
}*/

const claimFNFTTokens = async (reqBody) => { 
    logger.info(`inside claimFNFTTokens function`)
    let transactionInfo = new transactionDetails();
    let tempRec = await ContractModel.findOne({tokenId:reqBody.tokenId}).exec()
    loadFractionalClaimContract(tempRec['fractionalClaim'])
    loadFractionalNFTContract(tempRec['FractionalNFT'])

    let claimReceipt = await FractionalClaimInstance.methods.claim(tempRec['FractionalNFT'],reqBody.amountOfTokens)
                .send(getTransactionObject(fromAddress=reqBody.tokenOwner))
    
    console.log("Claim Receipt ==> ",claimReceipt.transactionHash);
    transactionInfo.tokenId = reqBody.tokenId
    transactionInfo.from = claimReceipt.from
    transactionInfo.to = claimReceipt.to
    transactionInfo.txType = claimReceipt.type
    transactionInfo.blockNo = claimReceipt.blockNumber
    transactionInfo.eventData = claimReceipt.events
    transactionInfo.txId = claimReceipt.transactionHash
    await transactionInfo.save()

    return claimReceipt.transactionHash
}

const loadNFTEscrowContract = async(contractAddress) => {
    NFTEscrowInstance = new web3js.eth.Contract(NFTEscrowJSON.abi,contractAddress)
    //NFTEscrowInstance.options.address = contractAddress
    return NFTEscrowInstance
}

const addNFTForSell = async(reqBody) => {
    try{
        logger.info('method addNFTForSell invoked');
        logger.info('reqBody', reqBody);

        let contractAddress = await deployContract(reqBody.sellerAddress,process.env.Escrow)
        let tempRec = await ContractModel.findOne({tokenId : reqBody.tokenId,ownerAddress : reqBody.sellerAddress}).exec()

        reqObj = {}
        reqObj.tokenId = reqBody.tokenId
        reqObj.sellerAddress = reqBody.sellerAddress
        reqObj.NFT = tempRec = tempRec.RealEstateNFT
        reqObj.escrow = contractAddress

        loadNFTEscrowContract(contractAddress)
        let addForSellReceipt = await depositeNFTtoNFTEscrow(reqObj)
        await ContractModel.updateOne({tokenId : reqBody.tokenId,ownerAddress : reqBody.sellerAddress},{escrowNFT:contractAddress}).exec()

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
        logger.info(`Added NFT for Sale`)
        return addForSellReceipt.transactionHash
    }
    catch(error)
    {
        console.error(error)
        logger.info(`NFTEscrow contract deployment error`)
    }
}

const approveNFT = async (reqBody) => {
    try{
        logger.info(`Approving NFT for contract NFTEscrow`)
        loadRealEstateNFTContract(reqBody.NFT)
        loadNFTEscrowContract(reqBody.escrow)
        
        transactionInfo = new transactionDetails()
        let NFTApproveReceipt = await RealEstateNFTInstance.methods.approve(reqBody.escrow,reqBody.tokenId)
        .send(getTransactionObject(reqBody.sellerAddress))
        if(NFTApproveReceipt.status)
        {
            transactionInfo.tokenId = reqObj.tokenId
            transactionInfo.to = NFTApproveReceipt.to
            transactionInfo.from = NFTApproveReceipt.from
            transactionInfo.txType = NFTApproveReceipt.type
            transactionInfo.blockNo = NFTApproveReceipt.blockNumber
            transactionInfo.eventData = NFTApproveReceipt.events
            transactionInfo.txId = NFTApproveReceipt.transactionHash

            await transactionInfo.save()
            logger.info(`Approved NFT for contract NFTEscrow`)
            //return NFTApproveReceipt.transactioHash;
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

const depositeNFTtoNFTEscrow = async (reqBody) => {
    transactionInfo = new transactionDetails()
    
    try{
        await approveNFT(reqBody);
        logger.info(`Depositing the NFT token to NFTEscrow Contract`)
        let depositeReceipt = await NFTEscrowInstance.methods.depositNFT(reqBody.NFT,reqBody.tokenId)
            .send(getTransactionObject(reqBody.sellerAddress))
        logger.info(`Deposited the NFT to NFTEscrow Contract`)
        if(depositeReceipt.status)
        {
            transactionInfo.tokenId = reqObj.tokenId
            transactionInfo.to = depositeReceipt.to
            transactionInfo.from = depositeReceipt.from
            transactionInfo.txType = depositeReceipt.type
            transactionInfo.blockNo = depositeReceipt.blockNumber
            transactionInfo.eventData = depositeReceipt.events
            transactionInfo.txId = depositeReceipt.transactionHash
            await transactionInfo.save()

            return depositeReceipt
        }
    }
    catch(error)
    {
        console.log("---------------Error in depositeFNFT ",error)
        throw error
    }
}

const fundNFTEscrow = async (reqBody) => {
    transactionInfo = new transactionDetails()
    try
    {
        let tempRec = await ContractModel.findOne({tokenId : reqBody.tokenId}).exec()
        await loadNFTEscrowContract(tempRec['escrowNFT'])
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
        logger.info(`Deposited ${reqBody.amtInEth} ether to NFTEscrow contract`)
        return fundNFTEscrowReceipt
    }
    catch(error)
    {
        throw error
    }
}

const initiateDelivery = async (reqBody) => {
    try
    {
        let transactionInfo = new transactionDetails()
        let tempRec = await ContractModel.findOne({tokenId : reqBody.tokenId})
        await loadNFTEscrowContract(tempRec['escrowNFT']) 
        logger.info(`Initiating delivery to sell token.`)
        let NFTDeliveryReceipt = await NFTEscrowInstance.methods.initiateDelivery()
                .send(getTransactionObject(fromAddress=reqBody.seller))
        logger.info(`Initiated delivery to sell token.`)
        
        //console.log("NFT DElivery Receipt ==> ",NFTDeliveryReceipt);

        transactionInfo.tokenId = tempRec.tokenId
        transactionInfo.to = NFTDeliveryReceipt.to
        transactionInfo.from = NFTDeliveryReceipt.from
        transactionInfo.txType = NFTDeliveryReceipt.type
        transactionInfo.blockNo = NFTDeliveryReceipt.blockNumber
        transactionInfo.eventData = NFTDeliveryReceipt.events
        transactionInfo.txId = NFTDeliveryReceipt.transactionHash
        
        await transactionInfo.save()
        return NFTDeliveryReceipt.transactionHash
    }
    catch(error)
    {
        throw error
    }
}

const confirmNFTDeliveryByBuyer = async (reqBody) => {
    try
    {
        let tempRec = await ContractModel.findOne({tokenId : reqBody.tokenId})
        
        await loadNFTEscrowContract(tempRec['escrowNFT']) 
        await loadFractionalNFTContract(tempRec['RealEstateNFT'])
        
        logger.info(`Getting confirmation of delivery from buyer.`)
        let NFTConfirmationReceipt = await NFTEscrowInstance.methods.confirmDelivery()
                    .send(getTransactionObject(fromAddress=reqBody.buyer))
        logger.info(`Delivery confirmed from buyer.`)

        let transactionInfo = new transactionDetails()
        
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

const cancelAtNFT = async (reqBody) => {
    try {
        tempRec = ContractModel.findOne({tokenId:reqBody.tokenId})
        await loadNFTEscrowContract(tempRec['escrowNFT'])
        logger.info(`Cancelling delivery from seller.`)
        let NFTSellerCancelReceipt = await NFTEscrowInstance.methods.cancelAtNFT()
                    .send(getTransactionObject(fromAddress=reqBody.seller))
        return NFTSellerCancelReceipt.transactionHash
    } catch (error) {
        throw error
    }
}

const cancelBeforeDelivery = async (reqBody) => {
    try {
        tempRec = ContractModel.findOne({tokenId:reqBody.tokenId})
        await loadNFTEscrowContract(tempRec['escrowNFT'])
        let cancelledBeforeReceipt = await NFTEscrowInstance.methods.cancelBeforeDelivery(reqBody.state)
        .send(getTransactionObject(reqBody.user))
        if(cancelledBeforeReceipt)
        {
            logger.info(`${reqBody.user} cancelled deal before delivery.`)
            return cancelledBeforeReceipt.transactionHash
        }

    } catch (error) {
        
    }
}

/*const getEscrowNFTBuyer = async (reqBody) => {
    try {
        tempRec = ContractModel.findOne({tokenId:reqBody.tokenId})
        await loadNFTEscrowContract(tempRec['escrowNFT'])
        return await NFTEscrowInstance.methods.buyerAddress().call()
    } catch (error) {
        throw error
    }
}

const getEscrowNFTSeller = async (reqBody) => {
    try {
        tempRec = ContractModel.findOne({tokenId:reqBody.tokenId})
        await loadNFTEscrowContract(tempRec['escrowNFT'])
        return await NFTEscrowInstance.methods.sellerAddress().call()
    } catch (error) {
        throw error
    }
}

const getEscrowNFTBalance = async (reqBody) => {
    try{
        tempRec = ContractModel.findOne({tokenId:reqBody.tokenId})
        await loadNFTEscrowContract(tempRec['escrowNFT'])
        return await NFTEscrowInstance.methods.getBalance().call()  
    }
    catch(error) {
        throw error
    }
}

const getEscrowNFTState = async (reqBody) => {
    try {
        tempRec = ContractModel.findOne({tokenId:reqBody.tokenId})
        await loadNFTEscrowContract(tempRec['escrowNFT'])
        return await NFTEscrowInstance.methods.projectState().call()
    } catch (error) {
        throw error
    }
}
/*const getFNFTContractAdress = async (reqBody) => {
    let tempRec = ContractModel.findOne({tokenId:reqBody.tokenId})
    //loadRealEstateNFTContract(tempRec['FractionalNFT'])
    //const res = await RealEstateNFTInstance.methods.FNFT(getNFTTokenId()).call()
    return tempRec['FractionalNFT'];
}*/

module.exports = {
    createToken,
    fractionToken,
    loadFractionalNFTContract,
    //getFNFTContractAdress,
    getNFTContractAddress,
    //getNFTTokenId,
    getTotalNFTSupply,
    /*getTotalFNFTSupply,
    getFNFTBalance,
    getNFTBalance,*/
    //getNFTTokenIdByIndex,
    /*getNameOfNFT,
    getNameOfFNFT,*/
    getSymbolOfNFT,
    /*getSymbolOfFNFT,
    getOwnerOfNFTContract,
    getOwnerOfFNFT,*/
    //getOwnerOfNFTByIndex,
    getNFTTokenURI,
    //getNFTTokenOfOwnerByIndex,
    transferERC20Token,
    approveNFT,
    
    deployClaimContract,
    fundFNFTContract,
    /*getFundedAmt,
    getTotalFNFTClaimSupply,
    getClaimStateOfToken,
    getownerAddressOfClaim,
    getnftAddressFromClaim,
    getTokenAddressFromClaim,
    getTokenAllowanceFromClaim,*/
    approveFractionalClaimForFNFT,
    claimFNFTTokens,

    loadNFTEscrowContract,
    addNFTForSell,
    fundNFTEscrow,
    initiateDelivery,
    confirmNFTDeliveryByBuyer,
    cancelAtNFT,
    cancelBeforeDelivery,
    /*getEscrowNFTBuyer,
    getEscrowNFTSeller,
    getEscrowNFTBalance,
    getEscrowNFTState,*/
};