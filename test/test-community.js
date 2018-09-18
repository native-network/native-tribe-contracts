const CommunityLauncher = artifacts.require("CommunityLauncher")
const Community = artifacts.require("Community")
const Logger = artifacts.require("Logger")
const Token = artifacts.require("SmartToken")
const Registrar = artifacts.require("Registrar")
const Bluebird = require('Bluebird')
const RegistrarFactory = artifacts.require("RegistrarFactory")
const CommunityFactory = artifacts.require("CommunityFactory")
const SmartTokenFactory = artifacts.require("SmartTokenFactory")
const CommunityAccountFactory = artifacts.require("CommunityAccountFactory")
const CommunityAccount = artifacts.require("CommunityAccount")

contract('Community', function () {
  const sender = web3.eth.accounts[0]
  const voteController = web3.eth.accounts[0]
  const curator = web3.eth.accounts[0]
  const nonCurator = web3.eth.accounts[1]
  const brokeUser = web3.eth.accounts[5]

  let communityLauncherInstance
  let nativeTokenInstance
  let loggerInstance
  let smartTokenFactoryInstance
  let communityAccountFactoryInstance
  let registrarFactoryInstance
  let communityFactoryInstance
  
  let launchedCommunityInstance = null

  let communityTokenInstance = null
  let communityTokenAddress = null
  
  let amountRequiredForStaking = null
  let stakedMembershipStatus = null

  beforeEach(async () => {
    const minimumStakingRequirement = 10
    const lockupPeriod = 0
    const launchUuid = 123
    const totalSupply = 1000000
    const tokenDecimals = 18
    
    loggerInstance = await Logger.deployed()
    nativeTokenInstance = await Token.deployed()
    communityLauncherInstance = await CommunityLauncher.deployed()
    smartTokenFactoryInstance = await SmartTokenFactory.deployed()
    communityAccountFactoryInstance = await CommunityAccountFactory.deployed()
    registrarFactoryInstance = await RegistrarFactory.deployed()
    communityFactoryInstance = await CommunityFactory.deployed()

    // The community launcher needs momentary access to the logger so it can permission the community to use it
    await loggerInstance.transferOwnershipNow(communityLauncherInstance.address)
    
    await communityLauncherInstance.launchCommunity(
      [launchUuid, minimumStakingRequirement, lockupPeriod, totalSupply, tokenDecimals],
      [curator, nativeTokenInstance.address, voteController, loggerInstance.address, smartTokenFactoryInstance.address, communityAccountFactoryInstance.address, registrarFactoryInstance.address, communityFactoryInstance.address],
      'Test Community 1',
      'TT1',
      '1.0', {from: sender})
    
    const launchedCommunityCount = await communityLauncherInstance.launchedCommunityCount()
    const launchedCommunityRegistrarAddress = await communityLauncherInstance.launchedCommunityRegistrars(launchedCommunityCount - 1)
    const launchedCommunityRegistrar = await Registrar.at(launchedCommunityRegistrarAddress)
    const launchedCommunityAddresses = await launchedCommunityRegistrar.getAddresses.call()
    launchedCommunityInstance = await Community.at(launchedCommunityAddresses.slice(-1)[0])
    
    communityTokenAddress = await launchedCommunityInstance.communityTokenInstance()
    communityTokenInstance = await Token.at(communityTokenAddress)

    // Fund the dev fund so we can test tasks and projects
    const communityAccountAddress = await launchedCommunityInstance.communityAccount()
    await nativeTokenInstance.transfer(communityAccountAddress, 1000000, {from: sender})
  })

  describe("It should test the community", function() {
    
    it("It should allow a curator to create a task", async function () {
      
      const uuid = 1234
      const taskReward = 1000
      const launchedEvent = Bluebird.promisify(loggerInstance.TaskCreated)()
      await launchedCommunityInstance.createNewTask(uuid, taskReward, {from: curator})
      return launchedEvent.then(() => {
        return assert(true)
      })
    })
      
    it("It should fail to create a task if the reward is set to less than 0", async function () {

      const uuid = 1234
      const taskReward = -1

      const logTaskCreatedPromise = Bluebird.promisify(loggerInstance.TaskCreated)()

      try {
        await launchedCommunityInstance.createNewTask(uuid, taskReward, {from: nonCurator})
      }
      catch (err) {
        if ( err.toString().indexOf('VM Exception while processing transaction: revert') >= 0 ) {
          return assert(true, "did not allow a user to set a negative task reward")
        } else {
          return assert(false, "did not allow a user to set a negative task reward but threw with an unexpected error")
        }
      }
      return logTaskCreatedPromise.then(() => {
        return assert(false)
      })
    })

      it("It should not allow a non-curator to create a task", async function () {

      const uuid = 1234
      const taskReward = 1000

      const logTaskCreatedPromise = Bluebird.promisify(loggerInstance.TaskCreated)()
      try {
        await launchedCommunityInstance.createNewTask(uuid, taskReward, {from: nonCurator})
      }
      catch (err) {
        if ( err.toString().indexOf('VM Exception while processing transaction: revert') >= 0 ) {
          return assert(true, "did not allowed a nonCurator to create a task")
        } else {
          return assert(false, "did not allowed a nonCurator to create a task but with an unexpected error")
        }
      }

      return logTaskCreatedPromise.then(() => {
        return assert(false, "Allowed a nonCurator to create a task")
      })
    })

    it("It should fail when creating a task with higher reward than remaining dev fund balance", async function () {

      const devFundRemainingBalance = await launchedCommunityInstance.getAvailableDevFund()

      const taskRewardTooHigh = devFundRemainingBalance + 1

      const uuid = 1234
      try
      {
        await launchedCommunityInstance.createNewTask(uuid, taskRewardTooHigh, {from: curator})
      }
      catch(err) {
        if ( err.toString().indexOf('VM Exception while processing transaction: revert') >= 0 ) {
          return assert(true, "failed when creating a task with a higher reward than remaining dev fund balance")
        } else {
          return assert(false, "failed when creating the task but with an unexpected error message")
        }
      }
      return assert(false, 'Expected to fail but succeeded')
    })

      
    it("It should allow a curator to cancel a task", async function () {
      const taskReward = 1000
      const uuid = 1234
      await launchedCommunityInstance.createNewTask(uuid, taskReward, {from: curator})
      const devFundRemainingBalanceBefore = await launchedCommunityInstance.getAvailableDevFund()
      await launchedCommunityInstance.cancelTask(uuid, {from: curator})
      const devFundRemainingBalanceAfter = await launchedCommunityInstance.getAvailableDevFund()
      return assert(devFundRemainingBalanceAfter.equals(devFundRemainingBalanceBefore.plus(taskReward)))
    })

    it("It should not allow a non-curator to cancel a task", async function () {
      const taskReward = 1000
      const uuid = 1234
      await launchedCommunityInstance.createNewTask(uuid, taskReward, {from: curator})
      const devFundRemainingBalanceBefore = await launchedCommunityInstance.getAvailableDevFund()
      
      try {
        await launchedCommunityInstance.cancelTask(uuid, {from: nonCurator})
      }
      catch (err) {
        if ( err.toString().indexOf('VM Exception while processing transaction: revert') >= 0 ) {

          const devFundRemainingBalanceAfter = await launchedCommunityInstance.getAvailableDevFund()
          assert(devFundRemainingBalanceAfter.equals(devFundRemainingBalanceBefore))
          return assert(true, "did not allowed a nonCurator to cancel a task")
        } else {
          return assert(false, "did not allowed a nonCurator to cancel a task but with an unexpected error")
        }
      }
    })

    it("It should allow a voteController to reward task completion", async function () {

      const rewardee = web3.eth.accounts[1]

      const taskReward = 1000
      const uuid = 1234
      await launchedCommunityInstance.createNewTask(uuid, taskReward, {from: voteController})

      const communityAccountAddress = await launchedCommunityInstance.communityAccount()
      
      const devFundBalanceBefore = await nativeTokenInstance.balanceOf(communityAccountAddress)
      const rewardeeBalanceBefore = await nativeTokenInstance.balanceOf(rewardee)
      await launchedCommunityInstance.rewardTaskCompletion(uuid, rewardee, {from: voteController})

      const devFundBalanceAfter = await nativeTokenInstance.balanceOf(communityAccountAddress)
      const communityAccountInstance = CommunityAccount.at(communityAccountAddress)
      const taskEscrowBalanceAfter = await communityAccountInstance.escrowedTaskBalances(uuid)
      const rewardeeBalanceAfter = await nativeTokenInstance.balanceOf(rewardee)
      
      assert(devFundBalanceAfter.equals(devFundBalanceBefore.minus(taskReward)))
      assert(taskEscrowBalanceAfter.equals(0))
      assert(rewardeeBalanceAfter.equals(rewardeeBalanceBefore.plus(taskReward)))
    })

    it("It should not allow a non-voteController to reward task completion", async function () {

      const rewardee = web3.eth.accounts[1]

      const taskReward = 1000
      const uuid = 1234
      await launchedCommunityInstance.createNewTask(uuid, taskReward, {from: voteController})

      const rewardeeBalanceBefore = await nativeTokenInstance.balanceOf(rewardee)
      
      try {
        await launchedCommunityInstance.rewardTaskCompletion(uuid, rewardee, {from: nonCurator})
      }
      catch (err) {
        if ( err.toString().indexOf('VM Exception while processing transaction: revert') >= 0 ) {
          
          const communityAccountAddress = await launchedCommunityInstance.communityAccount()
          const communityAccountInstance = CommunityAccount.at(communityAccountAddress)
          const taskEscrowBalance = await communityAccountInstance.escrowedTaskBalances(uuid)
          const rewardeeBalanceAfter = await nativeTokenInstance.balanceOf(rewardee)

          assert(taskEscrowBalance.equals(taskReward))
          assert(rewardeeBalanceAfter.equals(rewardeeBalanceBefore))
          return assert(true, "did not allowed a nonCurator to reward a task")
        } else {
          return assert(false, "did not allowed a nonCurator to reward a task but with an unexpected error")
        }
      }
      return assert(false)   
    })


    it("It should allow a curator to create a project", async function () {

      const uuid = 1234
      const projectReward = 1000
      const rewardee = web3.eth.accounts[1]

      const logProjectCreatedPromise = Bluebird.promisify(loggerInstance.ProjectCreated)()

      await launchedCommunityInstance.createNewProject(uuid, projectReward, rewardee, {from: curator})

      return logProjectCreatedPromise.then(() => {
        return assert(true)
      })
    })

    it("It should not allow a non-curator to create a project", async function () {

      const uuid = 1234
      const projectReward = 1000
      const rewardee = web3.eth.accounts[1]

      const logProjectCreatedPromise = Bluebird.promisify(loggerInstance.ProjectCreated)()

      
      try {
        await launchedCommunityInstance.createNewProject(uuid, projectReward, rewardee, {from: nonCurator})
      }
      catch (err) {
        if ( err.toString().indexOf('VM Exception while processing transaction: revert') >= 0 ) {
          return assert(true, "did not allowed a nonCurator to create a project")
        } else {
          return assert(false, "did not allowed a nonCurator to create a project but with an unexpected error")
        }
      }

      return logProjectCreatedPromise.then( (result) => {
        return assert(false, "Allowed a nonCurator to create a project")
      })
    })

    it("It should fail when creating a project with higher reward than remaining dev fund balance", async function () {

      const rewardee = web3.eth.accounts[1]
      const devFundRemainingBalance = await launchedCommunityInstance.getAvailableDevFund()
      const projectRewardTooHigh = devFundRemainingBalance + 1
      const uuid = 1234
      
      try
      {
        await launchedCommunityInstance.createNewProject(uuid, projectRewardTooHigh, rewardee,  {from: curator})
      }
      catch(err) {
        if ( err.toString().indexOf('VM Exception while processing transaction: revert') >= 0 ) {
          return assert(true, "did not allow a project to be created that with a reward higher than the remaining dev fund")
        } else {
          return assert(false, "encountered an unexpected error")
        }
      }
      return assert(false, 'Expected to fail but succeeded')
    })

    it("It should fail when creating a project with a reward less than 0", async function () {

      const rewardee = web3.eth.accounts[1]
      const projectRewardTooLow = -1
      const uuid = 1234
      
      try
      {
        await launchedCommunityInstance.createNewProject(uuid, projectRewardTooLow, rewardee,  {from: curator})
      }
      catch(err) {
        if ( err.toString().indexOf('VM Exception while processing transaction: revert') >= 0 ) {
          return assert(true, "did not allow a project to be created that with a negative reward")
        } else {
          return assert(false, "encountered an unexpected error")
        }
      }
      return assert(false, 'Expected to fail but succeeded')
    })

    it("It should allow a curator to cancel a project", async function () {
      const projectReward = 1000
      const uuid = 1234
      const rewardee = web3.eth.accounts[1]
      
      await launchedCommunityInstance.createNewProject(uuid, projectReward, rewardee, {from: curator})
      const devFundRemainingBalanceBefore = await launchedCommunityInstance.getAvailableDevFund()
      await launchedCommunityInstance.cancelProject(uuid, {from: curator})
      const devFundRemainingBalanceAfter = await launchedCommunityInstance.getAvailableDevFund()
      return assert(devFundRemainingBalanceAfter.equals(devFundRemainingBalanceBefore.plus(projectReward)))
    })

    it("It should not allow a noncurator to cancel a project", async function () {
      const projectReward = 1000
      const uuid = 1234
      const rewardee = web3.eth.accounts[1]
      
      await launchedCommunityInstance.createNewProject(uuid, projectReward, rewardee, {from: curator})
      const devFundRemainingBalanceBefore = await launchedCommunityInstance.getAvailableDevFund()

      try {
        await launchedCommunityInstance.cancelProject(uuid, {from: nonCurator})
      }
      catch (err) {
        if ( err.toString().indexOf('VM Exception while processing transaction: revert') >= 0 ) {
          const devFundRemainingBalanceAfter = await launchedCommunityInstance.getAvailableDevFund()
          assert(devFundRemainingBalanceAfter.equals(devFundRemainingBalanceBefore))
          return assert(true, "did not allowed a nonCurator to cancel a project")
        } else {
          return assert(false, "did not allowed a nonCurator to cancel a project but with an unexpected error")
        }
      }
      assert(false, "allowed a nonCurator to cancel a project")
    })

    it("It should allow a voteController to reward project completion", async function () {

      const rewardee = web3.eth.accounts[1]

      const projectReward = 1000
      const uuid = 1234
      await launchedCommunityInstance.createNewProject(uuid, projectReward, rewardee, {from: voteController})

      const communityAccountAddress = await launchedCommunityInstance.communityAccount()
      
      const devFundBalanceBefore = await nativeTokenInstance.balanceOf(communityAccountAddress)
      const rewardeeBalanceBefore = await nativeTokenInstance.balanceOf(rewardee)

      await launchedCommunityInstance.rewardProjectCompletion(uuid, {from: voteController})

      const devFundBalanceAfter = await nativeTokenInstance.balanceOf(communityAccountAddress)
      const communityAccountInstance = CommunityAccount.at(communityAccountAddress)
      const taskEscrowBalanceAfter = await communityAccountInstance.escrowedTaskBalances(uuid)
      const rewardeeBalanceAfter = await nativeTokenInstance.balanceOf(rewardee)
      
      assert(devFundBalanceAfter.equals(devFundBalanceBefore.minus(projectReward)))
      assert(taskEscrowBalanceAfter.equals(0))
      assert(rewardeeBalanceAfter.equals(rewardeeBalanceBefore.plus(projectReward)))
    })

    it("It should not allow a non-voteController to reward project completion", async function () {

      const rewardee = web3.eth.accounts[1]

      const projectReward = 1000
      const uuid = 1234
      await launchedCommunityInstance.createNewProject(uuid, projectReward, rewardee, {from: voteController})

      try {
        await launchedCommunityInstance.rewardProjectCompletion(uuid, {from: nonCurator})
      }
      catch (err) {
        if ( err.toString().indexOf('VM Exception while processing transaction: revert') >= 0 ) {
          return assert(true, "did not allowed a nonCurator to reward a project")
        } else {
          return assert(false, "did not allowed a nonCurator to reward a a project but with an unexpected error")
        }
      }
      assert(false, "Allowed a non-votecontroller to reward a task")
    })

    it("It should stake tokens to become a member", async function () {
      const startingMembershipStatus = await launchedCommunityInstance.isMember(sender)
      amountRequiredForStaking = await launchedCommunityInstance.minimumStakingRequirement()
      await communityTokenInstance.approve(launchedCommunityInstance.address, amountRequiredForStaking, {from: sender})
      await launchedCommunityInstance.stakeCommunityTokens({from: sender})
      stakedMembershipStatus = await launchedCommunityInstance.isMember(sender)
      assert(startingMembershipStatus === false && stakedMembershipStatus === true)
    })

    it("It should fail if the user does not have enough tokens for staking", async function () {
      amountRequiredForStaking = await launchedCommunityInstance.minimumStakingRequirement()
      await communityTokenInstance.approve(launchedCommunityInstance.address, amountRequiredForStaking, {from: sender})
      try {
        await launchedCommunityInstance.stakeCommunityTokens({from: brokeUser})
        stakedMembershipStatus = await launchedCommunityInstance.isMember(sender)
      } catch (error) {
        return assert(true)
      }
      assert(false)
    })

    it("It should fail if the user does not approve enough tokens for staking", async function () {
      amountRequiredForStaking = await launchedCommunityInstance.minimumStakingRequirement()
      await communityTokenInstance.approve(launchedCommunityInstance.address, amountRequiredForStaking-1, {from: sender})
      try {
        await launchedCommunityInstance.stakeCommunityTokens({from: sender})
        stakedMembershipStatus = await launchedCommunityInstance.isMember(sender)
      } catch (error) {
        return assert(true)
      }
      assert(false)
    })

    it("It should allow a staked user to unstake a community", async function () {
      // Same as staking
      const startingMembershipStatus = await launchedCommunityInstance.isMember(sender)
      amountRequiredForStaking = await launchedCommunityInstance.minimumStakingRequirement()
      await communityTokenInstance.approve(launchedCommunityInstance.address, amountRequiredForStaking, {from: sender})
      await launchedCommunityInstance.stakeCommunityTokens({from: sender})
      stakedMembershipStatus = await launchedCommunityInstance.isMember(sender)
      assert(startingMembershipStatus === false && stakedMembershipStatus === true)

      let balanceBeforeUnstaking = await communityTokenInstance.balanceOf(sender)
      
      // unstake
      await launchedCommunityInstance.unstakeCommunityTokens({from: sender})
      const finalMembershipStatus = await launchedCommunityInstance.isMember(sender)

      let balanceAfterUnstaking = await communityTokenInstance.balanceOf(sender)

      assert(balanceAfterUnstaking.equals(balanceBeforeUnstaking.plus(amountRequiredForStaking)))
      assert(finalMembershipStatus === false)
    })


    it("It should block unstaking for a set amount of time", async function () {
      // Same as staking
      amountRequiredForStaking = await launchedCommunityInstance.minimumStakingRequirement()
      await communityTokenInstance.approve(launchedCommunityInstance.address, amountRequiredForStaking, {from: sender})
      await launchedCommunityInstance.setLockupPeriodSeconds( 1000000, {from: curator})
      await launchedCommunityInstance.stakeCommunityTokens({from: sender})
      stakedMembershipStatus = await launchedCommunityInstance.isMember(sender)

      // we expect the unstake to revert as the _lockupPeriod has not been passed
      try {
        await launchedCommunityInstance.unstakeCommunityTokens({from: sender})
      } catch(e) {
        const finalMembershipStatus = await launchedCommunityInstance.isMember(sender)
        return assert(finalMembershipStatus === true)
      }
      assert(false);
    })

      it("It should change the minimumStakingRequirement", async function () {
        const stakingMinimum = await launchedCommunityInstance.minimumStakingRequirement()
        const newStakingMinimum = 1501
        const initalLockupPeriod = await launchedCommunityInstance.lockupPeriodSeconds()
        await launchedCommunityInstance.setMinimumStakingRequirement( newStakingMinimum, {from: curator})
        const finalStakingMinimum = await launchedCommunityInstance.minimumStakingRequirement()
        const finalLockupPeriod = await launchedCommunityInstance.lockupPeriodSeconds()
        assert( stakingMinimum.toString() != finalStakingMinimum.toString() )
        assert( finalStakingMinimum.toString() === newStakingMinimum.toString())
        assert( initalLockupPeriod.toString() === finalLockupPeriod.toString() ) 
      })
      
      it("It should fail if non curator tries to change the minimum steaking requirement", async function () {
      // inital set by the curator
      const curatorSetMinimum = 1000
      await launchedCommunityInstance.setMinimumStakingRequirement( curatorSetMinimum, {from: curator})
      const initalLockupPeriod = await launchedCommunityInstance.lockupPeriodSeconds()
      // malicious user attempts to change minimum staking requirnments
      const maliciousMinimumStakingRequirement = 0
      try {
        await launchedCommunityInstance.setMinimumStakingRequirement( maliciousMinimumStakingRequirement, {from: nonCurator})
      } catch(e) {
        const currentStakingMinimum = await launchedCommunityInstance.minimumStakingRequirement()
        const finalLockupPeriod = await launchedCommunityInstance.lockupPeriodSeconds()
        assert( maliciousMinimumStakingRequirement.toString() != currentStakingMinimum.toString() )
        assert( curatorSetMinimum.toString() === currentStakingMinimum.toString() )
        assert( initalLockupPeriod.toString() === finalLockupPeriod.toString() ) 
      }
    })

    it("It should change the setlockupPeriod", async function () {
      const lockupPeriod = await launchedCommunityInstance.lockupPeriodSeconds()
      const newLockupPeriod = 1252
      await launchedCommunityInstance.setLockupPeriodSeconds( newLockupPeriod, {from: curator})
      const initialStakingMinimum = await launchedCommunityInstance.minimumStakingRequirement()
      const finalLockupPeriod = await launchedCommunityInstance.lockupPeriodSeconds()
      const finalStakingMinimum = await launchedCommunityInstance.minimumStakingRequirement()
      assert( lockupPeriod.toString() != finalLockupPeriod.toString() )
      assert( finalLockupPeriod.toString() === newLockupPeriod.toString())
      assert (initialStakingMinimum.toString() === finalStakingMinimum.toString())
    })
      
    it("It should fail to set the lockupPeriod if a non-curator sets it", async function () {
      const lockupPeriod = await launchedCommunityInstance.lockupPeriodSeconds()
      const newLockupPeriod = 1252
      try {
        await launchedCommunityInstance.setLockupPeriodSeconds( newLockupPeriod, {from: nonCurator})
      } catch (e) {
        const finalLockupPeriod = await launchedCommunityInstance.lockupPeriodSeconds()
        assert(true)
        return assert( lockupPeriod.toString() === finalLockupPeriod.toString() )
      }
      assert(false)
    })
  })

})