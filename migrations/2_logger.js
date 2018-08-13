const Logger = artifacts.require("./Logger.sol");

module.exports = function(deployer) {
  return deployer.then( () => deployer.deploy(Logger))
};
