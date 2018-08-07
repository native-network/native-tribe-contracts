const TribeStorage = artifacts.require("./TribeStorage.sol");

module.exports = function(deployer) {
  deployer.deploy(TribeStorage);
};

