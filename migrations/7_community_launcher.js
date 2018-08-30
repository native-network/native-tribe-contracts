const CommunityLauncher = artifacts.require("./CommunityLauncher.sol");
const SmartTokenFactory = artifacts.require("./SmartTokenFactory.sol");

module.exports = function(deployer, network, accounts) {
  return deployer.deploy(CommunityLauncher, SmartTokenFactory.address)
};