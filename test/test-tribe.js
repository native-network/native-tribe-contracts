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

    await tribeLauncherInstance.launchTribe(123, 456, 789, curator, tokenInstance.address, {from: sender})

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

})