const SmartToken = artifacts.require("./SmartToken.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(SmartToken, 'Native', 1000000000000, 18, 'NTV', '1.0', accounts[0]);
};
