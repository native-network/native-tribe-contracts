const TribeLauncher = artifacts.require("TribeLauncher");
const UpgradedTribeLauncher = artifacts.require("UpgradedTribeLauncher");
const Tribe = artifacts.require("Tribe");
const UpgradedTribe = artifacts.require("UpgradedTribe");
const Logger = artifacts.require("Logger");
const SmartToken = artifacts.require("SmartToken");
const SmartTokenFactory = artifacts.require("SmartTokenFactory");
const TribeStorageFactory = artifacts.require("TribeStorageFactory");
const TribeStorage = artifacts.require("TribeStorage");

const Registrar = artifacts.require("Registrar");
const RegistrarFactory = artifacts.require("RegistrarFactory");
const TribeFactory = artifacts.require("TribeFactory");
const UpgradedTribeFactory = artifacts.require("UpgradedTribeFactory");


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


contract('Upgrades Testing', function (accounts) {

  const sender = web3.eth.accounts[0]
  const curator = web3.eth.accounts[0]
  const voteController = curator
  const user1 = web3.eth.accounts[1]
  const user2 = web3.eth.accounts[2]
  
  let tribeLauncherInstance
  let upgradedTribeLauncherInstance
  let nativeTokenInstance
  let loggerInstance
  let smartTokenFactoryInstance
  let tribeStorageFactoryInstance
  let registrarFactoryInstance
  let tribeFactoryInstance
  let upgradedTribeFactoryInstance
  
  beforeEach(async () => {
    loggerInstance = await Logger.deployed()
    nativeTokenInstance = await SmartToken.deployed()
    tribeLauncherInstance = await TribeLauncher.deployed()
    upgradedTribeLauncherInstance = await UpgradedTribeLauncher.deployed()
    
    smartTokenFactoryInstance = await SmartTokenFactory.deployed()
    tribeStorageFactoryInstance = await TribeStorageFactory.deployed()
    tribeStorageFactoryInstance = await TribeStorageFactory.deployed()
    registrarFactoryInstance = await RegistrarFactory.deployed()
    tribeFactoryInstance = await TribeFactory.deployed()
    upgradedTribeFactoryInstance = await UpgradedTribeFactory.deployed()
    
  })
  
  describe.only("It should test upgrading a tribe contract", function() {

    it("It should test upgrading a tribe contract", async function () {
      
      const minimumStakingRequirement = 10
      const lockupPeriod = 0
      const launchUuid = 123
      const totalSupply = 1000000
      const tokenDecimals = 18
      const initialTribe = await launchInitialTestTribe(minimumStakingRequirement, lockupPeriod, launchUuid, totalSupply, tokenDecimals, {from: curator})
      const initialTribeInstance = initialTribe.launchedTribeInstance
      
      const initialTribeStorageAddress = await initialTribeInstance.tribeStorage()
      const initialTribeStorageInstance = TribeStorage.at(initialTribeStorageAddress)
      
      const initialTribeTokenAddress = await initialTribeInstance.tribeTokenInstance()
      const initialNativeTokenAddress = await initialTribeInstance.nativeTokenInstance()
      
      const tribeTokenInstance = SmartToken.at(initialTribeTokenAddress)
      const nativeTokenInstance = SmartToken.at(initialNativeTokenAddress)
      
      // TODO Do some staking AND test that it worked.  (FIRST WE HAVE TO FIX THE STAKING CODE)!!!
      
      // give our users some tribe tokens so they can join the tribes
      await tribeTokenInstance.transfer(user1, 1000, {from: curator})
      await tribeTokenInstance.transfer(user2, 1000, {from: curator})

      initialTribeStorageInstance.stake

      // Fund the dev fund so we can make some tasks and projects
      await nativeTokenInstance.transfer(initialTribeStorageAddress, 1000000, {from: curator})

      // make some tasks and projects
      const task1Id = 1
      const task2Id = 2
      const project1Id = 3
      const project2Id = 4
      
      await initialTribeInstance.createNewTask(task1Id, 100, {from: curator})
      await initialTribeInstance.createNewTask(task2Id, 140, {from: curator})
      await initialTribeInstance.createNewProject(project1Id, 310, user1, {from: curator})
      await initialTribeInstance.createNewProject(project2Id, 805, user2, {from: curator})
      
      
      // Read the project and task escrow amounts we set in the initial tribe
      const task1Amount = await initialTribeStorageInstance.escrowedTaskBalances(task1Id)
      const task2Amount = await initialTribeStorageInstance.escrowedTaskBalances(task2Id)
      const project1Amount = await initialTribeStorageInstance.escrowedProjectBalances(project1Id)
      const project2Amount = await initialTribeStorageInstance.escrowedProjectBalances(project2Id)

      const project1Payee = await initialTribeStorageInstance.escrowedProjectPayees(project1Id)
      const project2Payee = await initialTribeStorageInstance.escrowedProjectPayees(project2Id)
      
      // Launch an upgraded tribe that include a new function and argument to its constructor
      // In this case we do not care about the new tribe account or token since we are keeping them from the original tribe
      // We keep them from the initial tribe
      
      const upgradedTribe = await launchUpgradedTestTribe(minimumStakingRequirement, lockupPeriod, launchUuid, totalSupply, tokenDecimals, true)
      
      const upgradedTribeInstance = upgradedTribe.launchedTribeInstance
    
      // Give the new tribe ownership of the old account
      await initialTribeInstance.setTribeStorageOwner(upgradedTribeInstance.address, {from: curator})
      // Attach the old account to the new tribe
      await upgradedTribeInstance.setTribeStorage(initialTribeStorageAddress, {from: curator})
      // Attach the old tokens to the new tribe
      await upgradedTribeInstance.setTokenAddresses(initialNativeTokenAddress, initialTribeTokenAddress, {from: curator})

      
      // Confirm escrowed balances and stakes on the upgraded tribe match the old tribe
      const upgradedTribeStorageAddress = await upgradedTribeInstance.tribeStorage()
      const upgradedTribeStorageInstance = TribeStorage.at(upgradedTribeStorageAddress)
      
      const task1AmountUpgraded = await upgradedTribeStorageInstance.escrowedTaskBalances(task1Id)
      const task2AmountUpgraded = await upgradedTribeStorageInstance.escrowedTaskBalances(task2Id)
      const project1AmountUpgraded = await upgradedTribeStorageInstance.escrowedProjectBalances(project1Id)
      const project2AmountUpgraded = await upgradedTribeStorageInstance.escrowedProjectBalances(project2Id)
      const project1PayeeUpgraded = await upgradedTribeStorageInstance.escrowedProjectPayees(project1Id)
      const project2PayeeUpgraded = await upgradedTribeStorageInstance.escrowedProjectPayees(project2Id)
      
      assert(task1Amount.equals(task1AmountUpgraded))
      assert(task2Amount.equals(task2AmountUpgraded))
      assert(project1Amount.equals(project1AmountUpgraded))
      assert(project2Amount.equals(project2AmountUpgraded))
      assert(project1Payee === project1PayeeUpgraded)
      assert(project2Payee === project2PayeeUpgraded)
      
      // reward task and project completion on the upgraded tribe

      const user1NativeBalanceBefore = await nativeTokenInstance.balanceOf(user1, {from: curator})
      const user2NativeBalanceBefore = await nativeTokenInstance.balanceOf(user2, {from: curator})

      await upgradedTribeInstance.rewardTaskCompletion(task1Id, user1, {from: curator})
      await upgradedTribeInstance.rewardTaskCompletion(task2Id, user2, {from: curator})
      await upgradedTribeInstance.rewardProjectCompletion(project1Id, {from: curator})
      await upgradedTribeInstance.rewardProjectCompletion(project2Id, {from: curator})
      
      // check user balances are expected after rewarding the stuff
      
      const user1NativeBalanceAfter = await nativeTokenInstance.balanceOf(user1, {from: curator})
      const user2NativeBalanceAfter = await nativeTokenInstance.balanceOf(user2, {from: curator})

      const expectedUser1BalanceAfter = user1NativeBalanceBefore.plus(task1Amount.plus(project1Amount))
      const expectedUser2BalanceAfter = user2NativeBalanceBefore.plus(task2Amount.plus(project2Amount))
      
      assert(expectedUser1BalanceAfter.equals(user1NativeBalanceAfter))
      assert(expectedUser2BalanceAfter.equals(user2NativeBalanceAfter))
      
      // test the new emergencyFundRetrieval() function on the upgraded tribe
      
      await upgradedTribeInstance.emergencyFundRetrieval({from: curator})
      
      // TODO check that emergencyFundRetrieval() worked
      
      // TODO verify the staking upgraded correctly
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
    
    return { launchedTribeRegistrar, launchedTribeInstance }
  }

  async function launchUpgradedTestTribe(minimumStakingRequirement, lockupPeriod, launchUuid, totalSupply, tokenDecimals) {
    
    // The tribe launcher needs momentary access to the logger so it can permission the tribe to use it
    await loggerInstance.transferOwnershipNow(upgradedTribeLauncherInstance.address)
    
    await upgradedTribeLauncherInstance.launchTribe(
      [launchUuid, minimumStakingRequirement, lockupPeriod, totalSupply, tokenDecimals],
      [curator, nativeTokenInstance.address, voteController, loggerInstance.address, smartTokenFactoryInstance.address, tribeStorageFactoryInstance.address, registrarFactoryInstance.address, upgradedTribeFactoryInstance.address],
      'Upgraded Test Tribe',
      'TT2',
      '2.0',
      true,
      {from: curator})

    
    const launchedTribeCount = await upgradedTribeLauncherInstance.launchedTribeCount()
    
    
    const launchedTribeRegistrarAddress = await upgradedTribeLauncherInstance.launchedTribeRegistrars(launchedTribeCount - 1)

    
    const launchedTribeRegistrar = await Registrar.at(launchedTribeRegistrarAddress)
    const launchedTribeAddresses = await launchedTribeRegistrar.getAddresses.call()
    
    
    const launchedTribeInstance = await UpgradedTribe.at(launchedTribeAddresses.slice(-1)[0])

    return { launchedTribeRegistrar, launchedTribeInstance }
    
  }
  
})

