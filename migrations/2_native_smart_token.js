const SmartToken = artifacts.require("./SmartToken.sol");

module.exports = function(deployer) {
  deployer.deploy(SmartToken, 'Native', 1000000, 18, 'NTV', '1.0');
};
