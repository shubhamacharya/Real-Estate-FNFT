const { assert, ethers } = require("hardhat");
const Web3 = require('web3');
const ganache = require('ganache-cli');
const abiDecoder = require('abi-decoder');
const FractionalNFT = artifacts.require("FractionalNFT");
const FNFToken = artifacts.require("FNFToken");
const FractionalClaim = artifacts.require("FractionalClaim");
const NFTEscrow = artifacts.require("NFTEscrow");

let web3
let owner,fractionalBuyer1,fractionalBuyer2
let fractionalNFTInstance;
let fractionalTokenAddress
let result
let FNFTokenInstance
let fractionalClaimInstance
let NFTEscrowInstance



contract('FractionalNFT', async accounts => {
    describe('Test', async () => {
        web3 = new Web3(ganache.provider());
        owner = accounts[0]
        fractionalBuyer1 = accounts[1]
        fractionalBuyer2 = accounts[2]
        FNFTBuyer = accounts[3]

        const web3Handle = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
        
        abiDecoder.addABI(FNFToken.abi);
        before(async () => {
            fractionalNFTInstance = await FractionalNFT.new();
            NFTEscrowInstance = await NFTEscrow.new();
            contractHandle = new web3Handle.eth.Contract(FractionalNFT.abi, fractionalNFTInstance.address);
        })
        
        it('should mint 1 - ERC-721 and 4 - ERC-20 tokens', async() => {
            result = await fractionalNFTInstance.mint(owner,"http://www.youtube.com",'4000000000000000000');
            assert.equal(result.receipt.status,true, 'token minting failed');
            assert.equal(result.logs[0].event,'Transfer', 'Transfer event not emitted');
            assert.equal(result.logs[0].args.tokenId.toNumber(),0, 'Invalid token ID');
            assert.equal(result.logs[1].event,'OwnershipTransferred', 'OwnershipTransferred event not emitted');
            assert.equal(result.logs[1].args.newOwner,fractionalNFTInstance.address, 'new owner address does not match');
        })
        it('should should return total supply', async() => {
            result = await fractionalNFTInstance.totalSupply.call()
            assert.equal(result.toNumber(),1, 'Total supply does not match');
        })
        it('should return ERC-721 balance of owner',async() => {
            result = await fractionalNFTInstance.balanceOf(owner) // ERC-721
            assert.equal(result.toNumber(),1,'ERC-721 balance does not match')
        })
        it('should return tokenId',async() => {
            result = await fractionalNFTInstance.FNFT(0);
            assert.equal(result.tokenId.toNumber(), 0, 'Token id does not match');
        })
        it('should return the address of FNFT contract',async() => {
            result = await fractionalNFTInstance.FNFT(0);
            fractionalTokenAddress = result.fractionalToken
            assert.notEqual(fractionalTokenAddress,0x00, 'Fractional token address does not match')
            FNFTokenInstance = await FNFToken.at(fractionalTokenAddress)
        })
        it('should return tokenId using index',async() => {
            result = await fractionalNFTInstance.tokenByIndex(0);
            assert.equal(result.toNumber(), 0, 'Token id does not match');
        })
        it('should return name of token',async() => {
            result = await fractionalNFTInstance.name()
            assert.equal(result,"FractionalNFT", 'Token name does not match')
        })
        it('should return owner of token',async() => {
            result = await fractionalNFTInstance.owner()
            assert.equal(result,owner, "Owner address does not match");
        })
        it('should return owner of token using tokenId',async() => {
            result = await fractionalNFTInstance.ownerOf(0) // ERC-721
            assert.equal(result,owner, 'Token owner does not match')
        })
        it('should return symbol of nft',async() => {
            result = await fractionalNFTInstance.symbol() // ERC-721
            assert.equal(result,"FNFT", 'Token Symbol does not match')
        })
        it('should return token URI using index',async() => {
            result = await fractionalNFTInstance.tokenURI(0) // ERC-721
            assert.equal(result,"http://www.youtube.com", 'Token URI does not match')
        })
        it('should return tokenId by owner address and index',async() => {
            result = await fractionalNFTInstance.tokenOfOwnerByIndex(owner,0)
            assert.equal(result.toNumber(),0, 'Token id does not match')
        })
        it('should transfers the ERC-20 token to new users',async() => {
            result = await FNFTokenInstance.transfer(fractionalBuyer1,'2000000000000000000') // 50% of FNFT Tokens from owner's balance
            assert.equal(result.receipt.status, true, 'token transfer failed');
            assert.equal(result.receipt.logs[0].event, 'Transfer', 'token transfer event not emitted');
            assert.equal(result.receipt.logs[0].args.to, fractionalBuyer1, 'token transfer event not emitted');

            result = await FNFTokenInstance.transfer(fractionalBuyer2,'1000000000000000000') // 25% of FNFT Tokens from owner's balance
            assert.equal(result.receipt.status, true, 'token transfer failed');
            assert.equal(result.receipt.logs[0].event, 'Transfer', 'token transfer event not emitted');
            assert.equal(result.receipt.logs[0].args.to, fractionalBuyer2, 'token transfer event not emitted');
            
            let ownerBalance = await FNFTokenInstance.balanceOf(owner)
            let fractionalBuyer1Balance = await FNFTokenInstance.balanceOf(fractionalBuyer1)
            let fractionalBuyer2Balance = await FNFTokenInstance.balanceOf(fractionalBuyer2)
            assert.equal(ownerBalance.toString(),'1000000000000000000', 'Token balance does not match')
            assert.equal(fractionalBuyer1Balance.toString(),'2000000000000000000', 'Token balance does not match')
            assert.equal(fractionalBuyer2Balance.toString(),'1000000000000000000', 'Token balance does not match')

        })
        it('should deploy Fractioal claim', async() => {
            fractionalClaimInstance = await FractionalClaim.new(fractionalNFTInstance.address, 0);
            // console.log('--->', fractionalClaimInstance);
        })
        it('should fund the token', async() => {
            result = await fractionalClaimInstance.fund(FNFTokenInstance.address, {value: '1000000000000000000'})
            assert.equal(result.receipt.status, true, 'Token fund failed')
            assert.equal(result.logs[0].event, 'funded','funded event not emitted')
        })
        it('should return the funds of the token', async()=> {
            result = await fractionalClaimInstance.funds();
            assert.equal(result.toString(), '1000000000000000000', 'Fund value does not match')
        })
        it('should return the total supply of the token', async()=> {
            result = await fractionalClaimInstance.supply();
            // console.log('result', result.toString());
            assert.equal(result.toString(), '4000000000000000000', 'Total supply does not match')
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
            assert.equal(result, fractionalNFTInstance.address, 'NFT address does not match')
        })
        it('should return the token address of the token', async()=> {
            result = await fractionalClaimInstance.tokenAddress();
            // console.log('result', result);
            assert.equal(result, FNFTokenInstance.address, 'Fractional Token address does not match')
        })
        it('should approve Fractional claim smart contract to interact wiht FNT Token', async() => {
            result = await FNFTokenInstance.approve(fractionalClaimInstance.address, '1000000000000000000', {from: owner})
            assert.equal(result.receipt.status, true, 'Token approve failed')
            assert.equal(result.receipt.logs[0].event, 'Approval', 'Approve event not emitted')
            assert.equal(result.receipt.logs[0].args.owner, owner, 'Owner address does not match')
            assert.equal(result.receipt.logs[0].args.spender, fractionalClaimInstance.address, 'Spender address does not match')
            assert.equal(result.receipt.logs[0].args.value.toString(), '1000000000000000000', 'Value does not match')

            result = await FNFTokenInstance.approve(fractionalClaimInstance.address, '2000000000000000000', {from: fractionalBuyer1})
            assert.equal(result.receipt.logs[0].event, 'Approval', 'Approve event not emitted')
            assert.equal(result.receipt.logs[0].args.owner, fractionalBuyer1, 'Owner address does not match')
            assert.equal(result.receipt.logs[0].args.spender, fractionalClaimInstance.address, 'Spender address does not match')
            assert.equal(result.receipt.logs[0].args.value.toString(), '2000000000000000000', 'Value does not match')

            result = await FNFTokenInstance.approve(fractionalClaimInstance.address, '1000000000000000000', {from: fractionalBuyer2})
            assert.equal(result.receipt.logs[0].event, 'Approval', 'Approve event not emitted')
            assert.equal(result.receipt.logs[0].args.owner, fractionalBuyer2, 'Owner address does not match')
            assert.equal(result.receipt.logs[0].args.spender, fractionalClaimInstance.address, 'Spender address does not match')
            assert.equal(result.receipt.logs[0].args.value.toString(), '1000000000000000000', 'Value does not match')

        })
        it('should check the token allowance', async() => {
            result = await FNFTokenInstance.allowance(owner, fractionalClaimInstance.address)
            assert.equal(result.toString(), '1000000000000000000', 'Allowance does not match')

            result = await FNFTokenInstance.allowance(fractionalBuyer1, fractionalClaimInstance.address)
            assert.equal(result.toString(), '2000000000000000000', 'Allowance does not match')

            result = await FNFTokenInstance.allowance(fractionalBuyer2, fractionalClaimInstance.address)
            assert.equal(result.toString(), '1000000000000000000', 'Allowance does not match')
        })
        it('should claim the FNFT token', async() => {
            result = await fractionalClaimInstance.claim(FNFTokenInstance.address, '1000000000000000000', {from: owner})
            assert.equal(result.receipt.status, true, 'Claim function failed')
            result = await fractionalClaimInstance.claim(FNFTokenInstance.address, '2000000000000000000', {from: fractionalBuyer1})
            assert.equal(result.receipt.status, true, 'Claim function failed')
            result = await fractionalClaimInstance.claim(FNFTokenInstance.address, '1000000000000000000', {from: fractionalBuyer2})
            assert.equal(result.receipt.status, true, 'Claim function failed')

        })
        it('should get the totalSupply of FNFT Token', async() => {
            result = await FNFTokenInstance.totalSupply()
            //console.log('result', result.toNumber());//, "0", 'Token supply does not match');
            assert.equal(result.toNumber(), 0, 'Token supply does not match');
        })
        // now the ERC721 token can be transferred to another user/buyer
        it('should print the address of NFTEscrow', async()=>{
            console.log('NFTEscrow Address', NFTEscrowInstance.address);
        })
        it('should approve NFTEscrow contract to interact with FNFT token', async()=>{
            result = await fractionalNFTInstance.approve(NFTEscrowInstance.address, 0);
            assert.equal(result.receipt.status, true, 'Approval failed')
            assert.equal(result.logs[0].event, 'Approval', 'Approval event not emitted')
            assert.equal(result.logs[0].args.owner,owner, 'Owner does not match')
            assert.equal(result.logs[0].args.approved,NFTEscrowInstance.address, 'Approved address does not match')
            assert.equal(result.logs[0].args.tokenId.toString(),0, 'Token Id does not match')
        })
        it('should deposite the FNFT token to FNTEscrow account to put it on sale', async()=>{
            result = await NFTEscrowInstance.depositNFT(fractionalNFTInstance.address, 0)
            assert.equal(result.receipt.status, true, 'deposite function failed')
          
            let res= await contractHandle.getPastEvents('allEvents', {
                fromBlock: result.receipt.blockNumber,
                toBlock: result.receipt.blockNumber
            });
            assert.equal(res[0].event, 'Approval', 'Approval event not emitted')
            assert.equal(res[1].event, 'Transfer', 'Transfer event not emitted')
        })
        it('should allow buyer to deposite ehter to NFTEscrow contract', async() => {
            result = await NFTEscrowInstance.depositETH({from:FNFTBuyer, value: '1000000000000000000' })
            assert.equal(result.receipt.status, true, 'depositETH function failed')
            assert.equal(await NFTEscrowInstance.buyerAddress(), FNFTBuyer, 'Buyer address does not match')
        })
        it('should allow seller to initiateDelivery to sell token', async()=> {
            result = await NFTEscrowInstance.initiateDelivery({from: owner})
            assert.equal(result.receipt.status, true, 'InitiateDelivery function failed')
        })
        it('should allow buyer to confirm delivery of the token', async()=>{
            result = await NFTEscrowInstance.confirmDelivery({from: FNFTBuyer})
            assert.equal(result.receipt.status, true, 'ConfirmDelivery function failed')
            let res= await contractHandle.getPastEvents('allEvents', {
                fromBlock: result.receipt.blockNumber,
                toBlock: result.receipt.blockNumber
            });
            assert.equal(res[0].event, 'Approval', 'Approval event not emitted')
            assert.equal(res[1].event, 'Transfer', 'Transfer event not emitted')
        })
        it('should verify the new owner address', async()=>{
            result = await fractionalNFTInstance.balanceOf(owner) // ERC-721
            assert.equal(result.toNumber(),0,'ERC-721 balance does not match')
            result = await fractionalNFTInstance.balanceOf(FNFTBuyer) // ERC-721
            assert.equal(result.toNumber(),1,'ERC-721 balance does not match')       
            
            result = await fractionalNFTInstance.ownerOf(0) 
            assert.equal(result,FNFTBuyer, "Owner address does not match");
        })
    })
})