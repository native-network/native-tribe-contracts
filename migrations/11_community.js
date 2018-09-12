const SmartToken = artifacts.require("./SmartToken.sol");
const CommunityAccount = artifacts.require("./CommunityAccount.sol");
const Community = artifacts.require("./Community.sol");
const Logger = artifacts.require("./Logger.sol");
const Registrar = artifacts.require("./Registrar.sol");

module.exports = async function(deployer, network, accounts) {

  // 50 gwei
  const gasPrice = 5e10
  const fromAccount = accounts[0]
  // Rinkeby logger address.  This should never change
  const loggerAddress = '0x821c29c1fb3582e6447cb53cc6af62b5c8bb20f8'
  // Rinkeby native token address.  This should never change
  const nativeTokenAddress = '0xd658c07a0e6edcce8e9983e4c9206dc37a746258'


  // Change below parameters for every different launched community
  
  // This was used to launch native on rinkeby
  /*
  const name = 'Native'
  const tokenSymbol='NTV'
  const minimumStakingRequirement = 200
  const lockupPeriodSeconds = 7776000

  const tokenVersion = '1.0'
  const totalSupply = 0 // Set to 0 because we set this in the token sale initialization
  const tokenDecimals = 18
  */

  // This was used to launch Earth Guardians on rinkeby
  /*
  const name = 'Earth Guardians'
  const tokenSymbol='EGT'
  const minimumStakingRequirement = 200
  const lockupPeriodSeconds = 7776000

  const tokenVersion = '1.0'
  const totalSupply = 0 // Set to 0 because we set this in the token sale initialization
  const tokenDecimals = 18
  */

  // This was used to launch Imaginal Films on rinkeby
  /*
  const name = 'Imaginal Films'
  const tokenSymbol='IFT'
  const minimumStakingRequirement = 250
  const lockupPeriodSeconds = 7776000

  const tokenVersion = '1.0'
  const totalSupply = 0 // Set to 0 because we set this in the token sale initialization
  const tokenDecimals = 18
  */

  // This was used to Future of Humanity on rinkeby
  /*
  const name = 'Future of Humanity'
  const tokenSymbol='SDG'
  const minimumStakingRequirement = 285
  const lockupPeriodSeconds = 7776000

  const tokenVersion = '1.0'
  const totalSupply = 0 // Set to 0 because we set this in the token sale initialization
  const tokenDecimals = 18
  */

  // This was used to Peace Accelerators on rinkeby
  /*
  const name = 'Peace Accelerators'
  const tokenSymbol='PAT'
  const minimumStakingRequirement = 95
  const lockupPeriodSeconds = 7776000

  const tokenVersion = '1.0'
  const totalSupply = 0 // Set to 0 because we set this in the token sale initialization
  const tokenDecimals = 18
  */

  // This was used to Odyssy on rinkeby
  /*
  const name = 'Odyssy'
  const tokenSymbol='DOLO'
  const minimumStakingRequirement = 500
  const lockupPeriodSeconds = 7776000

  const tokenVersion = '1.0'
  const totalSupply = 0 // Set to 0 because we set this in the token sale initialization
  const tokenDecimals = 18
  */
  
  console.log('Launching community', name)  

  let communityAccountAddress
  let communityTokenAddress
  let communityAddress

  await deployer
    .then( async () => {
      
      console.log('using gasPrice: ', gasPrice)
      return deployer.deploy(SmartToken, name, totalSupply, tokenDecimals, tokenSymbol, tokenVersion, accounts[0], {gasPrice, from: fromAccount})
    })
    .then( (res) => {
      communityTokenAddress = res.address
      return deployer.deploy(CommunityAccount, {gasPrice, from: fromAccount})
    })
    .then( async (res) => {
      communityAccountAddress = res.address
      const curator = accounts[0]
      const voteController = curator
      return deployer.deploy(
        Community,
        minimumStakingRequirement,
        lockupPeriodSeconds,
        curator,
        communityTokenAddress,
        nativeTokenAddress,
        voteController,
        loggerAddress,
        communityAccountAddress)
    }, {gasPrice, from: fromAccount})
    .then( async (res) => {
      communityAddress = res.address
      const communityAccountInstance = await CommunityAccount.deployed()
      await communityAccountInstance.transferOwnershipNow(communityAddress)
    })
    .then( async () => {
      return deployer.deploy(Registrar, {gasPrice, from: fromAccount})
    }).then(async () => {
      const registrarInstance = await Registrar.deployed()
      await registrarInstance.addNewAddress(communityAddress);
      const loggerInstance = await Logger.at(loggerAddress)
      await loggerInstance.addNewLoggerPermission(communityAddress)
    })

    console.log('COMMUNITY LAUNCHED', name)
    console.log('Registrar:', (await Registrar.deployed()).address)
    console.log('Community:', communityAddress)
    console.log('Community Account:', communityAccountAddress)
    console.log('Community Token:', communityTokenAddress)

}
