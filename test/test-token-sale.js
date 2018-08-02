const SmartToken = artifacts.require("SmartToken");
const Logger = artifacts.require("Logger")
const util = require('util')
const Web3 = require('web3')
const web3 = new Web3()
const provider = new web3.providers.HttpProvider('http://localhost:8545')
web3.setProvider(provider)

contract('SmartToken-sale', function (accounts) {
  const owner = web3.eth.accounts[0]
  const nonOwner = web3.eth.accounts[1]
  let smartTokenInstance

  before(async () => {

  })

  beforeEach(async () => {
    const initialTokenName = 'test'
    const initialTokenSymbol = 'test'
    const initialTokenVersion = 'version'
    const initialTokenDecimals = 18
    const initialSupply = 12345
    const loggerInstance = await Logger.deployed()
    smartTokenInstance = await SmartToken.new(initialTokenName, initialSupply, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner, loggerInstance.address);
  })

  it("It should allow the owner to initialize a token sale", async () => {
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

  it("It should allow a user to purchase tokens after the sale has been initialized", async () => {
    const startTime = Math.floor(Date.now() / 1000)
    const endTime = Math.floor(startTime + (60 * 60 * 24))
    const priceInWei = web3.toWei(1, 'ether')
    const amountForSale = 1000000
    const amountToSpend = web3.toWei(10, 'ether')

    const expectedPurchaseAmount = amountToSpend / priceInWei

    try {

      const TokensPurchased = util.promisify(smartTokenInstance.TokensPurchased)()

      await smartTokenInstance.initializeTokenSale(startTime, endTime, priceInWei, amountForSale)

      const tokenBalanceBefore = await smartTokenInstance.balanceOf(owner)

      web3.eth.sendTransaction({
        from: owner,
        to: smartTokenInstance.address,
        value: amountToSpend,
        gas: 100000
      }, (err, result) => {
        smartTokenInstance.balanceOf(owner).then((tokenBalanceAfter)=>{
          return TokensPurchased.then( () => {
            return assert(tokenBalanceAfter.equals(tokenBalanceBefore.plus(expectedPurchaseAmount)))
          })
        })       
      });

    } catch (error) {
      console.log('error:', error)
      assert(false, error)
    }
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
      web3.eth.sendTransaction({
        from: owner,
        to: smartTokenInstance.address,
        value: amountToSpend,
        gas: 100000
      }, (err, result) => {
        if(err){
          return assert(true)
        } else {
          return assert(false)
        }
      });
    } catch(err) {
      return assert(true)
    }    
  })
  
  it("It fail if attempting to purchase tokens before the sale start date", async () => {
    const startTime = Math.floor(Date.now() / 1000) + (60 * 60 * 24)
    const endTime = Math.floor(startTime + (60 * 60 * 24))
    const priceInWei = web3.toWei(1, 'ether')
    const amountForSale = 1000000
    const amountToSpend = web3.toWei(10, 'ether')
    
    await smartTokenInstance.initializeTokenSale(startTime, endTime, priceInWei, amountForSale)
    
    try {
      web3.eth.sendTransaction({
        from: owner,
        to: smartTokenInstance.address,
        value: amountToSpend,
        gas: 100000
      }, (err, result) => {
        if(err){
          return assert(true)
        } else {
          return assert(false)
        }
      });
    } catch(err) {
      return assert(true)
    }
  })
  
  it("It fail if attempting to purchase tokens after the sale end date", async () => {
    const startTime = Math.floor(Date.now() / 1000) - (60 * 60 * 48)
    const endTime = Math.floor(startTime + (60 * 60 * 24))
    const priceInWei = web3.toWei(1, 'ether')
    const amountForSale = 1000000
    const amountToSpend = web3.toWei(10, 'ether')

    await smartTokenInstance.initializeTokenSale(startTime, endTime, priceInWei, amountForSale)

    try {
      web3.eth.sendTransaction({
        from: owner,
        to: smartTokenInstance.address,
        value: amountToSpend,
        gas: 100000
      }, (err, result) => {
        if(err){
          return assert(true)
        } else {
          return assert(false)
        }
      });
    } catch(err) {
      return assert(true)
    }
  })

  it("It fail if attempting to purchase more tokens than are available for sale", async () => {
    const startTime = Math.floor(Date.now() / 1000)
    const endTime = Math.floor(startTime + (60 * 60 * 24))
    const priceInWei = web3.toWei(1, 'ether')
    const amountForSale = 1000000
    const amountToSpend = web3.toWei(10, 'ether') * amountForSale

    await smartTokenInstance.initializeTokenSale(startTime, endTime, priceInWei, amountForSale)

    try {
      web3.eth.sendTransaction({
        from: owner,
        to: smartTokenInstance.address,
        value: amountToSpend,
        gas: 100000
      }, (err, result) => {
        if(err){
          return assert(true)
        } else {
          return assert(false)
        }
      });
    } catch(err) {
      return assert(true)
    }
  })

  describe("Token Sale Update Functions", async () => {
    it("It should allow the owner to update the token sale startTime", async () => {
      const startTime = Date.now() / 1000
      const newStartTime = (Date.now() / 1000) + (60*60) // updated value
      const endTime = startTime + (60 * 60 * 24)
      const priceInWei = web3.toWei(1, 'ether')
      const amountForSale = 1000000

      const tokenSaleInitializedEvent = util.promisify(smartTokenInstance.TokenSaleInitialized)()

      await smartTokenInstance.initializeTokenSale(startTime, endTime, priceInWei, amountForSale)

      return tokenSaleInitializedEvent.then( () => {
        smartTokenInstance.updateStartTime(newStartTime, {from: owner})
        smartTokenInstance.saleStartTime().then((currentStartTime) => {
          assert(Math.floor(newStartTime) === Math.floor(currentStartTime))
        })
      })
    })

    it("It should not allow a non-owner to update the token sale startTime", async () => {
      const startTime = Date.now() / 1000
      const newStartTime = (Date.now() / 1000) + (60*60) // updated value
      const endTime = startTime + (60 * 60 * 24)
      const priceInWei = web3.toWei(1, 'ether')
      const amountForSale = 1000000

      const tokenSaleInitializedEvent = util.promisify(smartTokenInstance.TokenSaleInitialized)()
      await smartTokenInstance.initializeTokenSale(startTime, endTime, priceInWei, amountForSale)
      return tokenSaleInitializedEvent.then( () => {
        smartTokenInstance.updateStartTime(newStartTime, {from: nonOwner})
        .then(( ) => {
          return assert(false); // we should never be hitting this when a nonOwner calls this
        }).catch(( ) => {
          smartTokenInstance.saleStartTime().then((currentStartTime) => {
            if (Math.floor(startTime) === Math.floor( currentStartTime )) {
              return assert(true);
            } else {
              return assert(false,'foo');
            }
          })
        })
      })
    })

    it("It should allow an owner to update the token sale endTime", async () => {
      const startTime = Date.now() / 1000
      const endTime = startTime + (60 * 60 * 24)
      const newEndTime = startTime + (60 * 60 * 24) + (60*60)
      const priceInWei = web3.toWei(1, 'ether')
      const amountForSale = 1000000

      const tokenSaleInitializedEvent = util.promisify(smartTokenInstance.TokenSaleInitialized)()
      await smartTokenInstance.initializeTokenSale(startTime, endTime, priceInWei, amountForSale)

      return tokenSaleInitializedEvent.then( () => {
        try {
          smartTokenInstance.updateEndTime(newEndTime, {from: owner})
        } catch (error) {
          assert(true)
          smartTokenInstance.saleEndTime().then((currentEndTime) => {
            return assert(Math.floor(newEndTime) === Math.floor(currentEndTime))
          })
        }
      })
    })

    it("It should not allow a non-owner to update the token sale endTime", async () => {
      const startTime = Date.now() / 1000
      const endTime = startTime + (60 * 60 * 24)
      const newEndTime = startTime + (60 * 60 * 24) + (60*60)
      const priceInWei = web3.toWei(1, 'ether')
      const amountForSale = 1000000

      const tokenSaleInitializedEvent = util.promisify(smartTokenInstance.TokenSaleInitialized)()
      await smartTokenInstance.initializeTokenSale(startTime, endTime, priceInWei, amountForSale)
      return tokenSaleInitializedEvent.then( () => {
        smartTokenInstance.updateEndTime(newEndTime, {from: nonOwner})
        .then(() => {
          assert(false); // should not succeed with a nonOwner
        }).catch(( ) => {
          assert(true)
          smartTokenInstance.saleEndTime().then((currentEndTime) => {
            return assert(Math.floor(endTime) === Math.floor(currentEndTime))
          })
        });
      })
    })

    it("It should allow an owner to update the token sale endTime", async () => {
      const startTime = Date.now() / 1000
      const endTime = startTime + (60 * 60 * 24)
      const newEndTime = startTime + (60 * 60 * 24) + (60*60)
      const priceInWei = web3.toWei(1, 'ether')
      const amountForSale = 1000000

      const tokenSaleInitializedEvent = util.promisify(smartTokenInstance.TokenSaleInitialized)()
      await smartTokenInstance.initializeTokenSale(startTime, endTime, priceInWei, amountForSale)

      return tokenSaleInitializedEvent.then( () => {
        try {
          smartTokenInstance.updateEndTime(newEndTime, {from: owner})
        } catch (error) {
          assert(true)
          smartTokenInstance.saleEndTime().then((currentEndTime) => {
            return assert(Math.floor(newEndTime) === Math.floor(currentEndTime))
          })
        }
      })
    })

    it("It should allow an owner to update the token sale price", async () => {
      const startTime = Date.now() / 1000
      const endTime = startTime + (60 * 60 * 24)
      const priceInWei = web3.toWei(1, 'ether')
      const newPriceInWei = web3.toWei(100, 'ether')
      const amountForSale = 1000000

      const tokenSaleInitializedEvent = util.promisify(smartTokenInstance.TokenSaleInitialized)()

      await smartTokenInstance.initializeTokenSale(startTime, endTime, priceInWei, amountForSale)

      return tokenSaleInitializedEvent.then(() => {
        smartTokenInstance.updatePriceInWei(newPriceInWei, {from: owner}).then((currentPriceInWei) => {
          return assert(false);
        }).catch(() => {
          return assert(true);
        })
      })
    })

    it("It should allow an owner to update the token sale amount remaining", async () => {
      const startTime = Date.now() / 1000
      const endTime = startTime + (60 * 60 * 24)
      const priceInWei = web3.toWei(1, 'ether')
      const amountForSale = 1000000
      const newAmountRemainingForSale = 100

      const tokenSaleInitializedEvent = util.promisify(smartTokenInstance.TokenSaleInitialized)()

      await smartTokenInstance.initializeTokenSale(startTime, endTime, priceInWei, amountForSale)

      return tokenSaleInitializedEvent.then(() => {
        smartTokenInstance.updateAmountRemainingForSale(newAmountRemainingForSale, {from: owner})
        smartTokenInstance.amountRemainingForSale().then((currentAmountRemainingForSale) => {
          assert(newAmountRemainingForSale.toString() === currentAmountRemainingForSale.toString())
        })
      })
    })

    it("It should not allow the owner to update the token sale amuount remaining to negative", async () => {
      const startTime = Date.now() / 1000
      const endTime = startTime + (60 * 60 * 24)
      const priceInWei = web3.toWei(1, 'ether')
      const amountForSale = 1000000
      const newAmountRemainingForSale = -100

      const tokenSaleInitializedEvent = util.promisify(smartTokenInstance.TokenSaleInitialized)()

      await smartTokenInstance.initializeTokenSale(startTime, endTime, priceInWei, amountForSale)

      return tokenSaleInitializedEvent.then(() => {
        smartTokenInstance.updateAmountRemainingForSale(newAmountRemainingForSale, {from: owner})
        smartTokenInstance.amountRemainingForSale().then((currentAmountRemainingForSale) => {
          return assert(false);
        }).catch(( ) => {
          return assert(true);
        })
      })
    });

    it("It should not allow the owner to update the token sale amuount remaining to a string", async () => {
      const startTime = Date.now() / 1000
      const endTime = startTime + (60 * 60 * 24)
      const priceInWei = web3.toWei(1, 'ether')
      const amountForSale = 1000000
      const newAmountRemainingForSale = 'a lot more'

      const tokenSaleInitializedEvent = util.promisify(smartTokenInstance.TokenSaleInitialized)()

      await smartTokenInstance.initializeTokenSale(startTime, endTime, priceInWei, amountForSale)

      return tokenSaleInitializedEvent.then(() => {
        smartTokenInstance.updateAmountRemainingForSale(newAmountRemainingForSale, {from: owner})
        smartTokenInstance.amountRemainingForSale().then((currentAmountRemainingForSale) => {
          return assert(false);
        }).catch(( ) => {
          return assert(true);
        })
      })
    });

    it("It should not allow an owner to update the token sale price to negative", async () => {
      const startTime = Date.now() / 1000
      const endTime = startTime + (60 * 60 * 24)
      const priceInWei = web3.toWei(1, 'ether')
      const newPriceInWei = web3.toWei(-1, 'ether')
      const amountForSale = 1000000
      const tokenSaleInitializedEvent = util.promisify(smartTokenInstance.TokenSaleInitialized)()

      await smartTokenInstance.initializeTokenSale(startTime, endTime, priceInWei, amountForSale)

      return tokenSaleInitializedEvent.then(() => {
        smartTokenInstance.updatePriceInWei(newPriceInWei, {from: owner})
        smartTokenInstance.amountRemainingForSale().then((currentAmountRemainingForSale) => {
          return assert(true);
        }).catch(( ) => {
          return assert(false);
        })
      })
    });

    it("It should not allow an owner to update the token sale startTime to negative", async () => {
      const startTime = Date.now() / 1000
      const endTime = startTime + (60 * 60 * 24)
      const newStartTime = -100
      const priceInWei = web3.toWei(1, 'ether')
      const amountForSale = 1000000

      const tokenSaleInitializedEvent = util.promisify(smartTokenInstance.TokenSaleInitialized)()
      await smartTokenInstance.initializeTokenSale(startTime, endTime, priceInWei, amountForSale)
      return tokenSaleInitializedEvent.then( () => {
        smartTokenInstance.updateStartTime(newStartTime, {from: owner})
        .then(() => {
          assert(false);
        }).catch(( ) => {
          return assert(true)
        });
      })
    });
  
    it("It should not allow an owner to update the token sale startTime to a string", async () => {
      const startTime = Date.now() / 1000
      const endTime = startTime + (60 * 60 * 24)
      const newStartTime = "Next Week"
      const priceInWei = web3.toWei(1, 'ether')
      const amountForSale = 1000000

      const tokenSaleInitializedEvent = util.promisify(smartTokenInstance.TokenSaleInitialized)()
      await smartTokenInstance.initializeTokenSale(startTime, endTime, priceInWei, amountForSale)
      return tokenSaleInitializedEvent.then( () => {
        smartTokenInstance.updateStartTime(newStartTime, {from: owner})
        .then(() => {
          assert(false);
        }).catch(( ) => {
          return assert(true)
        });
      })
    });

    it("It should not allow an owner to update the token sale endTime to negative", async () => {
      const startTime = Date.now() / 1000
      const endTime = startTime + (60 * 60 * 24)
      const newEndTime = -100
      const priceInWei = web3.toWei(1, 'ether')
      const amountForSale = 1000000

      const tokenSaleInitializedEvent = util.promisify(smartTokenInstance.TokenSaleInitialized)()
      await smartTokenInstance.initializeTokenSale(startTime, endTime, priceInWei, amountForSale)
      return tokenSaleInitializedEvent.then( () => {
        smartTokenInstance.updateEndTime(newEndTime, {from:  owner})
        .then(() => {
          assert(false);
        }).catch(( ) => {
          assert(true)
          smartTokenInstance.saleEndTime().then((currentEndTime) => {
            return assert(Math.floor(endTime) != Math.floor(currentEndTime))
          })
        });
      })
    });
  
    it("It should not allow an owner to update the token sale endTime to a string", async () => {
      const startTime = Date.now() / 1000
      const endTime = startTime + (60 * 60 * 24)
      const newEndTime = "Next Week"
      const priceInWei = web3.toWei(1, 'ether')
      const amountForSale = 1000000

      const tokenSaleInitializedEvent = util.promisify(smartTokenInstance.TokenSaleInitialized)()
      await smartTokenInstance.initializeTokenSale(startTime, endTime, priceInWei, amountForSale)
      return tokenSaleInitializedEvent.then( () => {
        smartTokenInstance.updateEndTime(newEndTime, {from: owner})
        .then(() => {
          assert(false);
        }).catch(( ) => {
          return assert(true)
        });
      })
    });
  })
})