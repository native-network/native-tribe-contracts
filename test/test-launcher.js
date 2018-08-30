const CommunityLauncher = artifacts.require("CommunityLauncher")
const Community = artifacts.require("Community")
const Logger = artifacts.require("Logger")
const SmartToken = artifacts.require("SmartToken")
const SmartTokenFactory = artifacts.require("SmartTokenFactory")
const CommunityAccountFactory = artifacts.require("CommunityAccountFactory")
const Registrar = artifacts.require("Registrar")
const RegistrarFactory = artifacts.require("RegistrarFactory")
const CommunityFactory = artifacts.require("CommunityFactory")
const Bluebird = require('Bluebird')
 

contract('CommunityLauncher', function () {
  let communityLauncherInstance
  let nativeTokenInstance
  let loggerInstance
  let smartTokenFactoryInstance
  let communityAccountFactoryInstance
  let registrarFactoryInstance
  let communityFactoryInstance

  beforeEach(async () => {
    loggerInstance = await Logger.deployed()
    nativeTokenInstance = await SmartToken.deployed()
    communityLauncherInstance = await CommunityLauncher.deployed()
    smartTokenFactoryInstance = await SmartTokenFactory.deployed()
    communityAccountFactoryInstance = await CommunityAccountFactory.deployed()
    communityAccountFactoryInstance = await CommunityAccountFactory.deployed()
    registrarFactoryInstance = await RegistrarFactory.deployed()
    communityFactoryInstance = await CommunityFactory.deployed()
  })
  describe("It should test the launcher", function() {
    const sender = web3.eth.accounts[0]
    const curator = web3.eth.accounts[0]
    const nonCurator = web3.eth.accounts[5]
    const voteController = curator
   
    it("It should launch a new community contract when calling launchCommunity()", async function () {
      const minimumStakingRequirement = 10
      const lockupPeriod = 0
      const launchUuid = 123
      const totalSupply = 1000000
      const tokenDecimals = 18

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
      const launchedCommunityInstance = await Community.at(launchedCommunityAddresses.slice(-1)[0])
      
      // all the variables that are set on the contract
      const community_minimumStakingRequirement = await launchedCommunityInstance.minimumStakingRequirement()
      const community_nativeTokenContractAddress = await launchedCommunityInstance.nativeTokenInstance()
      const community_voteController = await launchedCommunityInstance.voteController()
      const launchedEvent = Bluebird.promisify(communityLauncherInstance.Launched)()
      return launchedEvent.then( (result) => {
        assert(launchedCommunityInstance.communityTokenInstance)
        assert(launchedCommunityAddresses.length > 0)
        assert(launchedCommunityRegistrarAddress.length > 0)
        assert(result.args.launchUuid.toString() === launchUuid.toString())
        assert(community_minimumStakingRequirement.toString() === minimumStakingRequirement.toString())
        assert(community_nativeTokenContractAddress === nativeTokenInstance.address)
        assert(community_voteController === voteController)
      }).catch((rejected) => {
        assert(false, rejected)
      })
    })

    it("It should fail when a non-owner attempts to launch a new community when calling launchCommunity()", async function () {
      const minimumStakingRequirement = 10
      const lockupPeriod = 0
      const launchUuid = 123
      const totalSupply = 1000000
      const tokenDecimals = 18

      // The community launcher needs momentary access to the logger so it can permission the community to use it
      await loggerInstance.transferOwnershipNow(communityLauncherInstance.address)
      try {
        await communityLauncherInstance.launchCommunity(
          [launchUuid, minimumStakingRequirement, lockupPeriod, totalSupply, tokenDecimals],
          [curator, nativeTokenInstance.address, voteController, loggerInstance.address, smartTokenFactoryInstance.address, communityAccountFactoryInstance.address, registrarFactoryInstance.address, communityFactoryInstance.address],
          'Test Community 1',
          'TT1',
          '1.0', {from: nonCurator})
       
        // all the variables that are set on the contract
        const launchedEvent = Bluebird.promisify(communityLauncherInstance.Launched)()

        return launchedEvent.then(() => {
          assert(false)
        }).catch((rejected) => {
          assert(true, rejected)
        })
      } catch (error) {
        assert(true)
      }
    })
  })
})

