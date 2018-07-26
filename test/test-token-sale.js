const SmartToken = artifacts.require("SmartToken");

contract('SmartToken', function () {
  const owner = web3.eth.accounts[0]
  const nonOwner = web3.eth.accounts[1]
  let smartTokenInstance
  
  beforeEach(async () => {
    smartTokenInstance = await SmartToken.new(initialTokenName, 12345, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner);
  })
  
  // TODO write me
  it("It should allow the owner to initialize a token sale", async () => {

    
    const startTime = new Date.now() / 1000
    const endTime = startTime + (60 * 60 * 24)
    const priceInWei = web3.eth.toWei(1, 'ether')
    const amountForSale = 1000000

    await smartTokenInstance.initializeTokenSale(startTime, endTime, priceInWei, amountForSale)
    
    

  })

  // TODO write me
  it("It should allow a user to purchase tokens after the sale has been initialized", async () => {

  })
  
  // TODO write me
  it("It fail if trying to initialize a token sale more than once", async () => {

  })

  // TODO write me
  it("It fail if trying to initialize a token sale from a non-owner account", async () => {

  })
  
  // TODO write me
  it("It fail if attempting to purchase before the sale has been initialized", async () => {

  })
  
  // TODO write me
  it("It fail if attempting to purchase tokens before the sale start date", async () => {

  })

  // TODO write me
  it("It fail if attempting to purchase tokens after the sale end date", async () =>( {

  })

  // TODO write me
  it("It fail if attempting to purchase more tokens than are available for sale", async () => {

  })

  // TODO write me
  it("It fail if attempting to purchase more tokens than are available for sale", async () => {

  })



})