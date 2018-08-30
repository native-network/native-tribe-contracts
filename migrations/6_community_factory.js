const CommunityFactory = artifacts.require("./CommunityFactory.sol");

module.exports = function(deployer, network, accounts) {
  return deployer.then( () => deployer.deploy(CommunityFactory))
};
