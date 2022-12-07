const { assert, ethers } = require("hardhat");
const Web3 = require('web3');
const ganache = require('ganache-cli');
const abiDecoder = require('abi-decoder');
const RealEstateNFT = artifacts.require("RealEstateNFT");
const FractionalNFT = artifacts.require("FractionalNFT");
const FractionalClaim = artifacts.require("FractionalClaim");
const NFTEscrow = artifacts.require("NFTEscrow");

let web3
let owner,fractionalBuyer1,fractionalBuyer2
let RealEstateNFTInstance;
let fractionalTokenAddress
let result
let FractionalNFTInstance
let fractionalClaimInstance
let NFTEscrowInstance

contract('RealEstateNFT', async accounts => {
    describe('Test', async () => {
        web3 = new Web3(ganache.provider());
        owner = accounts[0]
        fractionalBuyer1 = accounts[1]
        fractionalBuyer2 = accounts[2]
        FractionalNFTBuyer = accounts[3]

        const web3Handle = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
        
        abiDecoder.addABI(FractionalNFT.abi);
        before(async () => {
            RealEstateNFTInstance = await RealEstateNFT.new();
            NFTEscrowInstance = await NFTEscrow.new();
            contractHandle = new web3Handle.eth.Contract(RealEstateNFT.abi, RealEstateNFTInstance.address);
        })
        
        it('should mint 1 - ERC-721', async() => {
            result = await RealEstateNFTInstance.mint(owner,"http://www.youtube.com");
            assert.equal(result.receipt.status,true, 'token minting failed');
            assert.equal(result.logs[0].event,'Transfer', 'Transfer event not emitted');
            assert.equal(result.logs[0].args.tokenId.toNumber(),0, 'Invalid token ID');
            assert.equal(result.logs[1].event,'NFTTokenCreated', 'NFTTokenCreated event not emitted');
            //assert.equal(result.logs[1].args.newOwner,RealEstateNFTInstance.address, 'new owner address does not match');
        })
        it('should should return total supply of NFT', async() => {
            result = await RealEstateNFTInstance.totalSupply.call()
            assert.equal(result.toNumber(),1, 'Total supply does not match');
        })
        it('should return ERC-721 balance of owner',async() => {
            result = await RealEstateNFTInstance.balanceOf(owner) // ERC-721
            assert.equal(result.toNumber(),1,'ERC-721 balance does not match')
        })
        it('should return NFT tokenId',async() => {
            result = await RealEstateNFTInstance.NFT(0);
            assert.equal(result.toNumber(), 0, 'Token id does not match');
        })
        /*it('should return the address of RealEstateNFT contract',async() => {
            //result = await RealEstateNFTInstance.NFT(0);
            console.log(RealEstateNFTInstance)
            //fractionalTokenAddress = result.fractionalToken
            //assert.notEqual(fractionalTokenAddress,0x00, 'Fractional token address does not match')
            //FractionalNFTInstance = await FractionalNFT.at(fractionalTokenAddress)
        })*/
        it('should return tokenId using index',async() => {
            result = await RealEstateNFTInstance.tokenByIndex(0);
            assert.equal(result.toNumber(), 0, 'Token id does not match');
        })
        it('should return name of token',async() => {
            result = await RealEstateNFTInstance.name()
            assert.equal(result,"RealEstateNFT", 'Token name does not match')
        })
        it('should return owner of token',async() => {
            result = await RealEstateNFTInstance.owner()
            assert.equal(result,owner, "Owner address does not match");
        })
        it('should return owner of NFT token using tokenId',async() => {
            result = await RealEstateNFTInstance.ownerOf(0) // ERC-721
            assert.equal(result,owner, 'Token owner does not match')
        })
        it('should return symbol of NFT',async() => {
            result = await RealEstateNFTInstance.symbol() // ERC-721
            assert.equal(result,"RNFT", 'Token Symbol does not match')
        })
        it('should return token URI using index',async() => {
            result = await RealEstateNFTInstance.tokenURI(0) // ERC-721
            assert.equal(result,"http://www.youtube.com", 'Token URI does not match')
        })
        it('should return tokenId by owner address and index',async() => {
            result = await RealEstateNFTInstance.tokenOfOwnerByIndex(owner,0)
            assert.equal(result.toNumber(),0, 'Token id does not match')
        })
        it('should mint 4 ERC-20 token against ERC-720',async() => {
            FractionalNFTInstance = await FractionalNFT.new()
            result = await FractionalNFTInstance.mint(owner,4,0)
        })
        it('should transfers the ERC-20 token to new users',async() => {
            result = await FractionalNFTInstance.transfer(fractionalBuyer1,'2') // 50% of FractionalNFT Tokens from owner's balance
            assert.equal(result.receipt.status, true, 'token transfer failed');
            assert.equal(result.receipt.logs[0].event, 'Transfer', 'token transfer event not emitted');
            assert.equal(result.receipt.logs[0].args.to, fractionalBuyer1, 'token transfer event not emitted');

            result = await FractionalNFTInstance.transfer(fractionalBuyer2,'1') // 25% of FractionalNFT Tokens from owner's balance
            assert.equal(result.receipt.status, true, 'token transfer failed');
            assert.equal(result.receipt.logs[0].event, 'Transfer', 'token transfer event not emitted');
            assert.equal(result.receipt.logs[0].args.to, fractionalBuyer2, 'token transfer event not emitted');
            
            let ownerBalance = await FractionalNFTInstance.balanceOf(owner)
            let fractionalBuyer1Balance = await FractionalNFTInstance.balanceOf(fractionalBuyer1)
            let fractionalBuyer2Balance = await FractionalNFTInstance.balanceOf(fractionalBuyer2)
            assert.equal(ownerBalance.toString(),'1', 'Token balance does not match')
            assert.equal(fractionalBuyer1Balance.toString(),'2', 'Token balance does not match')
            assert.equal(fractionalBuyer2Balance.toString(),'1', 'Token balance does not match')

        })
        it('should deploy Fractional claim contract', async() => {
            fractionalClaimInstance = await FractionalClaim.new(RealEstateNFTInstance.address, 0);
            assert.notEqual(fractionalClaimInstance.address,"0x000",'Fractional Claim contract not deployed.')
        })
        it('should fund the token', async() => {
            result = await fractionalClaimInstance.fund(FractionalNFTInstance.address, {value: '1000000000000000000'})
            assert.equal(result.receipt.status, true, 'Token fund failed')
            assert.equal(result.logs[0].event, 'funded','funded event not emitted')
        })
        it('should return the funds of the token', async()=> {
            result = await fractionalClaimInstance.funds();
            assert.equal(result.toString(), '1000000000000000000', 'Fund value does not match')
        })
        it('should return the total supply of the token', async()	=> {
            result = await fractionalClaimInstance.supply();
            // console.log('result', result.toString());
            assert.equal(result.toString(), '4', 'Total supply does not match')
        })
        it('should return the claim state of the token', async()=> {
            result = await fractionalClaimInstance.claimState();
            // console.log('result', result);
            assert.equal(result.toString(), '1', 'Token state does not match')
        })
        it('should return the owner address of the token', async()=> {
            result = await fractionalClaimInstance.ownerAddress();
            // console.log('result', result);
            assert.equal(result, owner, 'Owner address does not match')
        })
        it('should return the NFT address of the token', async()=> {
            result = await fractionalClaimInstance.nftAddress();
            // console.log('result', result);
            assert.equal(result, RealEstateNFTInstance.address, 'NFT address does not match')
        })
        it('should return the token address of the token', async()=> {
            result = await fractionalClaimInstance.tokenAddress();
            // console.log('result', result);
            assert.equal(result, FractionalNFTInstance.address, 'Fractional Token address does not match')
        })
        it('should approve Fractional claim smart contract to interact wiht FNT Token', async() => {
            result = await FractionalNFTInstance.approve(fractionalClaimInstance.address, '1000000000000000000', {from: owner})
            assert.equal(result.receipt.status, true, 'Token approve failed')
            assert.equal(result.receipt.logs[0].event, 'Approval', 'Approve event not emitted')
            assert.equal(result.receipt.logs[0].args.owner, owner, 'Owner address does not match')
            assert.equal(result.receipt.logs[0].args.spender, fractionalClaimInstance.address, 'Spender address does not match')
            assert.equal(result.receipt.logs[0].args.value.toString(), '1000000000000000000', 'Value does not match')

            result = await FractionalNFTInstance.approve(fractionalClaimInstance.address, '2000000000000000000', {from: fractionalBuyer1})
            assert.equal(result.receipt.logs[0].event, 'Approval', 'Approve event not emitted')
            assert.equal(result.receipt.logs[0].args.owner, fractionalBuyer1, 'Owner address does not match')
            assert.equal(result.receipt.logs[0].args.spender, fractionalClaimInstance.address, 'Spender address does not match')
            assert.equal(result.receipt.logs[0].args.value.toString(), '2000000000000000000', 'Value does not match')

            result = await FractionalNFTInstance.approve(fractionalClaimInstance.address, '1000000000000000000', {from: fractionalBuyer2})
            assert.equal(result.receipt.logs[0].event, 'Approval', 'Approve event not emitted')
            assert.equal(result.receipt.logs[0].args.owner, fractionalBuyer2, 'Owner address does not match')
            assert.equal(result.receipt.logs[0].args.spender, fractionalClaimInstance.address, 'Spender address does not match')
            assert.equal(result.receipt.logs[0].args.value.toString(), '1000000000000000000', 'Value does not match')

        })
        it('should check the token allowance', async() => {
            result = await FractionalNFTInstance.allowance(owner, fractionalClaimInstance.address)
            assert.equal(result.toString(), '1000000000000000000', 'Allowance does not match')

            result = await FractionalNFTInstance.allowance(fractionalBuyer1, fractionalClaimInstance.address)
            assert.equal(result.toString(), '2000000000000000000', 'Allowance does not match')

            result = await FractionalNFTInstance.allowance(fractionalBuyer2, fractionalClaimInstance.address)
            assert.equal(result.toString(), '1000000000000000000', 'Allowance does not match')
        })
        it('should claim the FractionalNFT token', async() => {
            result = await fractionalClaimInstance.claim(FractionalNFTInstance.address, '1', {from: owner})
            assert.equal(result.receipt.status, true, 'Claim function failed')
            result = await fractionalClaimInstance.claim(FractionalNFTInstance.address, '2', {from: fractionalBuyer1})
            assert.equal(result.receipt.status, true, 'Claim function failed')
            result = await fractionalClaimInstance.claim(FractionalNFTInstance.address, '1', {from: fractionalBuyer2})
            assert.equal(result.receipt.status, true, 'Claim function failed')

        })
        it('should get the totalSupply of FractionalNFT Token', async() => {
            result = await FractionalNFTInstance.totalSupply()
            //console.log('result', result.toNumber());//, "0", 'Token supply does not match');
            assert.equal(result.toNumber(), 0, 'Token supply does not match');
        })
        
        // now the ERC721 token can be transferred to another user/buyer
        it('should print the address of NFTEscrow', async()=>{
            console.log('NFTEscrow Address', NFTEscrowInstance.address);
        })
        it('should approve NFTEscrow contract to interact with FractionalNFT token', async()=>{
            result = await RealEstateNFTInstance.approve(NFTEscrowInstance.address, 0);
            assert.equal(result.receipt.status, true, 'Approval failed')
            assert.equal(result.logs[0].event, 'Approval', 'Approval event not emitted')
            assert.equal(result.logs[0].args.owner,owner, 'Owner does not match')
            assert.equal(result.logs[0].args.approved,NFTEscrowInstance.address, 'Approved address does not match')
            assert.equal(result.logs[0].args.tokenId.toString(),0, 'Token Id does not match')
        })
        it('should deposite the FractionalNFT token to FNTEscrow account to put it on sale', async()=>{
            result = await NFTEscrowInstance.depositNFT(RealEstateNFTInstance.address, 0)
            assert.equal(result.receipt.status, true, 'deposite function failed')
          
            let res= await contractHandle.getPastEvents('allEvents', {
                fromBlock: result.receipt.blockNumber,
                toBlock: result.receipt.blockNumber
            });
            assert.equal(res[0].event, 'Approval', 'Approval event not emitted')
            assert.equal(res[1].event, 'Transfer', 'Transfer event not emitted')
        })
        it('should allow buyer to deposite ether to NFTEscrow contract', async() => {
            result = await NFTEscrowInstance.depositETH({from:FractionalNFTBuyer, value: '1000000000000000000' })
            assert.equal(result.receipt.status, true, 'depositETH function failed')
            assert.equal(await NFTEscrowInstance.buyerAddress(), FractionalNFTBuyer, 'Buyer address does not match')
        })
        it('should allow seller to initiateDelivery to sell token', async()=> {
            result = await NFTEscrowInstance.initiateDelivery({from: owner})
            assert.equal(result.receipt.status, true, 'InitiateDelivery function failed')
        })
        it('should allow buyer to confirm delivery of the token', async()=>{
            result = await NFTEscrowInstance.confirmDelivery({from: FractionalNFTBuyer})
            assert.equal(result.receipt.status, true, 'ConfirmDelivery function failed')
            let res= await contractHandle.getPastEvents('allEvents', {
                fromBlock: result.receipt.blockNumber,
                toBlock: result.receipt.blockNumber
            });
            assert.equal(res[0].event, 'Approval', 'Approval event not emitted')
            assert.equal(res[1].event, 'Transfer', 'Transfer event not emitted')
        })
        it('should verify the new owner address', async()=>{
            result = await RealEstateNFTInstance.balanceOf(owner) // ERC-721
            assert.equal(result.toNumber(),0,'ERC-721 balance does not match')
            result = await RealEstateNFTInstance.balanceOf(FractionalNFTBuyer) // ERC-721
            assert.equal(result.toNumber(),1,'ERC-721 balance does not match')       
            
            result = await RealEstateNFTInstance.ownerOf(0) 
            assert.equal(result,FractionalNFTBuyer, "Owner address does not match");
        })
    })
})
