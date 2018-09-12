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
const gas = 6000000

// Rinkeby native token address.  This should mever change.
const nativeTokenAddress = '0xd658c07a0e6edcce8e9983e4c9206dc37a746258'

async function startTokenSale(params, type) {
  
  console.log('Initializing token sale', params, type)
  
  const tokenInstance = await SmartToken.at(params.tokenAddress)

  if(type === 'eth') {
    console.log('initializeTokenSaleWithToken')
    return await tokenInstance.initializeTokenSaleWithToken(
      params.startTime,
      params.endTime,
      params.price,
      params.amountForSale,
      params.beneficiary,
      params.nativeTokenAddress,
      {from, gas, gasPrice})
  }
  else {
    console.log('initializeSale')
    return await tokenInstance.initializeTokenSale(
    params.startTime,
    params.endTime,
    params.price,
    params.amountForSale,
    params.beneficiary,
    {from, gas, gasPrice})
  }

}

// Set these parameters before each tribe launch

// This was used to start the native token sale on rinkeby
/*
const saleType = 'eth'
const params = {
  tokenAddress: '0xd658c07a0e6edcce8e9983e4c9206dc37a746258',
  nativeTokenAddress,
  startTime: Math.floor(Date.now() / 1000), // now
  endTime: Math.floor(Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30)), // 30 days from now
  price: 2142857143000000,
  amountForSale: 2000000,
  beneficiary: from,
}
*/

// This was used to start the earth guardians token sale on rinkeby
/*
const saleType = 'token'
const params = {
  tokenAddress: '0x421c789e71c360286d4173ed3ff580fb7aecc902',
  nativeTokenAddress,
  startTime: Math.floor(Date.now() / 1000), // now
  endTime: Math.floor(Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30)), // 30 days from now
  price: 1,
  amountForSale: 857142,
  beneficiary: from,
}
*/

// This was used to start the imaginal films token sale on rinkeby
/*
const saleType = 'token'
const params = {
  tokenAddress: '0x70964a47be7cd215a798db7b8dec3316a9b2bab6',
  nativeTokenAddress,
  startTime: Math.floor(Date.now() / 1000), // now
  endTime: Math.floor(Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30)), // 30 days from now
  price: 1,
  amountForSale: 857142,
  beneficiary: from,
}
*/

startTokenSale(params, saleType).then( (res) => {
  console.log('Token Sale done', res)
})