const UpgradedCommunityFactory = artifacts.require("./UpgradedCommunityFactory.sol");

module.exports = function(deployer, network, accounts) {
  return deployer.then( () => deployer.deploy(UpgradedCommunityFactory))
};
