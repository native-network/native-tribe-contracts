const Migrations = artifacts.require("./Migrations.sol");

module.exports = function(deployer) {
  return deployer.then( () => deployer.deploy(Migrations))

};
