const TribeLauncher = artifacts.require("TribeLauncher");
const Tribe = artifacts.require("Tribe");
const Logger = artifacts.require("Logger");
const SmartToken = artifacts.require("SmartToken");
const SmartTokenFactory = artifacts.require("SmartTokenFactory");
const TribeStorageFactory = artifacts.require("TribeStorageFactory");
const Registrar = artifacts.require("Registrar");
const RegistrarFactory = artifacts.require("RegistrarFactory");
const TribeFactory = artifacts.require("TribeFactory");


/* 
Upgrade Tribe Example:

1) Launch a tribe
2) Create multiple tasks and projects across multiple users
3) Create multiple escrows

4) launch a new tribe contract with different functions
5) attach the tribe to the previous tribe account
6) test that everything works

Upgrade Logger Example:

1) Launch new tribe
2) Launch new Logger
3) Attach logger to tribe
4) test that it still works

 */

/*
contract('Registrar', function () {

  beforeEach(async () => {

  })
  describe("It should test upgrading a tribe contract", function() {

    const sender = web3.eth.accounts[0]
    const curator = web3.eth.accounts[0]
    const voteController = curator

    it("It should test upgrading a tribe contract", async function () {
      
      const minimumStakingRequirement = 10
      const lockupPeriod = 0
      const launchUuid = 123
      const totalSupply = 1000000
      const tokenDecimals = 18
      const initialTribe = await launchInitialTestTribe(minimumStakingRequirement, lockupPeriod, launchUuid, totalSupply, tokenDecimals)
      const initialTribeInstance = initialTribe.launchedTribeInstance
      
      const initialTribeStorageAddress = await initialTribeInstance.tribeStorage()
      const initialTribeTokenAddress = await initialTribeInstance.tribeTokenInstance()
      const initialNativeTokenAddress = await initialTribeInstance.nativeTokenInstance()

      
      
      
      
      
      
      
      
      
      
      
      
      
      
      // Launch an upgraded tribe.  In this case we do not care about the new tribe account or token
      // We keep them from the initial tribe
      const upgradedTribe = await launchUpgradedTestTribe(minimumStakingRequirement, lockupPeriod, launchUuid, totalSupply, tokenDecimals)
      const upgradedTribeInstance = upgradedTribe.launchedTribeInstance
      upgradedTribeInstance.setTribeStorage(initialTribeStorageAddress)
      upgradedTribeInstance.setTokenAddresses(initialTribeTokenAddress, initialNativeTokenAddress)
      
      
    })
    
  })
  
  async function launchInitialTestTribe(minimumStakingRequirement, lockupPeriod, launchUuid, totalSupply, tokenDecimals) {
    
    // The tribe launcher needs momentary access to the logger so it can permission the tribe to use it
    await loggerInstance.transferOwnershipNow(tribeLauncherInstance.address)

    await tribeLauncherInstance.launchTribe(
      [launchUuid, minimumStakingRequirement, lockupPeriod, totalSupply, tokenDecimals],
      [curator, nativeTokenInstance.address, voteController, loggerInstance.address, smartTokenFactoryInstance.address, tribeStorageFactoryInstance.address, registrarFactoryInstance.address, tribeFactoryInstance.address],
      'Initial Test Tribe',
      'TT1',
      '1.0', {from: sender})

    const launchedTribeCount = await tribeLauncherInstance.launchedTribeCount()
    const launchedTribeRegistrarAddress = await tribeLauncherInstance.launchedTribeRegistrars(launchedTribeCount - 1)

    const launchedTribeRegistrar = await Registrar.at(launchedTribeRegistrarAddress)
    const launchedTribeAddresses = await launchedTribeRegistrar.getAddresses.call()
    const launchedTribeInstance = await Tribe.at(launchedTribeAddresses.slice(-1)[0])
    
    return {launchedTribeRegistrar, launchedTribeInstance}
  }

  async function launchUpgradedTestTribe(minimumStakingRequirement, lockupPeriod, launchUuid, totalSupply, tokenDecimals) {
    
    // The tribe launcher needs momentary access to the logger so it can permission the tribe to use it
    await loggerInstance.transferOwnershipNow(tribeLauncherInstance.address)

    await tribeLauncherInstance.launchTribe(
      [launchUuid, minimumStakingRequirement, lockupPeriod, totalSupply, tokenDecimals],
      [curator, nativeTokenInstance.address, voteController, loggerInstance.address, smartTokenFactoryInstance.address, tribeStorageFactoryInstance.address, registrarFactoryInstance.address, tribeFactoryInstance.address],
      'Upgraded Test Tribe',
      'TT2',
      '2.0', {from: sender})

    const launchedTribeCount = await tribeLauncherInstance.launchedTribeCount()
    const launchedTribeRegistrarAddress = await tribeLauncherInstance.launchedTribeRegistrars(launchedTribeCount - 1)

    const launchedTribeRegistrar = await Registrar.at(launchedTribeRegistrarAddress)
    const launchedTribeAddresses = await launchedTribeRegistrar.getAddresses.call()
    const launchedTribeInstance = await Tribe.at(launchedTribeAddresses.slice(-1)[0])

    return {launchedTribeRegistrar, launchedTribeInstance}
  }
  
})

*/