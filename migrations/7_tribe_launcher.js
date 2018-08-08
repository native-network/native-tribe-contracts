const TribeLauncher = artifacts.require("./TribeLauncher.sol");
const SmartTokenFactory = artifacts.require("./SmartTokenFactory.sol");

module.exports = function(deployer, network, accounts) {
  return deployer.deploy(TribeLauncher, SmartTokenFactory.address, {gas: 10000000})
};