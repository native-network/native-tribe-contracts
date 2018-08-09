const TribeStorageFactory = artifacts.require("./TribeStorageFactory.sol");

module.exports = function(deployer, network, accounts) {
  return deployer.then( () => deployer.deploy(TribeStorageFactory, {gas: 10000000}))
};
