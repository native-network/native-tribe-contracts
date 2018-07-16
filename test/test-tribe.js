const TribeLauncher = artifacts.require("TribeLauncher")
const Tribe = artifacts.require("Tribe")
const Token = artifacts.require("SmartToken")


contract('Tribe', function () {
  const sender = web3.eth.accounts[0]
  const curator = web3.eth.accounts[0]
  const nonCurator = web3.eth.accounts[1]
  const _launchUuid = 123
  const _minimumStakingRequirement = 456
  const _lockupPeriod = 0
  let tokenInstance = null
  let tribeLauncherInstance = null
  let launchedTribeCount = null
  let launchedTribeAddress = null
  let launchedTribeInstance = null
  let startingMembershipStatus = null
  let amountRequiredForStaking = null
  let stakedMembershipStatus = null

  before(async () => {

  })

  beforeEach(async () => {
    tokenInstance = await Token.deployed()
    tribeLauncherInstance = await TribeLauncher.deployed()
    await tribeLauncherInstance.launchTribe(_launchUuid, _minimumStakingRequirement, _lockupPeriod, curator, tokenInstance.address, {from: sender})
    launchedTribeCount = await tribeLauncherInstance.launchedCount()
    launchedTribeAddress = await tribeLauncherInstance.launchedTribes(launchedTribeCount - 1)
    launchedTribeInstance = await Tribe.at(launchedTribeAddress)
    amountRequiredForStaking = await launchedTribeInstance.minimumStakingRequirement()
    await tokenInstance.approve(launchedTribeInstance.address, amountRequiredForStaking, {from: sender})
  })

  it("It should stake tokens to become a member", async function () {
    startingMembershipStatus = await launchedTribeInstance.isMember(sender)
    amountRequiredForStaking = await launchedTribeInstance.minimumStakingRequirement()
    await launchedTribeInstance.stakeTribeTokens(amountRequiredForStaking, {from: sender})
    stakedMembershipStatus = await launchedTribeInstance.isMember(sender)
    assert(startingMembershipStatus === false && stakedMembershipStatus === true)
  })

  it("It should allow a staked user to unstake a tribe", async function () {
    // Same as staking
    startingMembershipStatus = await launchedTribeInstance.isMember(sender)
    amountRequiredForStaking = await launchedTribeInstance.minimumStakingRequirement()
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
    startingMembershipStatus = await launchedTribeInstance.isMember(sender)
    amountRequiredForStaking = await launchedTribeInstance.minimumStakingRequirement()
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

  
})