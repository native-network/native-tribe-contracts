const SmartToken = artifacts.require("./SmartToken.sol");
const Logger = artifacts.require("./Logger.sol");

module.exports = function(deployer, network, accounts) {
  console.log('bar--------------')
  deployer.deploy(SmartToken, 'Native', 1000000000000, 18, 'NTV', '1.0', accounts[0], Logger.address)
};
