const TribeLauncher = artifacts.require("TribeLauncher");
const Tribe = artifacts.require("Tribe");
const Token = artifacts.require("SmartToken");

contract('TribeLauncher', function () {

  // TODO write all the tests
  it("It should launch a new tribe contract", async function () {
    
    const sender = web3.eth.accounts[0]
    const curator = web3.eth.accounts[0]

    const tokenInstance = await Token.deployed()
    
    const tribeLauncherInstance = await TribeLauncher.deployed()
    
    await tribeLauncherInstance.launchTribe(123, 456, 789, curator, tokenInstance.address, {from: sender})

    const launchedTribeCount = await tribeLauncherInstance.launchedCount()

    const launchedTribeAddress = await tribeLauncherInstance.launchedTribes(launchedTribeCount - 1)
    console.log('launchedTribeAddress', launchedTribeAddress)

    const launchedTribeInstance = await Tribe.at(launchedTribeAddress)

    const minimumStakingRequirement = await launchedTribeInstance.minimumStakingRequirement()
    const lockupPeriod = await launchedTribeInstance.lockupPeriodSeconds()
    
    console.log('minimumStakingRequirement', minimumStakingRequirement)
    console.log('lockupPeriod', lockupPeriod)
    
    assert(true)
  })


})