const SmartToken = artifacts.require("SmartToken");
const Logger = artifacts.require("Logger")
const util = require('util')

contract('SmartToken', function (accounts) {
  const owner = web3.eth.accounts[0]
  const nonOwner = web3.eth.accounts[1]
  let smartTokenInstance

  beforeEach(async () => {
    const initialTokenName = 'test'
    const initialTokenSymbol = 'test'
    const initialTokenVersion = 'version'
    const initialTokenDecimals = 18
    const initialSupply = 12345
    const loggerInstance = await Logger.deployed()
    smartTokenInstance = await SmartToken.new(initialTokenName, initialSupply, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner, loggerInstance.address);
  })

  it.only("It should allow the owner to initialize a token sale", async () => {
    const startTime = Date.now() / 1000
    const endTime = startTime + (60 * 60 * 24)
    const priceInWei = web3.toWei(1, 'ether')
    const amountForSale = 1000000

    const tokenSaleInitializedEvent = util.promisify(smartTokenInstance.TokenSaleInitialized)()
    
    await smartTokenInstance.initializeTokenSale(startTime, endTime, priceInWei, amountForSale)

    return tokenSaleInitializedEvent.then( () => {
      return assert(true)
    })

  })

  // TODO add checks that token balances are correct after the purchase
  it("It should allow a user to purchase tokens after the sale has been initialized", async () => {
    const startTime = Math.floor(Date.now() / 1000)
    const endTime = Math.floor(startTime + (60 * 60 * 24))
    const priceInWei = web3.toWei(1, 'ether')
    const amountForSale = 1000000
    const amountToSpend = web3.toWei(10, 'ether')
    
    const TokensPurchased = util.promisify(smartTokenInstance.TokensPurchased)()
    
    await smartTokenInstance.initializeTokenSale(startTime, endTime, priceInWei, amountForSale)

    await smartTokenInstance.buySmartTokens({ value: amountToSpend, from: owner })
   
    return TokensPurchased.then( (result) => {
      return assert(true)
    })

  })
  
  it("It fail if trying to initialize a token sale more than once", async () => {

    const startTime = Date.now() / 1000
    const endTime = startTime + (60 * 60 * 24)
    const priceInWei = web3.toWei(1, 'ether')
    const amountForSale = 1000000

    try {
      await smartTokenInstance.initializeTokenSale(startTime, endTime, priceInWei, amountForSale, { from: owner })
      await smartTokenInstance.initializeTokenSale(startTime, endTime, priceInWei, amountForSale, { from: owner })
    } catch(err) {
      return assert(true)
    }
    return assert(false)
    
  })
  
  it("It fail if trying to initialize a token sale from a non-owner account", async () => {
    const startTime = Date.now() / 1000
    const endTime = startTime + (60 * 60 * 24)
    const priceInWei = web3.toWei(1, 'ether')
    const amountForSale = 1000000

    try {
      await smartTokenInstance.initializeTokenSale(startTime, endTime, priceInWei, amountForSale, { from: nonOwner })
    } catch(err) {
      return assert(true)
    }
    return assert(false)
  })
  
  it("It fail if attempting to purchase before the sale has been initialized", async () => {
    const amountToSpend = web3.toWei(10, 'ether')
    
    try {
      await smartTokenInstance.buySmartTokens({ value: amountToSpend, from: owner })
    } catch(err) {
      return assert(true)
    }
    return assert(false)
    
  })
  
  // TODO write me
  it("It fail if attempting to purchase tokens before the sale start date", async () => {

  })
  
  // TODO write me
  it("It fail if attempting to purchase tokens after the sale end date", async () => {

  })

  // TODO write me
  it("It fail if attempting to purchase more tokens than are available for sale", async () => {

  })
  


})