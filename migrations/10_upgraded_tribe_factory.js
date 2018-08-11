const UpgradedTribeFactory = artifacts.require("./UpgradedTribeFactory.sol");

module.exports = function(deployer, network, accounts) {
  return deployer.then( () => deployer.deploy(UpgradedTribeFactory, {gas: 10000000}))
};
