const TribeAccountFactory = artifacts.require("./TribeAccountFactory.sol");

module.exports = function(deployer, network, accounts) {
  return deployer.then( () => deployer.deploy(TribeAccountFactory))
};
