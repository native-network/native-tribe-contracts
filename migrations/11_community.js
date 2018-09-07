const SmartToken = artifacts.require("./SmartToken.sol");
const CommunityAccount = artifacts.require("./CommunityAccount.sol");
const Community = artifacts.require("./Community.sol");
const Logger = artifacts.require("./Logger.sol");
const Registrar = artifacts.require("./Registrar.sol");

module.exports = function(deployer, network, accounts) {
  
  let communityAccountAddress
  let communityTokenAddress
  let nativeTokenAddress
  let communityAddress
  
  return deployer
    .then( async () => {
      console.log('1')
      nativeTokenAddress = (await SmartToken.deployed()).address
      
      const name = 'name'
      const totalSupply = 10000
      const tokenDecimals = 18
      const tokenSymbol='test'
      const tokenVersion = '1.0'
      
      return deployer.deploy(SmartToken, name, totalSupply, tokenDecimals, tokenSymbol, tokenVersion, accounts[0])})
    .then( (res) => {
      console.log('2')
      communityTokenAddress = res.address
      return deployer.deploy(CommunityAccount)
    })
    .then( async (res) => {
      console.log('3')
      communityAccountAddress = res.address
      
      const minimumStakingRequirement = 1000
      const lockupPeriodSeconds = 0
      const curator = accounts[0]
      const communityTokenContractAddress = communityTokenAddress
      const nativeTokenContractAddress = nativeTokenAddress
      const voteController = curator
      const loggerContractAddress = (await Logger.deployed()).address
      const communityAccountContractAddress = communityAccountAddress
      
      // console.log('minimumStakingRequirement', minimumStakingRequirement)
      // console.log('lockupPeriodSeconds', lockupPeriodSeconds)
      // console.log('curator', curator)
      // console.log('communityTokenContractAddress', communityTokenContractAddress)
      // console.log('nativeTokenContractAddress', nativeTokenContractAddress)
      // console.log('voteController', voteController)
      // console.log('loggerContractAddress', loggerContractAddress)
      // console.log('communityAccountContractAddress', communityAccountContractAddress)

      return deployer.deploy(
        Community, 
        minimumStakingRequirement, 
        lockupPeriodSeconds, 
        curator, 
        communityTokenContractAddress, 
        nativeTokenContractAddress, 
        voteController, 
        loggerContractAddress, 
        communityAccountContractAddress)
    })
    .then( async (res) => {
      console.log('4')
      communityAddress = res.address
      const communityAccountInstance = await CommunityAccount.deployed()
      const result = await communityAccountInstance.transferOwnershipNow(communityAddress)
      console.log('communityAccountInstance.transferOwnershipNow', result.receipt.status)
    })
    .then( async () => {
      console.log('5')
      return deployer.deploy(Registrar)
    }).then(async () => {
      console.log('6')
      const loggerInstance = await Logger.deployed()
      const result = await loggerInstance.addNewLoggerPermission(communityAddress)
      console.log('loggerInstance.addNewLoggerPermission', result.receipt.status)
    })
}
