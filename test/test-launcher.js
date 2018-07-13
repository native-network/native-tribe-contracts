const TribeLauncher = artifacts.require("TribeLauncher");

contract('SmartToken', function () {

  // TODO write all the tests
  it("It should launch a new tribe contract", async function () {
    
    const sender = web3.eth.accounts[0]

    const tribeLauncherInstance = await TribeLauncher.deployed()
    
    const result = await tribeLauncherInstance.launchTribe(123, 456, 789)
    
    console.log('result', result)
    
    assert(true)
  })


})