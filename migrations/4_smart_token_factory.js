const SmartTokenFactory = artifacts.require("./SmartTokenFactory.sol");

module.exports = function(deployer, network, accounts) {
  return deployer.then( () => deployer.deploy(SmartTokenFactory, {gas: 10000000}))
};
