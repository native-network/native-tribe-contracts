const UpgradedCommunityLauncher = artifacts.require("./UpgradedCommunityLauncher.sol");
const SmartTokenFactory = artifacts.require("./SmartTokenFactory.sol");

module.exports = function(deployer, network, accounts) {
  return deployer.deploy(UpgradedCommunityLauncher, SmartTokenFactory.address)
};