const SmartToken = artifacts.require("SmartToken")
const util = require('util')
const Bluebird = require('bluebird')


contract('SmartToken-sale', function () {

  const owner = web3.eth.accounts[0]
  const nonOwner = web3.eth.accounts[1]
  const beneficiary = web3.eth.accounts[2]
  let smartNativeTokenInstance  
  let smartCommunityTokenInstance

  beforeEach(async () => {

    const initialTokenName = 'test'
    const initialTokenSymbol = 'test'
    const initialTokenVersion = 'version'
    const initialTokenDecimals = 18
    const initialSupply = 10000000000
    smartNativeTokenInstance = await SmartToken.new(initialTokenName, initialSupply, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner)

    const initialCommunityTokenName = 'test_community'
    const initialCommunityTokenSymbol = 'test_community'
    const initialCommunityTokenVersion = 'version'
    const initialCommunityTokenDecimals = 18
    const initialCommunitySupply = 10000000000
              
    smartCommunityTokenInstance = await SmartToken.new(initialCommunityTokenName, initialCommunitySupply, initialCommunityTokenDecimals, initialCommunityTokenSymbol, initialCommunityTokenVersion, owner)
  })

  describe("It should test the token sale", function () {
    describe("It should test the tokenSale with native token", function () {
      it("It should allow a user to purchase tokens after the sale has been initialized with Native", async () => {
        
        // give some native tokens to buy community tokens with
        await smartNativeTokenInstance.issue(nonOwner, 10000000000, {from: owner})

        const startTime = Math.floor(Date.now() / 1000)
        const endTime = Math.floor(startTime + (60 * 60 * 24))
        const priceTokensPerNative = 1
        const amountForSale = 1000000
        const amountToSpend = 10
        const expectedPurchaseAmount = amountToSpend
        
        const tokenBalanceBefore = await smartNativeTokenInstance.balanceOf(nonOwner)
        const communityTokenBalanceBefore = await smartCommunityTokenInstance.balanceOf(nonOwner)
        const beneficiaryBalanceBefore = await smartNativeTokenInstance.balanceOf(beneficiary)
        
        try {
          await smartCommunityTokenInstance.initializeTokenSaleWithToken(startTime, endTime, priceTokensPerNative, amountForSale, beneficiary, smartNativeTokenInstance.address, {from: owner})
          await smartNativeTokenInstance.approve(smartCommunityTokenInstance.address, amountToSpend, {from: nonOwner})
          await smartCommunityTokenInstance.buyWithToken(smartNativeTokenInstance.address, amountToSpend, {from: nonOwner})
          const communityTokensPurchased = util.promisify(smartCommunityTokenInstance.TokensPurchased)()
          const tokenBalanceAfter = await smartNativeTokenInstance.balanceOf(nonOwner)
          const communityTokenBalanceAfter = await smartCommunityTokenInstance.balanceOf(nonOwner)
          const beneficiaryBalanceAfter = await smartNativeTokenInstance.balanceOf(beneficiary)
          return communityTokensPurchased.then(() => {
            assert(communityTokenBalanceAfter.equals(communityTokenBalanceBefore.plus(expectedPurchaseAmount)))
            assert(tokenBalanceAfter.equals(tokenBalanceBefore.minus(expectedPurchaseAmount)))
            return assert(beneficiaryBalanceAfter.equals(beneficiaryBalanceBefore.plus(expectedPurchaseAmount)))
          })
        } catch (error) {
          assert(false, error.toString())
        }
      })

      it("It should not allow a user to purchase with a token other than Native", async () => {
        const initialCommunityTokenName = 'Untrusted Token With Approve'
        const initialCommunityTokenSymbol = 'UTWA'
        const initialCommunityTokenVersion = '1.0'
        const initialCommunityTokenDecimals = 18
        const initialCommunitySupply = 10000000000

        const untrustedTokenInstance = await SmartToken.new(initialCommunityTokenName, initialCommunitySupply, initialCommunityTokenDecimals, initialCommunityTokenSymbol, initialCommunityTokenVersion, owner)
        // give some native tokens to buy community tokens with
        await smartNativeTokenInstance.issue(nonOwner, 10000000000, {from: owner})

        const startTime = Math.floor(Date.now() / 1000)
        const endTime = Math.floor(startTime + (60 * 60 * 24))
        const priceTokensPerNative = 1
        const amountForSale = 1000000
        const amountToSpend = 10

        try {
          await smartCommunityTokenInstance.initializeTokenSaleWithToken(startTime, endTime, priceTokensPerNative, amountForSale, beneficiary, smartNativeTokenInstance.address, {from: owner})
          await untrustedTokenInstance.approve(smartCommunityTokenInstance.address, amountToSpend, {from: nonOwner})

          try {
            await smartCommunityTokenInstance.buyWithToken(untrustedTokenInstance.address, amountToSpend, {from: nonOwner})
          } catch (error) {
            return assert(error.message.includes('revert'));
          }
        } catch (error) {
          assert(false, error.toString())
        }
      })

      it("It should allow the owner to initialize a token sale with Native where the price per Native is greater than 1 and allow nonOwner to purchase tokens with Native", async () => {
        // give some native tokens to buy community tokens with
        await smartNativeTokenInstance.issue(nonOwner, 100000, {from: owner})

        const startTime = Math.floor(Date.now() / 1000)
        const endTime = Math.floor(startTime + (60 * 60 * 24))
        const priceTokensPerNative = 100
        const amountForSale = 1000000
        const amountToSpend = 10
        const expectedPurchaseAmount = amountToSpend * priceTokensPerNative
        const tokenBalanceBefore = await smartNativeTokenInstance.balanceOf(nonOwner)
        const communityTokenBalanceBefore = await smartCommunityTokenInstance.balanceOf(nonOwner)
        try{

          await smartCommunityTokenInstance.initializeTokenSaleWithToken(startTime, endTime, priceTokensPerNative, amountForSale, beneficiary, smartNativeTokenInstance.address, {from: owner})
          await smartNativeTokenInstance.approve(smartCommunityTokenInstance.address, amountToSpend, {from: nonOwner})
          await smartCommunityTokenInstance.buyWithToken(smartNativeTokenInstance.address, amountToSpend, {from: nonOwner})

          const communityTokensPurchased = util.promisify(smartCommunityTokenInstance.TokensPurchased)()
          const tokenBalanceAfter = await smartNativeTokenInstance.balanceOf(nonOwner)
          const communityTokenBalanceAfter = await smartCommunityTokenInstance.balanceOf(nonOwner)

          return communityTokensPurchased.then(() => {
            assert(communityTokenBalanceAfter.equals(communityTokenBalanceBefore.plus(expectedPurchaseAmount)))
            assert(tokenBalanceAfter.equals(tokenBalanceBefore.minus(amountToSpend)))
          })

        } catch (error) {
          assert(false, error.toString())
        }
      })
    })
   
    it("It should allow the owner to initialize a token sale", async () => {

      const startTime = Math.floor(Date.now() / 1000)
      const endTime = Math.floor(startTime + (60 * 60 * 24))
      const price = web3.toWei(1, 'ether')
      const amountForSale = 1000000

      const tokenSaleInitializedEvent = util.promisify(smartNativeTokenInstance.TokenSaleInitialized)()
      await smartNativeTokenInstance.initializeTokenSale(startTime, endTime, price, amountForSale, beneficiary, { from: owner })

      return tokenSaleInitializedEvent.then(() => {
        return assert(true)
      }).catch( (err) => {
        return assert(false, err.toString())
      })
    })

    it("It should allow a user to purchase tokens after the sale has been initialized", async () => {

      const startTime = Math.floor(Date.now() / 1000)
      const endTime = Math.floor(startTime + (60 * 60 * 24))
      const priceInWei = web3.toWei(1, 'ether')
      const amountForSale = 1000000 * 1e18
      const amountToSpend = web3.toWei(1, 'ether')
      const expectedPurchaseAmount = (amountToSpend * 1e18) / priceInWei // Handle floating point roundoff errors?

      const TokensPurchased = util.promisify(smartNativeTokenInstance.TokensPurchased)()

      await smartNativeTokenInstance.initializeTokenSale(startTime, endTime, priceInWei, amountForSale,  beneficiary, { from: owner })

      const tokenBalanceBefore = await smartNativeTokenInstance.balanceOf(nonOwner)

      try {
        await Bluebird.promisify(web3.eth.sendTransaction)({
          from: nonOwner,
          to: smartNativeTokenInstance.address,
          value: amountToSpend,
          gas: 100000
        })
        return smartNativeTokenInstance.balanceOf(nonOwner).then((tokenBalanceAfter) => {
          return TokensPurchased.then(() => {
            return assert(tokenBalanceAfter.equals(tokenBalanceBefore.plus(expectedPurchaseAmount)))
          })
        })
      }
      catch(err) {
        return assert(false, err.toString())
      }
    })
    
    it("It should fail if trying to initialize a token sale more than once", async () => {

      const startTime = Math.floor(Date.now() / 1000)
      const endTime = Math.floor(startTime + (60 * 60 * 24))
      const price = web3.toWei(1, 'ether')
      const amountForSale = 1000000

      try {
        await smartNativeTokenInstance.initializeTokenSale(startTime, endTime, price, amountForSale, beneficiary, { from: owner })
        await smartNativeTokenInstance.initializeTokenSale(startTime, endTime, price, amountForSale, beneficiary, { from: owner })
      } catch(err) {
        return assert(true)
      }
      return assert(false)      
    })

    it("It should fail if trying to initialize a token sale from a non-owner account", async () => {

      const startTime = Math.floor(Date.now() / 1000)
      const endTime = Math.floor(startTime + (60 * 60 * 24))
      const price = web3.toWei(1, 'ether')
      const amountForSale = 1000000

      try {
        await smartNativeTokenInstance.initializeTokenSale(startTime, endTime, price, amountForSale, beneficiary, { from: nonOwner })
      } catch(err) {
        return assert(true)
      }
      return assert(false)
    })

    it("It should fail if attempting to purchase before the sale has been initialized", async () => {

      const amountToSpend = web3.toWei(10, 'ether')
      try {
        await Bluebird.promisify(web3.eth.sendTransaction)({
          from: nonOwner,
          to: smartNativeTokenInstance.address,
          value: amountToSpend,
          gas: 100000
        })
      } catch(err) {
        return assert(true)
      }
      return assert(false)
    })

    it("It should fail if attempting to purchase tokens before the sale start date", async () => {

      const startTime = Math.floor(Date.now() / 1000) + (60 * 60 * 24)
      const endTime = Math.floor(startTime + (60 * 60 * 24))
      const price = web3.toWei(1, 'ether')
      const amountForSale = 1000000
      const amountToSpend = web3.toWei(10, 'ether')
      
      await smartNativeTokenInstance.initializeTokenSale(startTime, endTime, price, amountForSale, beneficiary, { from: owner })

      try {
        await Bluebird.promisify(web3.eth.sendTransaction)({
          from: nonOwner,
          to: smartNativeTokenInstance.address,
          value: amountToSpend,
          gas: 100000
        })
      } catch(err) {
        return assert(true)
      }
      return assert(false)
    })

    it("It should fail if attempting to purchase tokens after the sale end date", async () => {

      const startTime = Math.floor(Date.now() / 1000) - (60 * 60 * 48)
      const endTime = Math.floor(startTime + (60 * 60 * 24))
      const price = web3.toWei(1, 'ether')
      const amountForSale = 1000000
      const amountToSpend = web3.toWei(10, 'ether')

      await smartNativeTokenInstance.initializeTokenSale(startTime, endTime, price, amountForSale, beneficiary, { from: owner })

      try {
        await Bluebird.promisify(web3.eth.sendTransaction)({
          from: nonOwner,
          to: smartNativeTokenInstance.address,
          value: amountToSpend,
          gas: 100000
        })
      } catch(err) {
        return assert(true)
      }
      return assert(false)
    })

    it("It should fail if attempting to purchase more tokens than are available for sale", async () => {

      const startTime = Math.floor(Date.now() / 1000)
      const endTime = Math.floor(startTime + (60 * 60 * 24))
      const price = web3.toWei(1, 'ether')
      const amountForSale = 1000000
      const amountToSpend = web3.toWei(10, 'ether') * amountForSale

      await smartNativeTokenInstance.initializeTokenSale(startTime, endTime, price, amountForSale, beneficiary, { from: owner })

      try {
        await Bluebird.promisify(web3.eth.sendTransaction)({
          from: nonOwner,
          to: smartNativeTokenInstance.address,
          value: amountToSpend,
          gas: 100000
        })
      } catch(err) {
        return assert(true)
      }
      return assert(false)
    })

    describe("Token Sale Update Functions", async () => {
     
      it("It should allow the owner to update the token sale startTime", async () => {

        const startTime = Math.floor(Date.now() / 1000)
        const newStartTime = Math.floor(Date.now() / 1000) + (60*60) // updated value
        const endTime = Math.floor(startTime + (60 * 60 * 24))
        const price = web3.toWei(1, 'ether')
        const amountForSale = 1000000

        const tokenSaleInitializedEvent = util.promisify(smartNativeTokenInstance.TokenSaleInitialized)()
        await smartNativeTokenInstance.initializeTokenSale(startTime, endTime, price, amountForSale, beneficiary, { from: owner })

        return tokenSaleInitializedEvent.then(async () => {
          await smartNativeTokenInstance.updateStartTime(newStartTime, {from: owner})
          return smartNativeTokenInstance.saleStartTime().then((currentStartTime) => {
            return assert(Math.floor(newStartTime) === Math.floor(currentStartTime))
          })
        })
      })

      it("It should not allow a non-owner to update the token sale startTime", async () => {

        const startTime = Math.floor(Date.now() / 1000)
        const newStartTime = Math.floor(Date.now() / 1000) + (60*60) // updated value
        const endTime = Math.floor(startTime + (60 * 60 * 24))
        const price = web3.toWei(1, 'ether')
        const amountForSale = 1000000

        const tokenSaleInitializedEvent = util.promisify(smartNativeTokenInstance.TokenSaleInitialized)()
        await smartNativeTokenInstance.initializeTokenSale(startTime, endTime, price, amountForSale, beneficiary, { from: owner })
        return tokenSaleInitializedEvent.then(() => {
          return smartNativeTokenInstance.updateStartTime(newStartTime, {from: nonOwner}).then(() => {
            return assert(false) // we should never be hitting this when a nonOwner calls this
          }).catch(() => {
            return smartNativeTokenInstance.saleStartTime().then((currentStartTime) => {
              if (Math.floor(startTime) === Math.floor( currentStartTime )) {
                return assert(true)
              } else {
                return assert(false)
              }
            })
          })
        })
      })

      it("It should allow an owner to update the token sale endTime", async () => {

        const startTime = Math.floor(Date.now() / 1000)
        const endTime = Math.floor(startTime + (60 * 60 * 24))
        const newEndTime = Math.floor(startTime + (60 * 60 * 24)) + (60*60)
        const price = web3.toWei(1, 'ether')
        const amountForSale = 1000000

        const tokenSaleInitializedEvent = util.promisify(smartNativeTokenInstance.TokenSaleInitialized)()
        await smartNativeTokenInstance.initializeTokenSale(startTime, endTime, price, amountForSale, beneficiary, { from: owner })

        return tokenSaleInitializedEvent.then(async () => {
          try {
            await smartNativeTokenInstance.updateEndTime(newEndTime, {from: owner})
            const currentEndTime = await smartNativeTokenInstance.saleEndTime()
            return assert(Math.floor(newEndTime) === Math.floor(currentEndTime))
          } catch (error) {
            assert(false)
          }
        })
      })

      it("It should not allow a non-owner to update the token sale endTime", async () => {

        const startTime = Math.floor(Date.now() / 1000)
        const endTime = Math.floor(startTime + (60 * 60 * 24))
        const newEndTime = Math.floor(startTime + (60 * 60 * 24)) + (60*60)
        const price = web3.toWei(1, 'ether')
        const amountForSale = 1000000

        const tokenSaleInitializedEvent = util.promisify(smartNativeTokenInstance.TokenSaleInitialized)()
        await smartNativeTokenInstance.initializeTokenSale(startTime, endTime, price, amountForSale, beneficiary, { from: owner })
        return tokenSaleInitializedEvent.then(() => {
          return smartNativeTokenInstance.updateEndTime(newEndTime, {from: nonOwner}).then(() => {
            return assert(false) // should not succeed with a nonOwner
          }).catch(() => {
            return smartNativeTokenInstance.saleEndTime().then((currentEndTime) => {
              return assert(Math.floor(endTime) === Math.floor(currentEndTime))
            })
          })
        })
      })
      
      it("It should allow an owner to update the token sale price", async () => {

        const startTime = Math.floor(Date.now() / 1000)
        const endTime = Math.floor(startTime + (60 * 60 * 24))
        const price = web3.toWei(1, 'ether')
        const newPrice = web3.toWei(100, 'ether')
        const amountForSale = 1000000

        const tokenSaleInitializedEvent = util.promisify(smartNativeTokenInstance.TokenSaleInitialized)()
        await smartNativeTokenInstance.initializeTokenSale(startTime, endTime, price, amountForSale, beneficiary, { from: owner })

        return tokenSaleInitializedEvent.then(() => {
          return smartNativeTokenInstance.updatePrice(newPrice, {from: owner}).then(() => {
            return assert(true)
          }).catch((err) => {
            return assert(false, err.toString())
          })
        })
      })

      it("It should allow an owner to update the token sale amount remaining", async () => {

        const startTime = Math.floor(Date.now() / 1000)
        const endTime = Math.floor(startTime + (60 * 60 * 24))
        const price = web3.toWei(1, 'ether')
        const amountForSale = 1000000
        const newAmountRemainingForSale = 100

        const tokenSaleInitializedEvent = util.promisify(smartNativeTokenInstance.TokenSaleInitialized)()
        await smartNativeTokenInstance.initializeTokenSale(startTime, endTime, price, amountForSale, beneficiary, { from: owner })

        return tokenSaleInitializedEvent.then(async () => {
          await smartNativeTokenInstance.updateAmountRemainingForSale(newAmountRemainingForSale, {from: owner})
          return smartNativeTokenInstance.amountRemainingForSale().then((currentAmountRemainingForSale) => {
            return assert(newAmountRemainingForSale.toString() === currentAmountRemainingForSale.toString())
          })
        }).catch( (err) => {
          return assert(false, err.toString())
        })
      })

      it("It should not allow the owner to update the token sale amount remaining to negative", async () => {

        const startTime = Math.floor(Date.now() / 1000)
        const endTime = Math.floor(startTime + (60 * 60 * 24))
        const price = web3.toWei(1, 'ether')
        const amountForSale = 1000000
        const newAmountRemainingForSale = -100

        const tokenSaleInitializedEvent = util.promisify(smartNativeTokenInstance.TokenSaleInitialized)()
        await smartNativeTokenInstance.initializeTokenSale(startTime, endTime, price, amountForSale, beneficiary, { from: owner })

        return tokenSaleInitializedEvent.then(async () => {
          await smartNativeTokenInstance.updateAmountRemainingForSale(newAmountRemainingForSale, {from: owner})
          return smartNativeTokenInstance.amountRemainingForSale().then(() => {
            return assert(false)
          }).catch(() => {
            return assert(true)
          })
        })
      })
      
      it("It should not allow an owner to update the token sale startTime to a string", async () => {

        const startTime = Math.floor(Date.now() / 1000)
        const endTime = Math.floor(startTime + (60 * 60 * 24))
        const newStartTime = "Next Week"
        const price = web3.toWei(1, 'ether')
        const amountForSale = 1000000

        const tokenSaleInitializedEvent = util.promisify(smartNativeTokenInstance.TokenSaleInitialized)()
        await smartNativeTokenInstance.initializeTokenSale(startTime, endTime, price, amountForSale, beneficiary, { from: owner })
        return tokenSaleInitializedEvent.then(() => {
          return smartNativeTokenInstance.updateStartTime(newStartTime, {from: owner}).then(() => {
            return assert(false)
          }).catch(() => {
            return assert(true)
          })
        })
      })

      it("It should not allow an owner to update the token sale endTime to negative", async () => {

        const startTime = Math.floor(Date.now() / 1000)
        const endTime = Math.floor(startTime + (60 * 60 * 24))
        const newEndTime = -100
        const price = web3.toWei(1, 'ether')
        const amountForSale = 1000000

        const tokenSaleInitializedEvent = util.promisify(smartNativeTokenInstance.TokenSaleInitialized)()
        await smartNativeTokenInstance.initializeTokenSale(startTime, endTime, price, amountForSale, beneficiary, { from: owner })
        return tokenSaleInitializedEvent.then(() => {
          return smartNativeTokenInstance.updateEndTime(newEndTime, {from:  owner}).then(() => {
            return assert(false)
          }).catch(() => {
            return smartNativeTokenInstance.saleEndTime().then((currentEndTime) => {
              return assert(Math.floor(endTime) != Math.floor(currentEndTime))
            })
          })
        })
      })

      it("It should not allow an owner to update the token sale endTime to a string", async () => {

        const startTime = Math.floor(Date.now() / 1000)
        const endTime = Math.floor(startTime + (60 * 60 * 24))
        const newEndTime = "Next Week"
        const price = web3.toWei(1, 'ether')
        const amountForSale = 1000000

        const tokenSaleInitializedEvent = util.promisify(smartNativeTokenInstance.TokenSaleInitialized)()
        await smartNativeTokenInstance.initializeTokenSale(startTime, endTime, price, amountForSale, beneficiary, { from: owner })
        return tokenSaleInitializedEvent.then(() => {
          return smartNativeTokenInstance.updateEndTime(newEndTime, {from: owner}).then(() => {
            assert(false)
          }).catch(() => {
            return assert(true)
          })
        })
      })

    })
  })
})