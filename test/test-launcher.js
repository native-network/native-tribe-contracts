const TribeLauncher = artifacts.require("TribeLauncher");
const Tribe = artifacts.require("Tribe");
const Logger = artifacts.require("Logger");
const SmartToken = artifacts.require("SmartToken");
const Registrar = artifacts.require("Registrar");
const Bluebird = require('Bluebird');
 

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
    let nativeTokenInstance = null
    let loggerInstance = null

    before(async () => {

    })

    beforeEach(async () => {

      const initialDevFund = 1000
      loggerInstance = await Logger.deployed()
      nativeTokenInstance = await SmartToken.deployed()
      tribeLauncherInstance = await TribeLauncher.deployed()
    })

    it("It should launch a new tribe contract", async function () {
      const _minimumStakingRequirement = 10;
      const _lockupPeriod = 0;

      await tribeLauncherInstance.launchTribe(
        [_launchUuid,
        _minimumStakingRequirement,
        _lockupPeriod,
        1000000,
        18],
        curator,
        nativeTokenInstance.address,
        curator,
        'Test Tribe 1',
        'TT1',
        1.0,
        loggerInstance.address, {from: sender})
      const launchedTribeCount = await tribeLauncherInstance.launchedTribeCount()
      const launchedTribeRegistrarAddress = await tribeLauncherInstance.launchedTribes(launchedTribeCount - 1)
      const launchedTribeRegistrar = await Registrar.at(launchedTribeRegistrarAddress)
      const launchedTribeAddresses = await launchedTribeRegistrar.getAddresses.call()
      const launchedTribeInstance = await Tribe.at(launchedTribeAddresses.slice(-1)[0])
      
      // all the variables that are set on the contract
      const tribe_minimumStakingRequirement = await launchedTribeInstance.minimumStakingRequirement()
      const tribe_nativeTokenContractAddress = await launchedTribeInstance.nativeTokenContractAddress()
      const tribe_voteController = await launchedTribeInstance.voteController()
      const launchedEvent = Bluebird.promisify(tribeLauncherInstance.Launched)()    

      return launchedEvent.then( (result) => {
        // just a check to ensure we actually are getting data back and the contract is deployed      
        assert(result.args.launchUuid.toString() === _launchUuid.toString())
        assert(tribe_minimumStakingRequirement.toString() === _minimumStakingRequirement.toString())
        assert(tribe_nativeTokenContractAddress === nativeTokenInstance.address)
        assert(tribe_voteController === curator)
      }).catch((rejected) => {
        assert(false, rejected);
      })
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
