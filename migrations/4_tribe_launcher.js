const TribeLauncher = artifacts.require("./TribeLauncher.sol");
const Logger = artifacts.require("./Logger.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(TribeLauncher, Logger.address)
  .then(( resolved ) => {

  TribeLauncher.deployed()
  .then((tribeLauncherInstance ) => {


    console.log('tribbbbbeeeeeeeeee', tribeLauncherInstance.address)
    Logger.transferOwnership(tribeLauncherInstance.address);
  })
      
})
};