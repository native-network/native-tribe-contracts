const TribeLauncher = artifacts.require("TribeLauncher")
const Tribe = artifacts.require("Tribe")
const Logger = artifacts.require("Logger")
const Token = artifacts.require("SmartToken")
const Bluebird = require('Bluebird')

contract('Tribe', function () {
  const sender = web3.eth.accounts[0]
  const voteController = web3.eth.accounts[0]
  const curator = web3.eth.accounts[0]
  const nonCurator = web3.eth.accounts[1]
  
  let tribeLauncherInstance = null

  let launchedTribeAddress = null
  let launchedTribeInstance = null

  let tribeTokenInstance = null
  let tribeTokenAddress = null
  
  let amountRequiredForStaking = null
  let stakedMembershipStatus = null
  
  let nativeTokenInstance = null
  let logger = null

  before(async () => {

  })

  beforeEach(async () => {
    
    const _launchUuid = 123
    const _minimumStakingRequirement = 456
    const _lockupPeriod = 0
    
    nativeTokenInstance = await Token.deployed()
    tribeLauncherInstance = await TribeLauncher.deployed()
    await tribeLauncherInstance.launchTribe(
      _launchUuid,
      _minimumStakingRequirement,
      _lockupPeriod,
      curator,
      nativeTokenInstance.address,
      curator,
      'Test Tribe 1',
      1000000,
      18,
      'TT1',
      1.0, {from: sender})    
    const launchedTribeCount = await tribeLauncherInstance.launchedTribeCount()
    launchedTribeAddress = await tribeLauncherInstance.launchedTribes(launchedTribeCount - 1)
    console.log('launchedTribeAddress',launchedTribeAddress)
    launchedTribeInstance = await Tribe.at(launchedTribeAddress)
    tribeTokenAddress = await launchedTribeInstance.tribeTokenContractAddress()
    tribeTokenInstance = await Token.at(tribeTokenAddress)
    // Fund the dev fund
    await nativeTokenInstance.transfer(launchedTribeAddress, 1000000, {from: sender})
  })

  it("It should allow a curator to create a task", async function () {

    const uuid = 1234
    const taskReward = 1000
    
    let loggerAddress = await launchedTribeInstance.logger();
    let loggerInstance = await Logger.at(loggerAddress);

    const launchedEvent = Bluebird.promisify(loggerInstance.TaskCreated)()    

    await launchedTribeInstance.createNewTask(uuid, taskReward, {from: curator})

    
    
    return launchedEvent.then( (result) => {
      return assert(true)
    })
  })


  it("It should fail to create a task if the reward is set to less than 0", async function () {

    const uuid = 1234
    const taskReward = -1
    

    let loggerAddress = await launchedTribeInstance.logger();
    let loggerInstance = await Logger.at(loggerAddress);

    const logTaskCreatedPromise = Bluebird.promisify(loggerInstance.TaskCreated)()

    try {
      await launchedTribeInstance.createNewTask(uuid, taskReward, {from: nonCurator})  
    }
    catch (err) {
      if ( err.toString().indexOf('VM Exception while processing transaction: invalid opcode') >= 0 ) {
        return assert(true, "did not allow a user to set a negative task reward")
      } else {
        return assert(false, "did not allow a user to set a negative task reward but threw with an unexpected error")
      }
    }
    return logTaskCreatedPromise.then( (result) => {
      return assert(false)
    })
  })

  it("It should not allow a non-curator to create a task", async function () {

    const uuid = 1234
    const taskReward = 1000

    let loggerAddress = await launchedTribeInstance.logger();
    let loggerInstance = await Logger.at(loggerAddress);

    const logTaskCreatedPromise = Bluebird.promisify(loggerInstance.TaskCreated)()
    try {
      await launchedTribeInstance.createNewTask(uuid, taskReward, {from: nonCurator})  
    }
    catch (err) {
      if ( err.toString().indexOf('VM Exception while processing transaction: invalid opcode') >= 0 ) {
        return assert(true, "did not allowed a nonCurator to create a task")
      } else {
        return assert(false, "did not allowed a nonCurator to create a task but with an unexpected error")
      }
    }

    return logTaskCreatedPromise.then( (result) => {
      return assert(false, "Allowed a nonCurator to create a task")
    })
  })

  it("It should fail when creating a task with higher reward than remaining dev fund balance", async function () {

    const devFundRemainingBalance = await launchedTribeInstance.getAvailableDevFund()

    const taskRewardTooHigh = devFundRemainingBalance + 1

    const uuid = 1234
    try
    {
      await launchedTribeInstance.createNewTask(uuid, taskRewardTooHigh, {from: curator})
    }
    catch(err) {
      if ( err.toString().indexOf('VM Exception while processing transaction: invalid opcode') >= 0 ) {
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
    await launchedTribeInstance.createNewTask(uuid, taskReward, {from: curator})
    const devFundRemainingBalanceBefore = await launchedTribeInstance.getAvailableDevFund()
    await launchedTribeInstance.cancelTask(uuid, {from: curator})
    const devFundRemainingBalanceAfter = await launchedTribeInstance.getAvailableDevFund()
    return assert(devFundRemainingBalanceAfter.equals(devFundRemainingBalanceBefore.plus(taskReward)))
  })

  it("It should not allow a non-curator to cancel a task", async function () {
    const taskReward = 1000
    const uuid = 1234
    await launchedTribeInstance.createNewTask(uuid, taskReward, {from: curator})
    const devFundRemainingBalanceBefore = await launchedTribeInstance.getAvailableDevFund()
    
    try {
      await launchedTribeInstance.cancelTask(uuid, {from: nonCurator})  
    }
    catch (err) {
      if ( err.toString().indexOf('VM Exception while processing transaction: invalid opcode') >= 0 ) {

        const devFundRemainingBalanceAfter = await launchedTribeInstance.getAvailableDevFund()
        return assert(devFundRemainingBalanceAfter.equals(devFundRemainingBalanceBefore))
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
    await launchedTribeInstance.createNewTask(uuid, taskReward, {from: voteController})

    const devFundBalanceBefore = await nativeTokenInstance.balanceOf(launchedTribeInstance.address)
    const rewardeeBalanceBefore = await nativeTokenInstance.balanceOf(rewardee)
    
    await launchedTribeInstance.rewardTaskCompletion(uuid, rewardee, {from: voteController})

    const devFundBalanceAfter = await nativeTokenInstance.balanceOf(launchedTribeInstance.address)
    const taskEscrowBalanceAfter = await launchedTribeInstance.escrowedTaskBalances(uuid)
    const rewardeeBalanceAfter = await nativeTokenInstance.balanceOf(rewardee)
    
    assert(devFundBalanceAfter.equals(devFundBalanceBefore.minus(taskReward)))
    assert(taskEscrowBalanceAfter.equals(0))
    assert(rewardeeBalanceAfter.equals(rewardeeBalanceBefore.plus(taskReward)))
  })


  it("It should not allow a non-voteController to reward task completion", async function () {

    const rewardee = web3.eth.accounts[1]

    const taskReward = 1000
    const uuid = 1234
    await launchedTribeInstance.createNewTask(uuid, taskReward, {from: voteController})

    const devFundBalanceBefore = await nativeTokenInstance.balanceOf(launchedTribeInstance.address)
    const rewardeeBalanceBefore = await nativeTokenInstance.balanceOf(rewardee)
    
    try {
      await launchedTribeInstance.rewardTaskCompletion(uuid, rewardee, {from: nonCurator})  
    }
    catch (err) {
      if ( err.toString().indexOf('VM Exception while processing transaction: invalid opcode') >= 0 ) {
        const taskEscrowBalance = await launchedTribeInstance.escrowedTaskBalances(uuid)
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

    let loggerAddress = await launchedTribeInstance.logger();
    let loggerInstance = await Logger.at(loggerAddress);

    const logProjectCreatedPromise = Bluebird.promisify(loggerInstance.ProjectCreated)()

    await launchedTribeInstance.createNewProject(uuid, projectReward, rewardee, {from: curator})

    return logProjectCreatedPromise.then( (result) => {
      return assert(true)
    })
  })

  it("It should not allow a non-curator to create a project", async function () {

    const uuid = 1234
    const projectReward = 1000
    const rewardee = web3.eth.accounts[1]

    let loggerAddress = await launchedTribeInstance.logger();
    let loggerInstance = await Logger.at(loggerAddress);
    const logProjectCreatedPromise = Bluebird.promisify(loggerInstance.ProjectCreated)()

    
    try {
      await launchedTribeInstance.createNewProject(uuid, projectReward, rewardee, {from: nonCurator})
    }
    catch (err) {
      if ( err.toString().indexOf('VM Exception while processing transaction: invalid opcode') >= 0 ) {
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
    const devFundRemainingBalance = await launchedTribeInstance.getAvailableDevFund()
    const projectRewardTooHigh = devFundRemainingBalance + 1
    const uuid = 1234
    
    try
    {
      await launchedTribeInstance.createNewProject(uuid, projectRewardTooHigh, rewardee,  {from: curator})
    }
    catch(err) {
      if ( err.toString().indexOf('VM Exception while processing transaction: invalid opcode') >= 0 ) {
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
      await launchedTribeInstance.createNewProject(uuid, projectRewardTooLow, rewardee,  {from: curator})
    }
    catch(err) {
      if ( err.toString().indexOf('VM Exception while processing transaction: invalid opcode') >= 0 ) {
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
    
    await launchedTribeInstance.createNewProject(uuid, projectReward, rewardee, {from: curator})
    const devFundRemainingBalanceBefore = await launchedTribeInstance.getAvailableDevFund()
    await launchedTribeInstance.cancelProject(uuid, {from: curator})
    const devFundRemainingBalanceAfter = await launchedTribeInstance.getAvailableDevFund()
    return assert(devFundRemainingBalanceAfter.equals(devFundRemainingBalanceBefore.plus(projectReward)))
  })

  it("It should not allow a noncurator to cancel a project", async function () {
    const projectReward = 1000
    const uuid = 1234
    const rewardee = web3.eth.accounts[1]
    
    await launchedTribeInstance.createNewProject(uuid, projectReward, rewardee, {from: curator})
    const devFundRemainingBalanceBefore = await launchedTribeInstance.getAvailableDevFund()

    try {
      await launchedTribeInstance.cancelProject(uuid, {from: nonCurator})
    }
    catch (err) {

      if ( err.toString().indexOf('VM Exception while processing transaction: invalid opcode') >= 0 ) {
        const devFundRemainingBalanceAfter = await launchedTribeInstance.getAvailableDevFund()
        return assert(devFundRemainingBalanceAfter.equals(devFundRemainingBalanceBefore))
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
    await launchedTribeInstance.createNewProject(uuid, projectReward, rewardee, {from: voteController})

    const devFundBalanceBefore = await nativeTokenInstance.balanceOf(launchedTribeInstance.address)
    const rewardeeBalanceBefore = await nativeTokenInstance.balanceOf(rewardee)

    await launchedTribeInstance.rewardProjectCompletion(uuid, {from: voteController})

    const devFundBalanceAfter = await nativeTokenInstance.balanceOf(launchedTribeInstance.address)
    const taskEscrowBalanceAfter = await launchedTribeInstance.escrowedTaskBalances(uuid)
    const rewardeeBalanceAfter = await nativeTokenInstance.balanceOf(rewardee)

    assert(devFundBalanceAfter.equals(devFundBalanceBefore.minus(projectReward)))
    assert(taskEscrowBalanceAfter.equals(0))
    assert(rewardeeBalanceAfter.equals(rewardeeBalanceBefore.plus(projectReward)))
  })

  it("It should not allow a non-voteController to reward project completion", async function () {

    const rewardee = web3.eth.accounts[1]

    const projectReward = 1000
    const uuid = 1234
    await launchedTribeInstance.createNewProject(uuid, projectReward, rewardee, {from: voteController})

    const devFundBalanceBefore = await nativeTokenInstance.balanceOf(launchedTribeInstance.address)
    const rewardeeBalanceBefore = await nativeTokenInstance.balanceOf(rewardee)

    try {
      await launchedTribeInstance.rewardProjectCompletion(uuid, {from: nonCurator})
    }
    catch (err) {
      if ( err.toString().indexOf('VM Exception while processing transaction: invalid opcode') >= 0 ) {
        return assert(true, "did not allowed a nonCurator to reward a project")
      } else {
        return assert(false, "did not allowed a nonCurator to reward a a project but with an unexpected error")
      }
    }
    assert(false, "Allowed a non-votecontroller to reward a task")
  })


  it("It should stake tokens to become a member", async function () {
    const startingMembershipStatus = await launchedTribeInstance.isMember(sender)
    amountRequiredForStaking = await launchedTribeInstance.minimumStakingRequirement()
    
    await tribeTokenInstance.approve(launchedTribeInstance.address, amountRequiredForStaking, {from: sender})
    await launchedTribeInstance.stakeTribeTokens(amountRequiredForStaking, {from: sender})
    stakedMembershipStatus = await launchedTribeInstance.isMember(sender)
    assert(startingMembershipStatus === false && stakedMembershipStatus === true)
  })

  it("It should allow a staked user to unstake a tribe", async function () {
    // Same as staking
    const startingMembershipStatus = await launchedTribeInstance.isMember(sender)
    amountRequiredForStaking = await launchedTribeInstance.minimumStakingRequirement()
    await tribeTokenInstance.approve(launchedTribeInstance.address, amountRequiredForStaking, {from: sender})
    await launchedTribeInstance.stakeTribeTokens(amountRequiredForStaking, {from: sender})
    stakedMembershipStatus = await launchedTribeInstance.isMember(sender)
    assert(startingMembershipStatus === false && stakedMembershipStatus === true)
    
    // unstake
    await launchedTribeInstance.unstakeTribeTokens(amountRequiredForStaking, {from: sender})
    const finalMembershipStatus = await launchedTribeInstance.isMember(sender)
    assert(finalMembershipStatus === false)
  })

  it("It should allow a staked user to unstake a tribe", async function () {
    // Same as staking
    const startingMembershipStatus = await launchedTribeInstance.isMember(sender)
    amountRequiredForStaking = await launchedTribeInstance.minimumStakingRequirement()
    await tribeTokenInstance.approve(launchedTribeInstance.address, amountRequiredForStaking, {from: sender})
    await launchedTribeInstance.stakeTribeTokens(amountRequiredForStaking, {from: sender})
    stakedMembershipStatus = await launchedTribeInstance.isMember(sender)
    assert(startingMembershipStatus === false && stakedMembershipStatus === true)
    
    // unstake
    try {
      await launchedTribeInstance.unstakeTribeTokens(amountRequiredForStaking + 1, {from: sender})
    } catch (error) {
      const finalMembershipStatus = await launchedTribeInstance.isMember(sender)
      return assert(finalMembershipStatus === true)
    }
    
    assert(false, "User was able to unstake too many tokens")

  })

  it("It should block unstakng for a set amount of time", async function () {
    // Same as staking
    const startingMembershipStatus = await launchedTribeInstance.isMember(sender)
    amountRequiredForStaking = await launchedTribeInstance.minimumStakingRequirement()
    await tribeTokenInstance.approve(launchedTribeInstance.address, amountRequiredForStaking, {from: sender})
    await launchedTribeInstance.stakeTribeTokens(amountRequiredForStaking, {from: sender})
    stakedMembershipStatus = await launchedTribeInstance.isMember(sender)
    assert(startingMembershipStatus === false && stakedMembershipStatus === true)
    
    // we expect the unstake to revert as the _lockupPeriod has not been passed
    try {
      await launchedTribeInstance.unstakeTribeTokens(amountRequiredForStaking, {from: sender}) 
    } catch(e) {
      const finalMembershipStatus = await launchedTribeInstance.isMember(sender)
      assert(finalMembershipStatus === true)
    }
  })

  it("It should only allow a curator to make tribe level changes", async function () {
    // inital set by the curator
    const curatorSetMinimum = 1000
    await launchedTribeInstance.setMinimumStakingRequirement( curatorSetMinimum, {from: curator})
    const stakingMinimum = await launchedTribeInstance.minimumStakingRequirement()
    
    // malicious user attempts to change minimum staking requirnments
    const maliciousMinimumStakingRequirement = 0
    try {
      await launchedTribeInstance.setMinimumStakingRequirement( maliciousMinimumStakingRequirement, {from: nonCurator})
    } catch(e) {
      const currentStakingMinimum = await launchedTribeInstance.minimumStakingRequirement()
      assert( maliciousMinimumStakingRequirement.toString() != currentStakingMinimum.toString() )
      assert( curatorSetMinimum.toString() === currentStakingMinimum.toString() )
    }
  })

  it("It should change the minimumStakingRequirement", async function () {
    const stakingMinimum = await launchedTribeInstance.minimumStakingRequirement()
    const newStakingMinimum = 1501;
    await launchedTribeInstance.setMinimumStakingRequirement( newStakingMinimum, {from: curator})
    const finalStakingMinimum = await launchedTribeInstance.minimumStakingRequirement()
    assert( stakingMinimum.toString() != finalStakingMinimum.toString() )
    assert( finalStakingMinimum.toString() === newStakingMinimum.toString())
  })
  
  // Technically not sure about this one, solidity converts ints into uints and doesn't revert as I would expect.
  xit("It should not allow setting the minimumStakingRequirement to negative", async function () {
    const stakingMinimum = await launchedTribeInstance.minimumStakingRequirement()
    const newStakingMinimum = -1050;
    try {
      await launchedTribeInstance.setMinimumStakingRequirement( newStakingMinimum, {from: curator})
    } catch (error) {
      const finalStakingMinimum = await launchedTribeInstance.minimumStakingRequirement()
      assert(stakingMinimum.toString() === finalStakingMinimum.toString() && 1 == 2)
    }
    const finalStakingMinimum = await launchedTribeInstance.minimumStakingRequirement()
  })

  it("It should not allow setting the minimumStakingRequirement to a string", async function () {
    const stakingMinimum = await launchedTribeInstance.minimumStakingRequirement()
    const newStakingMinimum = 'foo';
    try {
      await launchedTribeInstance.setMinimumStakingRequirement( newStakingMinimum, {from: curator})
    } catch (error) {
      const finalStakingMinimum = await launchedTribeInstance.minimumStakingRequirement()
      assert(stakingMinimum.toString() === finalStakingMinimum.toString())
    }
  })

  it("It should change the setlockupPeriod", async function () {
    const lockupPeriod = await launchedTribeInstance.lockupPeriodSeconds()
    const newLockupPeriod = 1252;
    await launchedTribeInstance.setlockupPeriod( newLockupPeriod, {from: curator})
    const finalLockupPeriod = await launchedTribeInstance.lockupPeriodSeconds()
    assert( lockupPeriod.toString() != finalLockupPeriod.toString() )
    assert( finalLockupPeriod.toString() === newLockupPeriod.toString())
  })

  it("It should not allow setting the setlockupPeriod to a string", async function () {
    const lockupPeriod = await launchedTribeInstance.lockupPeriodSeconds()
    const newLockupPeriod = 'foo';
    try {
      await launchedTribeInstance.setlockupPeriod( newLockupPeriod, {from: curator})  
    } catch(e) {
      const finalLockupPeriod = await launchedTribeInstance.lockupPeriodSeconds()
      assert( lockupPeriod.toString() != newLockupPeriod.toString() )
      assert( finalLockupPeriod .toString() === lockupPeriod.toString())
    }
  })
  
})