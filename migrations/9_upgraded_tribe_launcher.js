const UpgradedTribeLauncher = artifacts.require("./UpgradedTribeLauncher.sol");
const SmartTokenFactory = artifacts.require("./SmartTokenFactory.sol");

module.exports = function(deployer, network, accounts) {
  return deployer.deploy(UpgradedTribeLauncher, SmartTokenFactory.address, {gas: 10000000})
};