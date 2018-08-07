const TribeLauncher = artifacts.require("./TribeLauncher.sol");
const Logger = artifacts.require("./Logger.sol");
const TribeStorage = artifacts.require("./TribeStorage.sol");

module.exports = function(deployer, network, accounts) {
  console.log('ever even here?1')
  deployer.deploy(TribeLauncher, Logger.address, TribeStorage.address)
  .then(( resolved ) => {
    console.log('ever even here?2')
    //  TribeLauncher.deployed()
    //  .then(( r ) => {
    //    console.log('r');
    //  }).catch(( rejected ) => {
    //    console.log('rrrrr', rejected)
    //  })
    //  console.log('4-x', resolved.address)  
  }).catch(( rejected ) => {
    console.log('rejected-', rejected)
  })
};