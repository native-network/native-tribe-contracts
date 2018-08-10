const TribeLauncher = artifacts.require("TribeLauncher");
const Tribe = artifacts.require("Tribe");
const Logger = artifacts.require("Logger");
const SmartToken = artifacts.require("SmartToken");
const SmartTokenFactory = artifacts.require("SmartTokenFactory");
const TribeStorageFactory = artifacts.require("TribeStorageFactory");
const Registrar = artifacts.require("Registrar");
const RegistrarFactory = artifacts.require("RegistrarFactory");
const TribeFactory = artifacts.require("TribeFactory");
const Bluebird = require('Bluebird');
 

contract('TribeLauncher', function () {

  const sender = web3.eth.accounts[0]
  const curator = web3.eth.accounts[0]
  const nonCurator = web3.eth.accounts[5]
  const voteController = curator

  let tribeLauncherInstance
  let nativeTokenInstance
  let loggerInstance
  let smartTokenFactoryInstance
  let tribeStorageFactoryInstance
  let registrarFactoryInstance
  let tribeFactoryInstance

  beforeEach(async () => {
    const initialDevFund = 1000
    loggerInstance = await Logger.deployed()
    nativeTokenInstance = await SmartToken.deployed()
    tribeLauncherInstance = await TribeLauncher.deployed()
    smartTokenFactoryInstance = await SmartTokenFactory.deployed()
    tribeStorageFactoryInstance = await TribeStorageFactory.deployed()
    tribeStorageFactoryInstance = await TribeStorageFactory.deployed()
    registrarFactoryInstance = await RegistrarFactory.deployed()
    tribeFactoryInstance = await TribeFactory.deployed()
  })
  describe("It should test the launcher", function() {
    const sender = web3.eth.accounts[0]
    const curator = web3.eth.accounts[0]
    const voteController = curator

    // TODO add tests to show 
    // TODO 1) that the tribe account is good
    // TODO 2) tribe token is good
    // TODO 3) registrar is good
    
    // TODO also add tribe launch failure cases
    // TODO 1) fail When non-owner tries to use the tribe launcher
    
    it("It should launch a new tribe contract when calling launchTribe()", async function () {
      const minimumStakingRequirement = 10
      const lockupPeriod = 0
      const launchUuid = 123
      const totalSupply = 1000000
      const tokenDecimals = 18


      // The tribe launcher needs momentary access to the logger so it can permission the tribe to use it
      await loggerInstance.transferOwnershipNow(tribeLauncherInstance.address)
      
      await tribeLauncherInstance.launchTribe(
        [launchUuid, minimumStakingRequirement, lockupPeriod, totalSupply, tokenDecimals],
        [curator, nativeTokenInstance.address, voteController, loggerInstance.address, smartTokenFactoryInstance.address, tribeStorageFactoryInstance.address, registrarFactoryInstance.address, tribeFactoryInstance.address],
        'Test Tribe 1',
        'TT1',
        '1.0', {from: sender})
      
      const launchedTribeCount = await tribeLauncherInstance.launchedTribeCount()
      const launchedTribeRegistrarAddress = await tribeLauncherInstance.launchedTribeRegistrars(launchedTribeCount - 1)

      const launchedTribeRegistrar = await Registrar.at(launchedTribeRegistrarAddress)
      const launchedTribeAddresses = await launchedTribeRegistrar.getAddresses.call()
      const launchedTribeInstance = await Tribe.at(launchedTribeAddresses.slice(-1)[0])
      
      // all the variables that are set on the contract
      const tribe_minimumStakingRequirement = await launchedTribeInstance.minimumStakingRequirement()
      const tribe_nativeTokenContractAddress = await launchedTribeInstance.nativeTokenInstance()
      const tribe_voteController = await launchedTribeInstance.voteController()
      const launchedEvent = Bluebird.promisify(tribeLauncherInstance.Launched)()
      return launchedEvent.then( (result) => {
        assert(launchedTribeInstance.tribeTokenInstance)
        assert(launchedTribeAddresses.length > 0)
        assert(launchedTribeRegistrarAddress.length > 0)
        assert(result.args.launchUuid.toString() === launchUuid.toString())
        assert(tribe_minimumStakingRequirement.toString() === minimumStakingRequirement.toString())
        assert(tribe_nativeTokenContractAddress === nativeTokenInstance.address)
        assert(tribe_voteController === voteController)
        assert(true)
      }).catch((rejected) => {
        assert(false, rejected);
      })
    })

    xit("It should fail when a non-owner attempts to launch a new tribe when calling launchTribe()", async function () {
      const minimumStakingRequirement = 10
      const lockupPeriod = 0
      const launchUuid = 123
      const totalSupply = 1000000
      const tokenDecimals = 18

      // The tribe launcher needs momentary access to the logger so it can permission the tribe to use it
      await loggerInstance.transferOwnershipNow(tribeLauncherInstance.address)
      await tribeLauncherInstance.launchTribe(
        [launchUuid, minimumStakingRequirement, lockupPeriod, totalSupply, tokenDecimals],
        [curator, nativeTokenInstance.address, voteController, loggerInstance.address, smartTokenFactoryInstance.address, tribeStorageFactoryInstance.address, registrarFactoryInstance.address, tribeFactoryInstance.address],
        'Test Tribe 1',
        'TT1',
        '1.0', {from: nonCurator})
      
      const launchedTribeCount = await tribeLauncherInstance.launchedTribeCount()
      const launchedTribeRegistrarAddress = await tribeLauncherInstance.launchedTribeRegistrars(launchedTribeCount - 1)

      const launchedTribeRegistrar = await Registrar.at(launchedTribeRegistrarAddress)
      const launchedTribeAddresses = await launchedTribeRegistrar.getAddresses.call()
      const launchedTribeInstance = await Tribe.at(launchedTribeAddresses.slice(-1)[0])
      
      // all the variables that are set on the contract
      const tribe_minimumStakingRequirement = await launchedTribeInstance.minimumStakingRequirement()
      const tribe_nativeTokenContractAddress = await launchedTribeInstance.nativeTokenInstance()
      const tribe_voteController = await launchedTribeInstance.voteController()
      const launchedEvent = Bluebird.promisify(tribeLauncherInstance.Launched)()
      try {
        return launchedEvent.then( (result) => {
          assert(launchedTribeInstance.tribeTokenInstance)
          assert(launchedTribeAddresses.length > 0)
          assert(launchedTribeRegistrarAddress.length > 0)
          assert(result.args.launchUuid.toString() === launchUuid.toString())
          assert(tribe_minimumStakingRequirement.toString() === minimumStakingRequirement.toString())
          assert(tribe_nativeTokenContractAddress === nativeTokenInstance.address)
          assert(tribe_voteController === voteController)
          assert(false)
        }).catch((rejected) => {
          assert(true, rejected);
        })
      
      } catch (error) {
        console.log('erro')
        assert(true);
      }
      
    })
  })
})

