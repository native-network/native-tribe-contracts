const TribeFactory = artifacts.require("./TribeFactory.sol");

module.exports = function(deployer, network, accounts) {
  return deployer.then( () => deployer.deploy(TribeFactory))
};
