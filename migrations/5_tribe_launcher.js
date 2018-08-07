const TribeLauncher = artifacts.require("./TribeLauncher.sol");
const Logger = artifacts.require("./Logger.sol");
const TribeStorage = artifacts.require("./TribeStorage.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(TribeLauncher, Logger.address, TribeStorage.address);
};