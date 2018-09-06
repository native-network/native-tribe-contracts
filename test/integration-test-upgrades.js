const CommunityLauncher = artifacts.require("CommunityLauncher")
const UpgradedCommunityLauncher = artifacts.require("UpgradedCommunityLauncher")
const Community = artifacts.require("Community")
const UpgradedCommunity = artifacts.require("UpgradedCommunity")
const Logger = artifacts.require("Logger")
const SmartToken = artifacts.require("SmartToken")
const SmartTokenFactory = artifacts.require("SmartTokenFactory")
const CommunityAccountFactory = artifacts.require("CommunityAccountFactory")
const CommunityAccount = artifacts.require("CommunityAccount")
const Registrar = artifacts.require("Registrar")
const RegistrarFactory = artifacts.require("RegistrarFactory")
const CommunityFactory = artifacts.require("CommunityFactory")
const UpgradedCommunityFactory = artifacts.require("UpgradedCommunityFactory")

/* 
Upgrade Community Example:

1) Launch a community
2) Create multiple tasks and projects across multiple users
3) Create multiple escrows

4) launch a new community contract with different functions
5) attach the community to the previous community account
6) test that everything works

Upgrade Logger Example:

1) Launch new community
2) Launch new Logger
3) Attach logger to community
4) test that it still works

*/


contract('Upgrades Testing', function () {

  const sender = web3.eth.accounts[0]
  const curator = web3.eth.accounts[0]
  const voteController = curator
  const user1 = web3.eth.accounts[1]
  const user2 = web3.eth.accounts[2]
  
  let communityLauncherInstance
  let upgradedCommunityLauncherInstance
  let nativeTokenInstance
  let loggerInstance
  let smartTokenFactoryInstance
  let communityAccountFactoryInstance
  let registrarFactoryInstance
  let communityFactoryInstance
  let upgradedCommunityFactoryInstance
  
  beforeEach(async () => {

    loggerInstance = await Logger.deployed()
    nativeTokenInstance = await SmartToken.deployed()
    communityLauncherInstance = await CommunityLauncher.deployed()
    upgradedCommunityLauncherInstance = await UpgradedCommunityLauncher.deployed()
    
    smartTokenFactoryInstance = await SmartTokenFactory.deployed()
    communityAccountFactoryInstance = await CommunityAccountFactory.deployed()
    communityAccountFactoryInstance = await CommunityAccountFactory.deployed()
    registrarFactoryInstance = await RegistrarFactory.deployed()
    communityFactoryInstance = await CommunityFactory.deployed()
    upgradedCommunityFactoryInstance = await UpgradedCommunityFactory.deployed()
  })
  
  describe("It should test upgrading a community contract", function() {

    /*
    This integration test demonstrates the process of upgrading a community by launching a new community and attaching it to the existing
    CommunityAccount, token and registrar.  The test verifies Staking and Escrow balances after the upgrade.
   */
    it("It should demonstrate the steps required for upgrading a community contract", async function () {
      
      const minimumStakingRequirement = 10
      const lockupPeriod = 0
      const launchUuid = 123
      const totalSupply = 1000000
      const tokenDecimals = 18
      const initialCommunity = await launchInitialTestCommunity(minimumStakingRequirement, lockupPeriod, launchUuid, totalSupply, tokenDecimals, {from: curator})
      const initialCommunityInstance = initialCommunity.launchedCommunityInstance
      
      const initialCommunityAccountAddress = await initialCommunityInstance.communityAccount()
      const initialCommunityAccountInstance = CommunityAccount.at(initialCommunityAccountAddress)
      
      const initialCommunityTokenAddress = await initialCommunityInstance.communityTokenInstance()
      const initialNativeTokenAddress = await initialCommunityInstance.nativeTokenInstance()
      
      const communityTokenInstance = SmartToken.at(initialCommunityTokenAddress)
      const nativeTokenInstance = SmartToken.at(initialNativeTokenAddress)
      
      // give our users some community tokens so they can join the communities
      await communityTokenInstance.transfer(user1, minimumStakingRequirement, {from: curator})
      await communityTokenInstance.transfer(user2, minimumStakingRequirement, {from: curator})

      // users approve their tokens so they can stake
      await communityTokenInstance.approve(initialCommunityInstance.address, minimumStakingRequirement, {from: user1})
      await communityTokenInstance.approve(initialCommunityInstance.address, minimumStakingRequirement, {from: user2})
      
      // users stake into initial community
      await initialCommunityInstance.stakeCommunityTokens({from: user1})
      await initialCommunityInstance.stakeCommunityTokens({from: user2})
    
      // Read the staked amounts we set in the initial community
      const user1StakeAmount = await initialCommunityAccountInstance.stakedBalances(user1)
      const user2StakeAmount = await initialCommunityAccountInstance.stakedBalances(user2)
      const user1StakeTime = await initialCommunityAccountInstance.timeStaked(user1)
      const user2StakeTime = await initialCommunityAccountInstance.timeStaked(user2)
      
      // Fund the dev fund so we can make some tasks and projects
      await nativeTokenInstance.transfer(initialCommunityAccountAddress, 1000000, {from: curator})

      // make some tasks and projects
      const task1Id = 1
      const task2Id = 2
      const project1Id = 3
      const project2Id = 4
      
      await initialCommunityInstance.createNewTask(task1Id, 100, {from: curator})
      await initialCommunityInstance.createNewTask(task2Id, 140, {from: curator})
      await initialCommunityInstance.createNewProject(project1Id, 310, user1, {from: curator})
      await initialCommunityInstance.createNewProject(project2Id, 805, user2, {from: curator})
      
      
      // Read the project and task escrow amounts we set in the initial community
      const task1Amount = await initialCommunityAccountInstance.escrowedTaskBalances(task1Id)
      const task2Amount = await initialCommunityAccountInstance.escrowedTaskBalances(task2Id)
      const project1Amount = await initialCommunityAccountInstance.escrowedProjectBalances(project1Id)
      const project2Amount = await initialCommunityAccountInstance.escrowedProjectBalances(project2Id)

      const project1Payee = await initialCommunityAccountInstance.escrowedProjectPayees(project1Id)
      const project2Payee = await initialCommunityAccountInstance.escrowedProjectPayees(project2Id)
      
      // Launch an upgraded community that has a new function and an additional argument in its constructor
      const upgradedCommunity = await launchUpgradedTestCommunity(minimumStakingRequirement, lockupPeriod, launchUuid, totalSupply, tokenDecimals, true)
      
      const upgradedCommunityInstance = upgradedCommunity.launchedCommunityInstance
    
      // Give the new community ownership of the old account
      await initialCommunityInstance.setCommunityAccountOwner(upgradedCommunityInstance.address, {from: curator})
      // Attach the old account to the new community
      await upgradedCommunityInstance.setCommunityAccount(initialCommunityAccountAddress, {from: curator})
      // Attach the old tokens to the new community
      await upgradedCommunityInstance.setTokenAddresses(initialNativeTokenAddress, initialCommunityTokenAddress, {from: curator})
      
      // Confirm escrowed balances and stakes on the upgraded community match the old community
      const upgradedCommunityAccountAddress = await upgradedCommunityInstance.communityAccount()
      const upgradedCommunityAccountInstance = CommunityAccount.at(upgradedCommunityAccountAddress)
      
      const task1AmountUpgraded = await upgradedCommunityAccountInstance.escrowedTaskBalances(task1Id)
      const task2AmountUpgraded = await upgradedCommunityAccountInstance.escrowedTaskBalances(task2Id)
      const project1AmountUpgraded = await upgradedCommunityAccountInstance.escrowedProjectBalances(project1Id)
      const project2AmountUpgraded = await upgradedCommunityAccountInstance.escrowedProjectBalances(project2Id)
      const project1PayeeUpgraded = await upgradedCommunityAccountInstance.escrowedProjectPayees(project1Id)
      const project2PayeeUpgraded = await upgradedCommunityAccountInstance.escrowedProjectPayees(project2Id)

      const user1StakeAmountUpgraded = await upgradedCommunityAccountInstance.stakedBalances(user1)
      const user2StakeAmountUpgraded = await upgradedCommunityAccountInstance.stakedBalances(user2)
      const user1StakeTimeUpgraded = await upgradedCommunityAccountInstance.timeStaked(user1)
      const user2StakeTimeUpgraded = await upgradedCommunityAccountInstance.timeStaked(user2)
      
      assert(user1StakeAmount.equals(user1StakeAmountUpgraded))
      assert(user2StakeAmount.equals(user2StakeAmountUpgraded))
      assert(user1StakeTime.equals(user1StakeTimeUpgraded))
      assert(user2StakeTime.equals(user2StakeTimeUpgraded))

      assert(await upgradedCommunityInstance.isMember(user1))
      assert(await upgradedCommunityInstance.isMember(user2))

      assert(task1Amount.equals(task1AmountUpgraded))
      assert(task2Amount.equals(task2AmountUpgraded))

      assert(project1Amount.equals(project1AmountUpgraded))
      assert(project2Amount.equals(project2AmountUpgraded))
      assert(project1Payee === project1PayeeUpgraded)
      assert(project2Payee === project2PayeeUpgraded)
      
      // reward task and project completion on the upgraded community

      const user1NativeBalanceBefore = await nativeTokenInstance.balanceOf(user1, {from: curator})
      const user2NativeBalanceBefore = await nativeTokenInstance.balanceOf(user2, {from: curator})

      await upgradedCommunityInstance.rewardTaskCompletion(task1Id, user1, {from: curator})
      await upgradedCommunityInstance.rewardTaskCompletion(task2Id, user2, {from: curator})
      await upgradedCommunityInstance.rewardProjectCompletion(project1Id, {from: curator})
      await upgradedCommunityInstance.rewardProjectCompletion(project2Id, {from: curator})
      
      // check user balances are expected after rewarding
      
      const user1NativeBalanceAfter = await nativeTokenInstance.balanceOf(user1, {from: curator})
      const user2NativeBalanceAfter = await nativeTokenInstance.balanceOf(user2, {from: curator})

      const expectedUser1BalanceAfter = user1NativeBalanceBefore.plus(task1Amount.plus(project1Amount))
      const expectedUser2BalanceAfter = user2NativeBalanceBefore.plus(task2Amount.plus(project2Amount))
      
      assert(expectedUser1BalanceAfter.equals(user1NativeBalanceAfter))
      assert(expectedUser2BalanceAfter.equals(user2NativeBalanceAfter))
      
      // test the new emergencyFundRetrieval() function on the upgraded community

      const curatorCommunityTokenBalance = await communityTokenInstance.balanceOf(curator)
      const curatorNativeTokenBalance = await nativeTokenInstance.balanceOf(curator)
      const communityAccountCommunityTokenBalance = await communityTokenInstance.balanceOf(upgradedCommunityAccountAddress)
      const communityAccountNativeTokenBalance = await nativeTokenInstance.balanceOf(upgradedCommunityAccountAddress)
      
      await upgradedCommunityInstance.emergencyFundRetrieval({from: curator})

      const curatorCommunityTokenBalanceAfter = await communityTokenInstance.balanceOf(curator)
      const curatorNativeTokenBalanceAfter = await nativeTokenInstance.balanceOf(curator)
      const communityAccountCommunityTokenBalanceAfter = await communityTokenInstance.balanceOf(upgradedCommunityAccountAddress)
      const communityAccountNativeTokenBalanceAfter = await nativeTokenInstance.balanceOf(upgradedCommunityAccountAddress)

      assert(communityAccountCommunityTokenBalanceAfter.equals(0))
      assert(communityAccountNativeTokenBalanceAfter.equals(0))
      assert(curatorCommunityTokenBalanceAfter.equals(curatorCommunityTokenBalance.plus(communityAccountCommunityTokenBalance)))
      assert(curatorNativeTokenBalanceAfter.equals(curatorNativeTokenBalance.plus(communityAccountNativeTokenBalance)))
    })

    async function launchInitialTestCommunity(minimumStakingRequirement, lockupPeriod, launchUuid, totalSupply, tokenDecimals) {
      
      // The community launcher needs momentary access to the logger so it can permission the community to use it
      await loggerInstance.transferOwnershipNow(communityLauncherInstance.address)

      await communityLauncherInstance.launchCommunity(
        [launchUuid, minimumStakingRequirement, lockupPeriod, totalSupply, tokenDecimals],
        [curator, nativeTokenInstance.address, voteController, loggerInstance.address, smartTokenFactoryInstance.address, communityAccountFactoryInstance.address, registrarFactoryInstance.address, communityFactoryInstance.address],
        'Initial Test Community',
        'TT1',
        '1.0', {from: sender})

      const launchedCommunityCount = await communityLauncherInstance.launchedCommunityCount()
      const launchedCommunityRegistrarAddress = await communityLauncherInstance.launchedCommunityRegistrars(launchedCommunityCount - 1)
      const launchedCommunityRegistrar = await Registrar.at(launchedCommunityRegistrarAddress)
      const launchedCommunityAddresses = await launchedCommunityRegistrar.getAddresses.call()
      const launchedCommunityInstance = await Community.at(launchedCommunityAddresses.slice(-1)[0])
      
      return { launchedCommunityRegistrar, launchedCommunityInstance }
    }

    async function launchUpgradedTestCommunity(minimumStakingRequirement, lockupPeriod, launchUuid, totalSupply, tokenDecimals) {
      
      // The community launcher needs momentary access to the logger so it can permission the community to use it
      await loggerInstance.transferOwnershipNow(upgradedCommunityLauncherInstance.address)
      
      await upgradedCommunityLauncherInstance.launchCommunity(
        [launchUuid, minimumStakingRequirement, lockupPeriod, totalSupply, tokenDecimals],
        [curator, nativeTokenInstance.address, voteController, loggerInstance.address, smartTokenFactoryInstance.address, communityAccountFactoryInstance.address, registrarFactoryInstance.address, upgradedCommunityFactoryInstance.address],
        'Upgraded Test Community',
        'TT2',
        '2.0',
        true,
        {from: curator})
      
      const launchedCommunityCount = await upgradedCommunityLauncherInstance.launchedCommunityCount()
      const launchedCommunityRegistrarAddress = await upgradedCommunityLauncherInstance.launchedCommunityRegistrars(launchedCommunityCount - 1)
      const launchedCommunityRegistrar = await Registrar.at(launchedCommunityRegistrarAddress)
      const launchedCommunityAddresses = await launchedCommunityRegistrar.getAddresses.call()
      const launchedCommunityInstance = await UpgradedCommunity.at(launchedCommunityAddresses.slice(-1)[0])

      return { launchedCommunityRegistrar, launchedCommunityInstance }
    }
  })
})