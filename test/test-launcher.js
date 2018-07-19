const TribeLauncher = artifacts.require("TribeLauncher");
const Tribe = artifacts.require("Tribe");
const Token = artifacts.require("SmartToken");

contract('TribeLauncher', function () {

  const sender = web3.eth.accounts[0]
  const curator = web3.eth.accounts[0]
  const nonCurator = web3.eth.accounts[1]
  const _launchUuid = 123
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
    
    const initialDevFund = 1000
    
    const nativeTokenInstance = await Token.deployed()
    tribeLauncherInstance = await TribeLauncher.deployed()

    await nativeTokenInstance.transfer(tribeLauncherInstance.address, initialDevFund, {from: sender})
    
  })
  
  // TODO test this to check for emitted event.  and all variable values
  it("It should launch a new tribe contract", async function () {

    const nativeTokenInstance = await Token.deployed()
    
    const _minimumStakingRequirement = 10;
    const _lockupPeriod = 0;
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
    const launchedTribeAddress = await tribeLauncherInstance.launchedTribes(launchedTribeCount - 1)
    const launchedTribeInstance = await Tribe.at(launchedTribeAddress)
    const minimumStakingRequirement = await launchedTribeInstance.minimumStakingRequirement()
    // just a check to ensure we actually are getting data back and the contract is deployed
    assert(minimumStakingRequirement.toString() === _minimumStakingRequirement.toString())
  })

  it("It should fail to launch a tribe with a bad _minimumStakingRequirement", async function () {
    const _minimumStakingRequirement = 'foo';
    const _lockupPeriod = 0;

    try {
      await tribeLauncherInstance.launchTribe(_launchUuid, _minimumStakingRequirement, _lockupPeriod, curator,
        tokenInstance.address, {from: sender})
    } catch (e) {
      assert(true)
      return;
    }
    assert(false);
    
  })
  
})