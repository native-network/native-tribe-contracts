const RegistrarFactory = artifacts.require("RegistrarFactory");
const SmartTokenFactory = artifacts.require("SmartTokenFactory");
const TribeFactory = artifacts.require("TribeFactory");
const TribeStorageFactory = artifacts.require("TribeStorageFactory");

const Registrar = artifacts.require("Registrar");
const SmartToken = artifacts.require("SmartToken");
const Tribe = artifacts.require("Tribe");
const TribeStorage = artifacts.require("TribeStorage");

contract('Factory Testing', function (accounts) {

  beforeEach(async () => {

  })
  
  describe.only("It should test the factories", function() {
    
    it("It should demonstrate RegistrarFactory launching a new registrar", async function () {
      const registrarFactoryInstance = await RegistrarFactory.deployed({from: accounts[0]})
      let tx = await registrarFactoryInstance.create({from: accounts[0]});
      const registrarInstance = Registrar.at(tx.receipt.logs[0].address)
      const owner = await registrarInstance.owner()
      assert(owner === accounts[0])
    })

    it("It should demonstrate SmartTokenFactory launching a new token", async function () {
      const smartTokenFactoryInstance = await SmartTokenFactory.deployed({from: accounts[0]})
      
      let tx = await smartTokenFactoryInstance.create('test', 10000, 18,'test', 'test', accounts[0], {from: accounts[0]});
      const smartTokenInstance = SmartToken.at(tx.receipt.logs[0].address)
      const owner = await smartTokenInstance.owner()
      assert(owner === accounts[0])
    })

    it("It should demonstrate TribeStorageFactory launching a new storage", async function () {
      const tribeStorageFactoryInstance = await TribeStorageFactory.deployed({from: accounts[0]})
      let tx = await tribeStorageFactoryInstance.create({from: accounts[0]});
      const tribeStorageInstance = TribeStorage.at(tx.receipt.logs[0].address)
      const owner = await tribeStorageInstance.owner()
      assert(owner === accounts[0])
    })
    
    // TODO figure out why we arent getting back the launched address in the logs
    /*
    it("It should demonstrate TribeFactory launching a new tribe", async function () {
      const tribeFactoryInstance = await TribeFactory.deployed({from: accounts[0]})
      
      let tx = await tribeFactoryInstance.create(1000, 1000, accounts[0], '0x0', '0x0', '0x0', '0x0', '0x0', {from: accounts[0]});
      
      console.log('tx', tx)
      
      const tribeInstance = Tribe.at(tx.receipt.logs[0].address)
      const curator = await tribeInstance.curator()
      assert(curator === accounts[0])
    })
    */

  })
  
})