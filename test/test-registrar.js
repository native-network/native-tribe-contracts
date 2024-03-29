const RegistrarFactory = artifacts.require("RegistrarFactory")
const Registrar = artifacts.require("Registrar")

contract('Registrar', function () {

  const curator = web3.eth.accounts[0]
  const nonCurator = web3.eth.accounts[1]
  let registrarInstance

  beforeEach(async () => {

    registrarFactoryInstance = await RegistrarFactory.deployed()
    let tx = await registrarFactoryInstance.create()
    registrarInstance = Registrar.at(tx.receipt.logs[0].address)
    await registrarInstance.addNewAddress(curator)
  })

  describe("It should test the Registrar", function() {
    

    it("It should only allow the curator to add new address", async function () {

      let startingAddresses = await registrarInstance.getAddresses({from: curator})
      await registrarInstance.addNewAddress(nonCurator, {from: curator})
      let endingAddresses = await registrarInstance.getAddresses({from: curator})
      assert(endingAddresses.length === startingAddresses.length + 1)
    })

    it("It should fail if a non-curator tries to add new address", async function () {

      let startingAddresses = await registrarInstance.getAddresses({from: curator})
      try {
        await registrarInstance.addNewAddress(nonCurator, {from: nonCurator})  
      } catch (error) {
        let endingAddresses = await registrarInstance.getAddresses({from: curator})
        assert(startingAddresses.length === endingAddresses.length)
      }
    })

  })
})
