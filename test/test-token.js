const SmartToken = artifacts.require("SmartToken");
const Logger = artifacts.require("Logger");

contract('SmartToken', function () {
  const owner = web3.eth.accounts[0] 
  const nonOwner = web3.eth.accounts[1]
  let loggerInstance

  before(async () => {

  })

  beforeEach(async () => {
    loggerInstance = await Logger.deployed()
  })

  describe("Should test the smart token", function() {
    
    // TODO test issue(), destroy(), transfer(), transferFrom() and their negative cases
    
    // TODO check that he event was emitted on creation
    it("It should create the smart token.", async function () {
      
      const initialTokenName = 'test'
      const initialTokenSymbol = 'test'
      const initialTokenVersion = 'version'
      const initialTokenDecimals = 18

      let token = await SmartToken.new(initialTokenName, 12345, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner);

      let name = await token.name.call();
      let symbol = await token.symbol.call();
      let decimals = await token.decimals.call();
      let version = await token.version.call();

      // TODO missing totalSupply, etc
      assert.equal(name, initialTokenName);
      assert.equal(symbol, initialTokenSymbol);   
      assert.equal(decimals, initialTokenDecimals);
      assert.equal(version, initialTokenVersion);
    })

    it("It should allow the owner to enable/disable the transfer method", async function () {
      const initialTokenName = 'test'
      const initialTokenSymbol = 'test'
      const initialTokenVersion = 'version'
      const initialTokenDecimals = 18
      
      loggerInstance = await Logger.deployed()
      
      let token = await SmartToken.new(initialTokenName, 12345, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner);
      
      await token.disableTransfers(true);

      let transfersEnabled = await token.transfersEnabled.call({ from: owner });  
      assert.equal(transfersEnabled, false);
      
      await token.disableTransfers(false);

      transfersEnabled = await token.transfersEnabled.call({ from: owner });
      assert.equal(transfersEnabled, true);
    })

    // TODO verify this works
    it("It should not allow a non-owner to enable/disable the transfer method", async function () {
      
      const initialTokenName = 'test'
      const initialTokenSymbol = 'test'
      const initialTokenVersion = 'version'
      const initialTokenDecimals = 18

      let token = await SmartToken.new(initialTokenName, 12345, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner);
      
      let transfersEnabled = await token.transfersEnabled.call();        
      assert.equal(transfersEnabled, true);
      
      try {
        await token.disableTransfers(true, { from: nonOwner });  
      } catch (error) {
        assert(true);
      }

      transfersEnabled = await token.transfersEnabled.call();        
      assert.equal(transfersEnabled, true);
      
      try {
        await token.disableTransfers(false, { from: nonOwner });  
      } catch (error) {
        assert(true);
        transfersEnabled = await token.transfersEnabled.call();        
        assert.equal(transfersEnabled, true);
        return;
      }
      
      transfersEnabled = await token.transfersEnabled.call();
      
      assert.equal(transfersEnabled, true);
    })

  })
})