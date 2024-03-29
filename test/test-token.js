const SmartToken = artifacts.require("SmartToken")
const Logger = artifacts.require("Logger")

contract('SmartToken', function () {

  const owner = web3.eth.accounts[0] 
  const nonOwner = web3.eth.accounts[1]
  const user = web3.eth.accounts[2]

  describe("Should test the smart token", function() {
        
    it("It should create the smart token.", async function () {

      const initialTotalSupply = 12345
      const initialTokenName = 'test'
      const initialTokenSymbol = 'test'
      const initialTokenVersion = 'version'
      const initialTokenDecimals = 18

      let token = await SmartToken.new(initialTokenName, initialTotalSupply, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner)

      let totalSupply = await token.totalSupply.call()
      let name = await token.name.call()
      let symbol = await token.symbol.call()
      let decimals = await token.decimals.call()
      let version = await token.version.call()

      assert.equal(totalSupply, initialTotalSupply)
      assert.equal(name, initialTokenName)
      assert.equal(symbol, initialTokenSymbol)   
      assert.equal(decimals, initialTokenDecimals)
      assert.equal(version, initialTokenVersion)
    })

    it("It should issue tokens as the owner.", async function () {

      const initialTotalSupply = 12345
      const initialTokenName = 'test'
      const initialTokenSymbol = 'test'
      const initialTokenVersion = 'version'
      const initialTokenDecimals = 18

      let token = await SmartToken.new(initialTokenName, initialTotalSupply, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner)
      let totalSupply = await token.totalSupply.call()
      let newlyIssued = 100
      await token.issue(owner, newlyIssued, {from: owner})
      let finalTotalSupply = await token.totalSupply.call()
      assert( totalSupply.add(newlyIssued).toString() === finalTotalSupply.toString())
    })

    it("It should fail to issue tokens as the non-owner.", async function () {

      const initialTotalSupply = 12345
      const initialTokenName = 'test'
      const initialTokenSymbol = 'test'
      const initialTokenVersion = 'version'
      const initialTokenDecimals = 18

      let token = await SmartToken.new(initialTokenName, initialTotalSupply, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner)
      let totalSupply = await token.totalSupply.call()
      let newlyIssued = 100
      try {
        await token.issue(owner, newlyIssued, {from: nonOwner})        
      } catch (error) {
        let finalTotalSupply = await token.totalSupply.call()
        assert( totalSupply.add(newlyIssued).toString() != finalTotalSupply.toString())
        return assert( totalSupply.toString() === finalTotalSupply.toString())
      }
      assert(false)
    })

    it("It should destroy tokens as the owner.", async function () {

      const initialTotalSupply = 12345
      const initialTokenName = 'test'
      const initialTokenSymbol = 'test'
      const initialTokenVersion = 'version'
      const initialTokenDecimals = 18

      let token = await SmartToken.new(initialTokenName, initialTotalSupply, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner)
      let totalSupply = await token.totalSupply.call()
      let newlyDestroyed = 100
      await token.destroy(owner, newlyDestroyed, {from: owner})        
      let finalTotalSupply = await token.totalSupply.call()
      assert( totalSupply.sub(newlyDestroyed).toString() === finalTotalSupply.toString())
    })

    it("It should destory to issue tokens as the non-owner.", async function () {

      const initialTotalSupply = 12345
      const initialTokenName = 'test'
      const initialTokenSymbol = 'test'
      const initialTokenVersion = 'version'
      const initialTokenDecimals = 18

      let token = await SmartToken.new(initialTokenName, initialTotalSupply, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner)
      let totalSupply = await token.totalSupply.call()
      let newlyDestroyed = 100
      try {
        await token.destroy(owner, newlyDestroyed, {from: nonOwner})        
      } catch (error) {
        let finalTotalSupply = await token.totalSupply.call()
        assert( totalSupply.sub(newlyDestroyed).toString() != finalTotalSupply.toString())
        return assert( totalSupply.toString() === finalTotalSupply.toString())
      }
      assert(false)
    })

    it("It should transfer tokens as the owner.", async function () {

      const initialTotalSupply = 12345
      const initialTokenName = 'test'
      const initialTokenSymbol = 'test'
      const initialTokenVersion = 'version'
      const initialTokenDecimals = 18

      let token = await SmartToken.new(initialTokenName, initialTotalSupply, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner)
      let balance = await token.balanceOf(owner)

      let transferAmount = balance

      await token.transfer(nonOwner, transferAmount, {from: owner})
      
      let newOwnerBalance = await token.balanceOf(owner)
      let newNonOwnerBalance = await token.balanceOf(nonOwner)

      assert( newNonOwnerBalance.toString() === transferAmount.toString() )
      assert( newOwnerBalance.toString() === "0" )
    })

    it("It should fail to transfer tokens as the non-owner.", async function () {

      const initialTotalSupply = 12345
      const initialTokenName = 'test'
      const initialTokenSymbol = 'test'
      const initialTokenVersion = 'version'
      const initialTokenDecimals = 18

      let token = await SmartToken.new(initialTokenName, initialTotalSupply, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner)
      let transferAmount = await token.balanceOf(owner)

      await token.transfer(nonOwner, transferAmount+100, {from: nonOwner})
      let newOwnerBalance = await token.balanceOf(owner)
      newNonOwnerBalance = await token.balanceOf(nonOwner)

      assert( newOwnerBalance.toString() === transferAmount.toString() )
      return assert( newNonOwnerBalance.toString() === "0" )        
    })

    it("It should transferFrom tokens as the owner.", async function () {

      const initialTotalSupply = 12345
      const initialTokenName = 'test'
      const initialTokenSymbol = 'test'
      const initialTokenVersion = 'version'
      const initialTokenDecimals = 18

      let token = await SmartToken.new(initialTokenName, initialTotalSupply, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner)
      let balance = await token.balanceOf(owner)
      let transferAmount = balance
      await token.approve(owner, transferAmount, {from: owner})
      await token.transferFrom(owner, nonOwner, transferAmount, {from: owner})
      
      let newOwnerBalance = await token.balanceOf(owner)
      let newNonOwnerBalance = await token.balanceOf(nonOwner)

      assert( newNonOwnerBalance.toString() === transferAmount.toString() )
      assert( newOwnerBalance.toString() === "0" )
    })

    it("It should fail to transferFrom tokens as the non-owner.", async function () {

      const initialTotalSupply = 12345
      const initialTokenName = 'test'
      const initialTokenSymbol = 'test'
      const initialTokenVersion = 'version'
      const initialTokenDecimals = 18

      let token = await SmartToken.new(initialTokenName, initialTotalSupply, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner)
      let balance = await token.balanceOf(owner)

      let transferAmount = balance

      await token.approve(nonOwner, transferAmount, {from: nonOwner})
      await token.transferFrom(owner, nonOwner, transferAmount, {from: nonOwner})
      let newOwnerBalance = await token.balanceOf(owner)
      let newNonOwnerBalance = await token.balanceOf(nonOwner)
      assert( newOwnerBalance.toString() === transferAmount.toString() )
      assert( newNonOwnerBalance.toString() === "0" )
    })
    
    it("It should allow the owner to enable/disable the transfer method", async function () {

      const initialTokenName = 'test'
      const initialTokenSymbol = 'test'
      const initialTokenVersion = 'version'
      const initialTokenDecimals = 18
      
      loggerInstance = await Logger.deployed()
      
      let token = await SmartToken.new(initialTokenName, 12345, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner)
      
      await token.disableTransfers(true)

      let transfersEnabled = await token.transfersEnabled.call({ from: owner })  
      assert.equal(transfersEnabled, false)
      
      await token.disableTransfers(false)

      transfersEnabled = await token.transfersEnabled.call({ from: owner })
      assert.equal(transfersEnabled, true)
    })

    it("It should not allow a non-owner to enable/disable the transfer method", async function () {
      
      const initialTokenName = 'test'
      const initialTokenSymbol = 'test'
      const initialTokenVersion = 'version'
      const initialTokenDecimals = 18

      let token = await SmartToken.new(initialTokenName, 12345, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner)
      
      let transfersEnabled = await token.transfersEnabled.call()        
      assert.equal(transfersEnabled, true)
      
      try {
        await token.disableTransfers(true, { from: nonOwner })  
      } catch (error) {
        assert(true)
      }

      transfersEnabled = await token.transfersEnabled.call()        
      assert.equal(transfersEnabled, true)
      
      try {
        await token.disableTransfers(false, { from: nonOwner })  
      } catch (error) {
        assert(true)
        transfersEnabled = await token.transfersEnabled.call()        
        assert.equal(transfersEnabled, true)
        return
      }
      
      transfersEnabled = await token.transfersEnabled.call()      
      assert.equal(transfersEnabled, true)
    })

    it("It should allow the owner to call withdrawToken to retrieve erc20 tokens stuck on the contract", async function () {

      const initialTotalSupply = 12345
      const initialTokenName = 'test'
      const initialTokenSymbol = 'test'
      const initialTokenVersion = 'version'
      const initialTokenDecimals = 18

      let token = await SmartToken.new(initialTokenName, initialTotalSupply, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner)
      let newlyIssued = 100
      
      // issue some tokens to the smart contract
      await token.issue(user, newlyIssued, {from: owner})
      
      await token.transfer(token.address, newlyIssued, {from: user})

      const contractBalanceBefore = await token.balanceOf(token.address) 
      const ownerBalanceBefore = await token.balanceOf(owner)
      
      // withdraw them from the smart contract
      await token.withdrawToken(token.address, newlyIssued, {from: owner})

      const ownerBalanceAfter = await token.balanceOf(owner)
      assert(ownerBalanceAfter.equals(contractBalanceBefore.plus(ownerBalanceBefore)))      
    })

    it("It should fail if a non owner calls withdrawToken", async function () {

      const initialTotalSupply = 12345
      const initialTokenName = 'test'
      const initialTokenSymbol = 'test'
      const initialTokenVersion = 'version'
      const initialTokenDecimals = 18

      let token = await SmartToken.new(initialTokenName, initialTotalSupply, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner)
      let newlyIssued = 100
      // withdraw them from the smart contract
      try {
        await token.withdrawToken(token.address, newlyIssued, {from: nonOwner})
      } catch(err) {
        return assert(true)
      }
      assert(false)
    })



        it("It should fail to transfer tokens to account 0x0", async function () {
      
              const initialTotalSupply = 12345
              const initialTokenName = 'test'
              const initialTokenSymbol = 'test'
              const initialTokenVersion = 'version'
              const initialTokenDecimals = 18
        
              let token = await SmartToken.new(initialTokenName, initialTotalSupply, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner)
              let balance = await token.balanceOf(owner)
        
              let transferAmount = balance
              let thisNonOwner = "0x0"
              await token.transfer(thisNonOwner, transferAmount, {from: owner})
        
              let newOwnerBalance = await token.balanceOf(owner)
              let newNonOwnerBalance = await token.balanceOf(thisNonOwner)
              assert( newNonOwnerBalance.toString() === "0" )
              assert( newOwnerBalance.toString() === balance.toString() )
            })
    
        it("It should fail to transfer tokens to account 0", async function () {
      
              const initialTotalSupply = 12345
              const initialTokenName = 'test'
              const initialTokenSymbol = 'test'
              const initialTokenVersion = 'version'
              const initialTokenDecimals = 18
        
              let token = await SmartToken.new(initialTokenName, initialTotalSupply, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner)
              let balance = await token.balanceOf(owner)
        
              let transferAmount = balance
              let thisNonOwner = "0"
              await token.transfer(thisNonOwner, transferAmount, {from: owner})
        
              let newOwnerBalance = await token.balanceOf(owner)
              let newNonOwnerBalance = await token.balanceOf(thisNonOwner)
              assert( newNonOwnerBalance.toString() === "0" )
              assert( newOwnerBalance.toString() === balance.toString() )
            })

    it("It should fail to transferFrom tokens as the owner to a 0x0 address", async function () {
      
              const initialTotalSupply = 12345
              const initialTokenName = 'test'
              const initialTokenSymbol = 'test'
              const initialTokenVersion = 'version'
              const initialTokenDecimals = 18
        
              let token = await SmartToken.new(initialTokenName, initialTotalSupply, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner)
              let balance = await token.balanceOf(owner)
              let transferAmount = balance
              let thisNonOwner = "0x0"
        
              await token.approve(owner, transferAmount, {from: owner})
              await token.transferFrom(owner, thisNonOwner, transferAmount, {from: owner})
        
              let newOwnerBalance = await token.balanceOf(owner)
              let newNonOwnerBalance = await token.balanceOf(thisNonOwner)
        
              assert( newNonOwnerBalance.toString() === "0")
              assert( newOwnerBalance.toString() === balance.toString() )
            })
    
        it("It should fail to transferFrom tokens as the owner to a 0 address", async function () {
      
              const initialTotalSupply = 12345
              const initialTokenName = 'test'
              const initialTokenSymbol = 'test'
              const initialTokenVersion = 'version'
              const initialTokenDecimals = 18
        
              let token = await SmartToken.new(initialTokenName, initialTotalSupply, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner)
              let balance = await token.balanceOf(owner)
              let transferAmount = balance
              let thisNonOwner = "0x0"
        
              await token.approve(owner, transferAmount, {from: owner})
              await token.transferFrom(owner, thisNonOwner, transferAmount, {from: owner})
        
              let newOwnerBalance = await token.balanceOf(owner)
              let newNonOwnerBalance = await token.balanceOf(thisNonOwner)
        
              assert( newNonOwnerBalance.toString() === "0")
              assert( newOwnerBalance.toString() === balance.toString() )
            })
  })
})