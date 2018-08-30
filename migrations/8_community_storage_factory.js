const CommunityAccountFactory = artifacts.require("./CommunityAccountFactory.sol");

module.exports = function(deployer, network, accounts) {
  return deployer.then( () => deployer.deploy(CommunityAccountFactory))
};
