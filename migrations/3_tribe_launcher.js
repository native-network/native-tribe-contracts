const TribeLauncher = artifacts.require("./TribeLauncher.sol");

module.exports = function(deployer) {
  deployer.deploy(TribeLauncher);
};
