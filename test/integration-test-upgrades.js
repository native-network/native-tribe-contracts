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
  
  describe("It should test upgrading a tribe contract", function() {

    /*
    This integration test demonstrates the process of upgrading a tribe by launching a new tribe and attaching it to the existing 
    TribeStorage, token and registrar.  The test verifies Staking and Escrow balances after the upgrade.
   */
    it("It should demonstrate the steps required for upgrading a tribe contract", async function () {
      
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
      
      // TODO Do some staking AND test that it worked.
      
      // give our users some tribe tokens so they can join the tribes
      await tribeTokenInstance.transfer(user1, minimumStakingRequirement, {from: curator})
      await tribeTokenInstance.transfer(user2, minimumStakingRequirement, {from: curator})

      // users approve their tokens so they can stake
      await tribeTokenInstance.approve(initialTribeInstance.address, minimumStakingRequirement, {from: user1})
      await tribeTokenInstance.approve(initialTribeInstance.address, minimumStakingRequirement, {from: user2})
      
      // users stake into initial tribe
      await initialTribeInstance.stakeTribeTokens({from: user1})
      await initialTribeInstance.stakeTribeTokens({from: user2})
    
      // Read the staked amounts we set in the initial tribe
      const user1StakeAmount = await initialTribeStorageInstance.stakedBalances(user1)
      const user2StakeAmount = await initialTribeStorageInstance.stakedBalances(user2)
      const user1StakeTime = await initialTribeStorageInstance.timeStaked(user1)
      const user2StakeTime = await initialTribeStorageInstance.timeStaked(user2)
      
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
      
      // Launch an upgraded tribe that has a new function and an additional argument in its constructor
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

      const user1StakeAmountUpgraded = await upgradedTribeStorageInstance.stakedBalances(user1)
      const user2StakeAmountUpgraded = await upgradedTribeStorageInstance.stakedBalances(user2)
      const user1StakeTimeUpgraded = await upgradedTribeStorageInstance.timeStaked(user1)
      const user2StakeTimeUpgraded = await upgradedTribeStorageInstance.timeStaked(user2)
      
      assert(user1StakeAmount.equals(user1StakeAmountUpgraded))
      assert(user2StakeAmount.equals(user2StakeAmountUpgraded))
      assert(user1StakeTime.equals(user1StakeTimeUpgraded))
      assert(user2StakeTime.equals(user2StakeTimeUpgraded))

      assert(await upgradedTribeInstance.isMember(user1))
      assert(await upgradedTribeInstance.isMember(user2))

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
      
      // check user balances are expected after rewarding
      
      const user1NativeBalanceAfter = await nativeTokenInstance.balanceOf(user1, {from: curator})
      const user2NativeBalanceAfter = await nativeTokenInstance.balanceOf(user2, {from: curator})

      const expectedUser1BalanceAfter = user1NativeBalanceBefore.plus(task1Amount.plus(project1Amount))
      const expectedUser2BalanceAfter = user2NativeBalanceBefore.plus(task2Amount.plus(project2Amount))
      
      assert(expectedUser1BalanceAfter.equals(user1NativeBalanceAfter))
      assert(expectedUser2BalanceAfter.equals(user2NativeBalanceAfter))
      
      // test the new emergencyFundRetrieval() function on the upgraded tribe

      const curatorTribeTokenBalance = await tribeTokenInstance.balanceOf(curator)
      const curatorNativeTokenBalance = await nativeTokenInstance.balanceOf(curator)
      const tribeStorageTribeTokenBalance = await tribeTokenInstance.balanceOf(upgradedTribeStorageAddress)
      const tribeStorageNativeTokenBalance = await nativeTokenInstance.balanceOf(upgradedTribeStorageAddress)
      
      await upgradedTribeInstance.emergencyFundRetrieval({from: curator})

      const curatorTribeTokenBalanceAfter = await tribeTokenInstance.balanceOf(curator)
      const curatorNativeTokenBalanceAfter = await nativeTokenInstance.balanceOf(curator)
      const tribeStorageTribeTokenBalanceAfter = await tribeTokenInstance.balanceOf(upgradedTribeStorageAddress)
      const tribeStorageNativeTokenBalanceAfter = await nativeTokenInstance.balanceOf(upgradedTribeStorageAddress)

      assert(tribeStorageTribeTokenBalanceAfter.equals(0))
      assert(tribeStorageNativeTokenBalanceAfter.equals(0))
      assert(curatorTribeTokenBalanceAfter.equals(curatorTribeTokenBalance.plus(tribeStorageTribeTokenBalance)))
      assert(curatorNativeTokenBalanceAfter.equals(curatorNativeTokenBalance.plus(tribeStorageNativeTokenBalance)))
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

