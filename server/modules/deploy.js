const walletIns = require(`./walletProvider`);
const FractionalNFTJSON = require('../../blockchain/build/contracts/FractionalNFT.json')
const FractionalClaimJSON = require('../../blockchain/build/contracts/FractionalClaim.json')
const path = require('path');
const fileSys = require('fs');
const solc = require('solc');

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

const deploy = async (contractName,account,params=[]) => {
    const web3 = await walletIns.getWalletProvider() 
    let abi,bytecode,contractInstance;
    
    try {
      if(!FractionalNFTJSON || !FractionalClaimJSON)
      {
        [abi,bytecode] = CompileContract(contractName)
      }
      else
      {
        switch(contractName)
        {
          case "FractionalNFT.sol":
            console.log(`Attempting to deploy ${contractName} from account ${account}`);
            contractInstance = await new web3.eth.Contract(FractionalNFTJSON.abi)
                            .deploy({data:FractionalNFTJSON.bytecode})
                            .send({gas: '10000000',from:account});

            console.log(`${contractName} deployed to ${contractInstance.options.address}`);
    
            return [web3,contractInstance]

          case "FractionalClaim.sol":
            params[1] = web3.utils.toNumber(params[1])
            console.log(params);
            console.log(`Attempting to deploy ${contractName} from account ${account}`);
            contractInstance = await new web3.eth.Contract(FractionalClaimJSON.abi)
                            .deploy({
                              data:FractionalClaimJSON.bytecode,
                              arguments:params
                            })
                            .send({gas: '10000000',from:account});

            console.log(`${contractName} deployed to ${contractInstance.options.address}`);
            return [web3,contractInstance]
        }
      }
    }
    catch (error) {
        console.log(error)   
    }
   
}

module.exports = deploy
