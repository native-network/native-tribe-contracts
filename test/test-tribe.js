const TribeLauncher = artifacts.require("TribeLauncher");
const Tribe = artifacts.require("Tribe");
const Token = artifacts.require("SmartToken");


contract('Tribe', function () {

  // TODO write all the tests
  it("It should stake tokens to become a member", async function () {
    const sender = web3.eth.accounts[0]
    const curator = web3.eth.accounts[0]

    const tokenInstance = await Token.deployed()

    const tribeLauncherInstance = await TribeLauncher.deployed()

    const _launchUuid = 123;
    const _minimumStakingRequirement = 456;
    const _lockupPeriod = 0;

    await tribeLauncherInstance.launchTribe(_launchUuid, _minimumStakingRequirement, _lockupPeriod, curator,
                                            tokenInstance.address, {from: sender})

    const launchedTribeCount = await tribeLauncherInstance.launchedCount()

    const launchedTribeAddress = await tribeLauncherInstance.launchedTribes(launchedTribeCount - 1)

    const launchedTribeInstance = await Tribe.at(launchedTribeAddress)

    const startingMembershipStatus = await launchedTribeInstance.isMember(sender)
    
    const amountRequiredForStaking = await launchedTribeInstance.minimumStakingRequirement()
    
    await tokenInstance.approve(launchedTribeInstance.address, amountRequiredForStaking, {from: sender})

    await launchedTribeInstance.stakeTribeTokens(amountRequiredForStaking, {from: sender})

    const finalMembershipStatus = await launchedTribeInstance.isMember(sender)
    
    assert(startingMembershipStatus === false && finalMembershipStatus === true)
  })

  it("It should allow a user to unstake a tribe", async function () {
    const sender = web3.eth.accounts[0]
    const curator = web3.eth.accounts[0]

    const tokenInstance = await Token.deployed()

    const tribeLauncherInstance = await TribeLauncher.deployed()

    const _launchUuid = 123;
    const _minimumStakingRequirement = 456;
    const _lockupPeriod = 0;

    await tribeLauncherInstance.launchTribe(_launchUuid, _minimumStakingRequirement, _lockupPeriod, curator,
                                            tokenInstance.address, {from: sender})

    const launchedTribeCount = await tribeLauncherInstance.launchedCount()

    const launchedTribeAddress = await tribeLauncherInstance.launchedTribes(launchedTribeCount - 1)

    const launchedTribeInstance = await Tribe.at(launchedTribeAddress)

    const startingMembershipStatus = await launchedTribeInstance.isMember(sender)
    
    const amountRequiredForStaking = await launchedTribeInstance.minimumStakingRequirement()
    
    await tokenInstance.approve(launchedTribeInstance.address, amountRequiredForStaking, {from: sender})

    await launchedTribeInstance.stakeTribeTokens(amountRequiredForStaking, {from: sender})

    const StakedMembershipStatus = await launchedTribeInstance.isMember(sender)
    
    assert(startingMembershipStatus === false && StakedMembershipStatus === true)

    await launchedTribeInstance.unstakeTribeTokens(amountRequiredForStaking, {from: sender})
    
    const finalMembershipStatus = await launchedTribeInstance.isMember(sender)
    
    assert(finalMembershipStatus === false)

  })

  it("It should block unstakng for a set amount of time", async function () {
    const sender = web3.eth.accounts[0]
    const curator = web3.eth.accounts[0]

    const tokenInstance = await Token.deployed()

    const tribeLauncherInstance = await TribeLauncher.deployed()

    const _launchUuid = 123;
    const _minimumStakingRequirement = 456;
    const _lockupPeriod = 10;

    await tribeLauncherInstance.launchTribe(_launchUuid, _minimumStakingRequirement, _lockupPeriod, curator,
                                            tokenInstance.address, {from: sender})

    const launchedTribeCount = await tribeLauncherInstance.launchedCount()

    const launchedTribeAddress = await tribeLauncherInstance.launchedTribes(launchedTribeCount - 1)

    const launchedTribeInstance = await Tribe.at(launchedTribeAddress)

    const startingMembershipStatus = await launchedTribeInstance.isMember(sender)
    
    const amountRequiredForStaking = await launchedTribeInstance.minimumStakingRequirement()
    
    await tokenInstance.approve(launchedTribeInstance.address, amountRequiredForStaking, {from: sender})

    await launchedTribeInstance.stakeTribeTokens(amountRequiredForStaking, {from: sender})

    const StakedMembershipStatus = await launchedTribeInstance.isMember(sender)
    
    assert(startingMembershipStatus === false && StakedMembershipStatus === true)
    
    // we expect the unstake to revert as the _lockupPeriod has not been passed
    try {
      await launchedTribeInstance.unstakeTribeTokens(amountRequiredForStaking, {from: sender}) 
    } catch(e) {

      const finalMembershipStatus = await launchedTribeInstance.isMember(sender)

      assert(finalMembershipStatus === true)
    }
  })

  it("It should only allow a curator to make tribe level changes", async function () {
    const sender = web3.eth.accounts[0]
    const curator = web3.eth.accounts[0]
    const randomUser = web3.eth.accounts[1]

    const tokenInstance = await Token.deployed()

    const tribeLauncherInstance = await TribeLauncher.deployed()

    const _launchUuid = 123;
    const _minimumStakingRequirement = 10;
    const _lockupPeriod = 0;

    await tribeLauncherInstance.launchTribe(_launchUuid, _minimumStakingRequirement, _lockupPeriod, curator,
                                            tokenInstance.address, {from: sender})

    const launchedTribeCount = await tribeLauncherInstance.launchedCount()

    const launchedTribeAddress = await tribeLauncherInstance.launchedTribes(launchedTribeCount - 1)

    const launchedTribeInstance = await Tribe.at(launchedTribeAddress)

    const startingMembershipStatus = await launchedTribeInstance.isMember(sender)
    
    const amountRequiredForStaking = await launchedTribeInstance.minimumStakingRequirement()
    
    await tokenInstance.approve(launchedTribeInstance.address, amountRequiredForStaking, {from: sender})

    await launchedTribeInstance.stakeTribeTokens(amountRequiredForStaking, {from: sender})

    const stakedMembershipStatus = await launchedTribeInstance.isMember(sender)
    
    assert(startingMembershipStatus === false && stakedMembershipStatus === true)
    
    const newMinimumStakingRequirement = 1000;
    await launchedTribeInstance.setMinimumStakingRequirement( newMinimumStakingRequirement, {from: curator})
    
    const newStakingMinimum = await launchedTribeInstance.minimumStakingRequirement()

    const finalMembershipStatus = await launchedTribeInstance.isMember(sender)

    assert(finalMembershipStatus === false && newMinimumStakingRequirement.toString() === newStakingMinimum.toString() )

    const maliciousMinimumStakingRequirement = 0;
    try {
      await launchedTribeInstance.setMinimumStakingRequirement( maliciousMinimumStakingRequirement, {from: randomUser})
    } catch(e) {
      const currentStakingMinimum = await launchedTribeInstance.minimumStakingRequirement()
      assert( maliciousMinimumStakingRequirement.toString() != currentStakingMinimum.toString() )
    }
    
    // should never get here
    assert(false)

  })

  
})