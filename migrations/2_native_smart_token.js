const SmartToken = artifacts.require("./SmartToken.sol");

const Web3 = require('web3')
const web3 = new Web3()
web3.setProvider(new Web3.providers.HttpProvider('http://localhost:8545'))

module.exports = function(deployer) {
    return deployer.deploy(Launcher)
}

module.exports = function(deployer) {
  deployer.deploy(SmartToken, 'Native', 1000000, 18, 'NTV', '1.0', web3.eth.accounts[0]);
};
