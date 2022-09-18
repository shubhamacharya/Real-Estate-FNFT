const walletIns = require(`./walletProvider`);

const RealEstateNFTJSON = require('../contractJSONs/RealEstateNFT.json')
const FractionalNFTJSON = require('../contractJSONs/FractionalNFT.json')
const FractionalClaimJSON = require('../contractJSONs/FractionalClaim.json')
const EscrowNFTJSON = require('../contractJSONs/NFTEscrow.json')

const path = require('path');
const fileSys = require('fs');
const solc = require('solc');
const contract = require('truffle-contract/lib/contract/index');

function findImports(relativePath) {
    //To solve error of file import callback
    //https://stackoverflow.com/questions/67321111/file-import-callback-not-supported
  const absolutePath = path.resolve(__dirname, '../../truffle/node_modules', relativePath);
  const source = fileSys.readFileSync(absolutePath, 'utf8');
  return { contents: source };
}

const CompileContract = (contractName) => {
  const contract = path.resolve(__dirname,'../../truffle/contracts',contractName);
  console.log("Contract Name : "+contract)
  const contractSource = fileSys.readFileSync(contract,{encoding:"utf-8"});
  console.log("Contract Source Generated.")
  let input = 
  {
      language: "Solidity",
      sources: {
        [contract]: {
          content: contractSource,
        },
      },
     
      settings: {
        outputSelection: {
          "*": {
            "*": ["*"],
          },
        },
        optimizer: {
          enabled: true,
           runs: 200
        }
      },
  };

  let compiledContract = JSON.parse(solc.compile(JSON.stringify(input),{ import: findImports }))
  if(compiledContract.errors)
  {
      console.log("Error While Compiling Contract.")
      console.log(compiledContract["errors"][0].message)
  }
  else
  {	
      const conFileName = Object.keys(compiledContract['contracts'])
      const conName = Object.keys(compiledContract['contracts'][conFileName[0]])
      const conSource = compiledContract['contracts'][conFileName[0]][conName[0]]
      return {abi:conSource['abi'],bytecode:conSource['evm']['bytecode']['object']}
  }    
}

const getWeb3Obj = async () => {
  return await walletIns.getWalletProvider();
}

const deploy = async (contractName,account,params=[]) => {
    const web3 = await getWeb3Obj() 
    console.log("deployer Address ==> ",account)
    let contractInstance;
    let abi,bytecode
    
    try {
      if(!RealEstateNFTJSON || !FractionalNFTJSON || !FractionalClaimJSON || !EscrowNFTJSON)
      {
        [abi,bytecode] = CompileContract(contractName)
      }
      else
      {
        switch(contractName)
        {
          case "RealEstateNFT.sol":
            console.log(`Attempting to deploy ${contractName} from account ${account}`);
            contractInstance = await new web3.eth.Contract(RealEstateNFTJSON.abi)
                            .deploy({data:RealEstateNFTJSON.bytecode})
                            .send({gas:'350000000',from:account});

            console.log(`${contractName} deployed at ${contractInstance.options.address}`);
            
            return contractInstance.options.address
          
          case "FractionalNFT.sol":
            console.log(`Attempting to deploy ${contractName} from account ${account}`);
            contractInstance = await new web3.eth.Contract(FractionalNFTJSON.abi)
                          .deploy({data:FractionalNFTJSON.bytecode})
                          .send({gas:'350000000',from:account});

            console.log(`${contractName} deployed at ${contractInstance.options.address}`);
    
            return contractInstance.options.address
          
          case "FractionalClaim.sol":
            params[1] = web3.utils.toNumber(params[1])
            //console.log('-----> param ', params[1]);
            console.log(`Attempting to deploy ${contractName} from account ${account}`);
            contractInstance = await new web3.eth.Contract(FractionalClaimJSON.abi)
                            .deploy({
                              data: FractionalClaimJSON.bytecode,
                              arguments:params
                            })
                            .send({gas : '350000000',from:account});
              console.log(`${contractName} deployed to ${contractInstance.options.address}`);
              return contractInstance.options.address
          
          case "NFTEscrow.sol":
            console.log(`Attempting to deploy ${contractName} from account ${account}`);
            contractInstance = await new web3.eth.Contract(EscrowNFTJSON.abi)
                            .deploy({
                              data: EscrowNFTJSON.bytecode
                            })
                            .send({gas:'350000000',from:account})
            console.log(`${contractName} deployed to ${contractInstance.options.address}`);
            return contractInstance.options.address
        }
      }
    }
    catch (error) {
      console.log(error)   
    }
}

module.exports = {deploy,getWeb3Obj}
