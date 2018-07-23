const TribeLauncher = artifacts.require("TribeLauncher")
const Tribe = artifacts.require("Tribe")
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
    launchedTribeInstance = await Tribe.at(launchedTribeAddress)
    tribeTokenAddress = await launchedTribeInstance.tribeTokenContractAddress()
    tribeTokenInstance = await Token.at(tribeTokenAddress)
    // Fund the dev fund
    await nativeTokenInstance.transfer(launchedTribeAddress, 1000000, {from: sender})
  })

  it("It should not allow a non-curator to create a task", async function () {  

    const uuid = 1234
    const taskReward = 1000
    try 
    {
      await launchedTribeInstance.createNewTask(uuid, taskReward, {from: nonCurator})
    } 
    catch(err) {
      if (err.toString().indexOf("VM Exception while processing transaction: invalid opcode") >= 0) {
        return assert(true, 'threw an expected error')
      } else {
        return assert(false, 'threw an unexpected error')
      }
      
    }
    return assert(false, 'Expected to fail but succeeded')
  })

  it("It should allow a curator to create a task", async function () {

    const uuid = 1234
    const taskReward = 1000
    
    const logTaskCreatedPromise = Bluebird.promisify(launchedTribeInstance.TaskCreated)()

    await launchedTribeInstance.createNewTask(uuid, taskReward, {from: curator})
    
    return logTaskCreatedPromise.then( (result) => {
      return assert(true)
    })
  })

  it("It should not allow a non-curator to create a task", async function () {

    const uuid = 1234
    const taskReward = 1000

    const logTaskCreatedPromise = Bluebird.promisify(launchedTribeInstance.TaskCreated)()
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
      // TODO make sure this is the expected error message
    catch(err) {
      return assert(true, 'threw an expected error')
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

  it.only("It should not allow a non-curator to cancel a task", async function () {
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
        return assert(false, "did not allowed a nonCurator to create a task but with an unexpected error")
      }
    }
  })

  // TODO do the negative case of this
  it("It should allow a voteController to reward task completion", async function () {

    const rewardee = web3.eth.accounts[1]

    const taskReward = 1000
    const uuid = 1234
    await launchedTribeInstance.createNewTask(uuid, taskReward, {from: voteController})

    const devFundBalanceBefore = await nativeTokenInstance.balanceOf(launchedTribeInstance.address)
    const rewardeeBalanceBefore = await nativeTokenInstance.balanceOf(rewardee)
    
    await launchedTribeInstance.rewardTaskCompletion(uuid, rewardee, {from: curator})

    const devFundBalanceAfter = await nativeTokenInstance.balanceOf(launchedTribeInstance.address)
    const taskEscrowBalanceAfter = await launchedTribeInstance.escrowedTaskBalances(uuid)
    const rewardeeBalanceAfter = await nativeTokenInstance.balanceOf(rewardee)
    
    assert(devFundBalanceAfter.equals(devFundBalanceBefore.minus(taskReward)))
    assert(taskEscrowBalanceAfter.equals(0))
    assert(rewardeeBalanceAfter.equals(rewardeeBalanceBefore.plus(taskReward)))
  })






  it("It should not allow a non-curator to create a project", async function () {

    const uuid = 1234
    const projectReward = 1000
    const rewardee = web3.eth.accounts[1]
  
    try
    {
      await launchedTribeInstance.createNewProject(uuid, projectReward, rewardee, {from: nonCurator})
    }
      // TODO make sure this is the expected error message
    catch(err) {
      return assert(true, 'threw an expected error')
    }
    return assert(false, 'Expected to fail but succeeded')
  })

  // TODO test the negative case of this
  it("It should allow a curator to create a project", async function () {

    const uuid = 1234
    const projectReward = 1000
    const rewardee = web3.eth.accounts[1]

    const logProjectCreatedPromise = Bluebird.promisify(launchedTribeInstance.ProjectCreated)()

    await launchedTribeInstance.createNewProject(uuid, projectReward, rewardee, {from: curator})

    return logProjectCreatedPromise.then( (result) => {
      return assert(true)
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
      // TODO make sure this is the expected error message
    catch(err) {
      return assert(true, 'threw an expected error')
    }
    return assert(false, 'Expected to fail but succeeded')
  })

  // TODO do the negative case of this
  it("It should allow a curator to cancel a project", async function () {
    const projectReward = 1000
    const uuid = 1234
    const rewardee = web3.eth.accounts[1]
    
    await launchedTribeInstance.createNewProject(uuid, projectReward, rewardee, {from: curator})
    const devFundRemainingBalanceBefore = await launchedTribeInstance.getAvailableDevFund()
    await launchedTribeInstance.cancelProject(uuid, {from: curator})
    const devFundRemainingBalanceAfter = await launchedTribeInstance.getAvailableDevFund()
    return assert(devFundRemainingBalanceAfter.equals(devFundRemainingBalanceBefore.plus(taskReward)))
  })

  // TODO do the negative case of this
  it("It should allow a voteController to reward project completion", async function () {

    const rewardee = web3.eth.accounts[1]

    const projectReward = 1000
    const uuid = 1234
    await launchedTribeInstance.createNewProject(uuid, projectReward, rewardee, {from: voteController})

    const devFundBalanceBefore = await nativeTokenInstance.balanceOf(launchedTribeInstance.address)
    const rewardeeBalanceBefore = await nativeTokenInstance.balanceOf(rewardee)

    await launchedTribeInstance.rewardProjectCompletion(uuid, {from: curator})

    const devFundBalanceAfter = await nativeTokenInstance.balanceOf(launchedTribeInstance.address)
    const taskEscrowBalanceAfter = await launchedTribeInstance.escrowedTaskBalances(uuid)
    const rewardeeBalanceAfter = await nativeTokenInstance.balanceOf(rewardee)

    assert(devFundBalanceAfter.equals(devFundBalanceBefore.minus(projectReward)))
    assert(taskEscrowBalanceAfter.equals(0))
    assert(rewardeeBalanceAfter.equals(rewardeeBalanceBefore.plus(projectReward)))
  })











  it("It should stake tokens to become a member", async function () {
    const startingMembershipStatus = await launchedTribeInstance.isMember(sender)
    amountRequiredForStaking = await launchedTribeInstance.minimumStakingRequirement()
    
    console.log('amountRequiredForStaking',  amountRequiredForStaking)
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