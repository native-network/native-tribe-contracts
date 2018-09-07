const Web3 = require('web3')
const web3 = new Web3()
const provider = new web3.providers.HttpProvider('http://localhost:8545')
web3.setProvider(provider)
const contract = require('truffle-contract')

// Contracts already deployed during migration
const Logger = contract(require('./build/contracts/Logger.json'))
const SmartToken = contract(require('./build/contracts/SmartToken.json'))
const CommunityLauncher = contract(require('./build/contracts/CommunityLauncher.json'))
const SmartTokenFactory = contract(require('./build/contracts/SmartTokenFactory.json'))
const CommunityAccountFactory = contract(require('./build/contracts/CommunityAccountFactory.json'))
const RegistrarFactory = contract(require('./build/contracts/RegistrarFactory.json'))
const CommunityFactory = contract(require('./build/contracts/CommunityFactory.json'))
// contracts not yet deployed
const Registrar = contract(require('./build/contracts/Registrar.json'))
const Community = contract(require('./build/contracts/Community.json'))

Logger.setProvider(provider)
SmartToken.setProvider(provider)
CommunityLauncher.setProvider(provider)
SmartTokenFactory.setProvider(provider)
CommunityAccountFactory.setProvider(provider)
RegistrarFactory.setProvider(provider)
CommunityFactory.setProvider(provider)
Registrar.setProvider(provider)
Community.setProvider(provider)

const from = web3.eth.accounts[0]
const gasPrice = web3.toWei('1', 'gwei')
const gas = 8000000

let name
let symbol
let version
let curator
let voteController
let minimumStakingRequirement
let launchUuid
let totalSupply
let lockupPeriod
let tokenDecimals
async function launchCommunity(name, symbol, version, curator, voteController, minimumStakingRequirement, launchUuid, totalSupply, lockupPeriod, tokenDecimals) {

  const loggerInstance = await Logger.deployed()
  const nativeTokenInstance = await SmartToken.deployed()
  const communityLauncherInstance = await CommunityLauncher.deployed()
  const smartTokenFactoryInstance = await SmartTokenFactory.deployed()
  const communityStorageFactoryInstance = await CommunityAccountFactory.deployed()
  const registrarFactoryInstance = await RegistrarFactory.deployed()
  const communityFactorInstance = await CommunityFactory.deployed()
  const res1 = await loggerInstance.transferOwnershipNow(communityLauncherInstance.address, {from, gasPrice, gas})

  console.log('res1', res1)
  
  console.log('about to launch community')
  await communityLauncherInstance.launchCommunity(
    [
      launchUuid,
      minimumStakingRequirement,
      lockupPeriod,
      totalSupply,
      tokenDecimals,
    ],
    [
      curator,
      nativeTokenInstance.address,
      voteController,
      loggerInstance.address,
      smartTokenFactoryInstance.address,
      communityStorageFactoryInstance.address,
      registrarFactoryInstance.address,
      communityFactorInstance.address,
    ],
    name,
    symbol,
    version,
    {from, gasPrice, gas}
  )

  const launchedCommunityCount = await communityLauncherInstance.launchedCommunityCount()
  const registrarAddress = await communityLauncherInstance.launchedCommunityRegistrars(launchedCommunityCount - 1)

  const communityRegistrar = await Registrar.at(registrarAddress)
  const launchedCommunityAddresses = await communityRegistrar.getAddresses()
  const communityInstance = await Community.at(launchedCommunityAddresses.slice(-1)[0])
  const communityTokenAddress = await communityInstance.communityTokenInstance()
  const communityAccountAddress = await communityInstance.communityAccount()

  console.log('launched', name)
  console.log('registrarAddress', registrarAddress)
  console.log('communityTokenAddress:', communityTokenAddress);
  console.log('communityInstance.address', communityInstance.address);
  console.log('communityAccountAddress:', communityAccountAddress);
  console.log('loggerInstance.address', loggerInstance.address);
  console.log('Curator Address:', curator);
  console.log('')

}
async function launchAllCommunities() {
  
  name = 'Native'
  symbol = 'NTV'
  version = '1.0'
  curator = web3.eth.accounts[0]
  voteController = web3.eth.accounts[0]
  minimumStakingRequirement = 200
  launchUuid = 1
  totalSupply = 2000000
  lockupPeriod = 0
  tokenDecimals = 18
  await launchCommunity(name, symbol, version, curator, voteController, minimumStakingRequirement, launchUuid, totalSupply, lockupPeriod, tokenDecimals)

  /*
  name = 'Earth Guardians'
  symbol = 'EGCC'
  version = '1.0'
  curator = web3.eth.accounts[0]
  voteController = web3.eth.accounts[0]
  minimumStakingRequirement = 100
  launchUuid = 1
  totalSupply = 1000000
  lockupPeriod = 0
  tokenDecimals = 18
  await launchCommunity(name, symbol, version, curator, voteController, minimumStakingRequirement, launchUuid, totalSupply, lockupPeriod, tokenDecimals)

  name = 'Imaginal Films'
  symbol = 'IFCC'
  version = '1.0'
  curator = web3.eth.accounts[0]
  voteController = web3.eth.accounts[0]
  minimumStakingRequirement = 100
  launchUuid = 1
  totalSupply = 1000000
  lockupPeriod = 0
  tokenDecimals = 18
  await launchCommunity(name, symbol, version, curator, voteController, minimumStakingRequirement, launchUuid, totalSupply, lockupPeriod, tokenDecimals)

  name = 'Cloud Collective'
  symbol = 'CCCC'
  version = '1.0'
  curator = web3.eth.accounts[0]
  voteController = web3.eth.accounts[0]
  minimumStakingRequirement = 100
  launchUuid = 1
  totalSupply = 1000000
  lockupPeriod = 0
  tokenDecimals = 18
  await launchCommunity(name, symbol, version, curator, voteController, minimumStakingRequirement, launchUuid, totalSupply, lockupPeriod, tokenDecimals)
  */

}
launchAllCommunities()