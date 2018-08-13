const RegistrarFactory = artifacts.require("./RegistrarFactory.sol");

module.exports = function(deployer, network, accounts) {
  return deployer.then( () => deployer.deploy(RegistrarFactory))
};
