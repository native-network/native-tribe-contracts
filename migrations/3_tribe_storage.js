const TribeStorage = artifacts.require("./TribeStorage.sol");

module.exports = function(deployer) {
  console.log('ba=============')
  deployer.deploy(TribeStorage)
  .then(( ) => {
    console.log('bar')
  })
};

