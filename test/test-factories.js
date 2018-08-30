const RegistrarFactory = artifacts.require("RegistrarFactory")
const SmartTokenFactory = artifacts.require("SmartTokenFactory")
const CommunityFactory = artifacts.require("CommunityFactory")
const CommunityAccountFactory = artifacts.require("CommunityAccountFactory")
const Registrar = artifacts.require("Registrar")
const SmartToken = artifacts.require("SmartToken")
const Community = artifacts.require("Community")
const CommunityAccount = artifacts.require("CommunityAccount")

contract('Factory Testing', function (accounts) {

  describe("It should test the factories", function() {

    it("It should demonstrate RegistrarFactory launching a new registrar", async function () {

      const registrarFactoryInstance = await RegistrarFactory.deployed({from: accounts[0]})
      let tx = await registrarFactoryInstance.create({from: accounts[0]})
      const registrarInstance = Registrar.at(tx.receipt.logs[0].address)
      const owner = await registrarInstance.owner()
      assert(owner === accounts[0])
    })

    it("It should demonstrate SmartTokenFactory launching a new token", async function () {

      const smartTokenFactoryInstance = await SmartTokenFactory.deployed({from: accounts[0]})      
      let tx = await smartTokenFactoryInstance.create('test', 10000, 18,'test', 'test', accounts[0], {from: accounts[0]})
      const smartTokenInstance = SmartToken.at(tx.receipt.logs[0].address)
      const owner = await smartTokenInstance.owner()
      assert(owner === accounts[0])
    })

    it("It should demonstrate CommunityAccountFactory launching a new storage", async function () {

      const communityAccountFactoryInstance = await CommunityAccountFactory.deployed({from: accounts[0]})
      let tx = await communityAccountFactoryInstance.create({from: accounts[0]})
      const communityAccountInstance = CommunityAccount.at(tx.receipt.logs[0].address)
      const owner = await communityAccountInstance.owner()
      assert(owner === accounts[0])
    })
  })
  
})