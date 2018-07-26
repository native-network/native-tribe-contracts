const SmartToken = artifacts.require("SmartToken");

contract('SmartToken', function () {
  const owner = web3.eth.accounts[0]
  const nonOwner = web3.eth.accounts[1]

  it("It should create the smart token.", async function () {
    
    const initialTokenName = 'test'
    const initialTokenSymbol = 'test'
    const initialTokenVersion = 'version'
    const initialTokenDecimals = 18
    const LoggerContractAddress =  '123'

    let token = await SmartToken.new(initialTokenName, 12345, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner, LoggerContractAddress);

    let name = await token.name.call();
    let symbol = await token.symbol.call();
    let decimals = await token.decimals.call();
    let version = await token.version.call();

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
    const LoggerContractAddress =  '123'

    let token = await SmartToken.new(initialTokenName, 12345, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner, LoggerContractAddress);

    
    await token.disableTransfers(true);

    let transfersEnabled = await token.transfersEnabled.call({ from: owner });  
    assert.equal(transfersEnabled, false);
    
    await token.disableTransfers(false);

    transfersEnabled = await token.transfersEnabled.call({ from: owner });
    assert.equal(transfersEnabled, true);
  })

  it("It should not allow a non-owner to enable/disable the transfer method", async function () {
    
    const initialTokenName = 'test'
    const initialTokenSymbol = 'test'
    const initialTokenVersion = 'version'
    const initialTokenDecimals = 18

    const LoggerContractAddress =  '123'

    let token = await SmartToken.new(initialTokenName, 12345, initialTokenDecimals, initialTokenSymbol, initialTokenVersion, owner, LoggerContractAddress);
    
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