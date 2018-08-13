const TribeAccountFactory = artifacts.require("TribeAccountFactory")
const TribeAccount = artifacts.require("TribeAccount")

contract('TribeAccount', function () {
  const curator = web3.eth.accounts[0]
  const nonCurator = web3.eth.accounts[1]

  let tribeAccountInstance

  beforeEach(async () => {
    
    tribeAccountFactoryInstance = await TribeAccountFactory.deployed()
    let tribeAccount = await tribeAccountFactoryInstance.create()
    tribeAccountInstance = TribeAccount.at(tribeAccount.receipt.logs[0].address)
  })

  describe("It should test the tribe account", function() {
    
    it("It should setStakedBalances", async function () {

      let newStakedBalances = 100
      let before = await tribeAccountInstance.stakedBalances(curator)
      try {
        await tribeAccountInstance.setStakedBalances(newStakedBalances, curator,{from:curator})
      } catch (error) {
        let after = await tribeAccountInstance.stakedBalances(curator)
        assert( after.toString() === before.toString()) 
      }
    })

    it("It should fail to setStakedBalances if not curator", async function () {

      let newStakedBalances = 100
      let before = await tribeAccountInstance.stakedBalances(curator)
      try {
        await tribeAccountInstance.setStakedBalances(newStakedBalances, curator, {from:nonCurator})
      } catch (error) {
        let after = await tribeAccountInstance.stakedBalances(curator)
        assert( after.toString() === before.toString()) 
      }
    })

    it("It should setTotalStaked", async function () {

      let newtotalStaked = 100
      await tribeAccountInstance.setTotalStaked(newtotalStaked,{from:curator})
      let after = await tribeAccountInstance.totalStaked()
      assert( after.toString() === newtotalStaked.toString())
    })

    it("It should fail to setTotalStaked if not curator", async function () {

      let newtotalStaked = 100
      let before = await tribeAccountInstance.totalStaked()
      try {
        await tribeAccountInstance.setTotalStaked(newtotalStaked,{from:nonCurator})
      } catch (error) {
        let after = await tribeAccountInstance.totalStaked()
        assert( after.toString() === before.toString()) 
      }
    })
    
    it("It should setEscrowedTaskBalances", async function () {

      let newescrowedTaskBalances = 100
      await tribeAccountInstance.setEscrowedTaskBalances(1, newescrowedTaskBalances,{from:curator})
      let after = await tribeAccountInstance.escrowedTaskBalances(1)
      assert( after.toString() === newescrowedTaskBalances.toString())
    })
    
    it("It should fair to setEscrowedTaskBalances if not curator", async function () {

      let newescrowedTaskBalances = 100
      let before = await tribeAccountInstance.escrowedTaskBalances(1)
      try {
        await tribeAccountInstance.setEscrowedTaskBalances(1, newescrowedTaskBalances,{from:nonCurator})
      } catch (error) {
        let after = await tribeAccountInstance.escrowedTaskBalances(1)
        assert( after.toString() === before.toString())
      }
    })
    
    it("It should setEscrowedProjectBalances", async function () {

      let newescrowedProjectBalances = 100
      await tribeAccountInstance.setEscrowedProjectBalances(1,newescrowedProjectBalances,{from:curator} )
      let after = await tribeAccountInstance.escrowedProjectBalances(1)
      assert( after.toString() === newescrowedProjectBalances.toString())
    })
    
    it("It should fail to setEscrowedProjectBalances if not curator", async function () {

      let newescrowedProjectBalances = 100
      let before = await tribeAccountInstance.escrowedProjectBalances(1)
      try {
        await tribeAccountInstance.setEscrowedProjectBalances(1,newescrowedProjectBalances,{from:nonCurator} )
      } catch (error) {
        let after = await tribeAccountInstance.escrowedProjectBalances(1)
        assert( after.toString() === before.toString())          
      }
    })
    
    it("It should setEscrowedProjectPayees", async function () {

      await tribeAccountInstance.setEscrowedProjectPayees(1, curator,{from:curator})
      let after = await tribeAccountInstance.escrowedProjectPayees(1)
      assert( after.toString() === curator)
    })
    
    it("It should fail to setEscrowedProjectPayees if not curator", async function () {

      await tribeAccountInstance.setEscrowedProjectPayees(1, curator,{from:curator})
      let before = await tribeAccountInstance.escrowedProjectPayees(1)

      try {
        await tribeAccountInstance.setEscrowedProjectPayees(1, nonCurator,{from:nonCurator})
      } catch (error) {
        let after = await tribeAccountInstance.escrowedProjectPayees(1)
        assert( after.toString() === before.toString())
      }
    })
    
    it("It should setTotalTaskEscrow", async function () {

      let newtotalTaskEscrow = 100
      await tribeAccountInstance.setTotalTaskEscrow(newtotalTaskEscrow,{from:curator})
      let after = await tribeAccountInstance.totalTaskEscrow()
      assert( after.toString() === newtotalTaskEscrow.toString())
    })

    it("It should fair to setTotalTaskEscrow if not curator", async function () {

      let newtotalTaskEscrow = 100
      let before = await tribeAccountInstance.totalTaskEscrow()
      try {
        await tribeAccountInstance.setTotalTaskEscrow(newtotalTaskEscrow,{from:nonCurator})
      } catch (error) {
        let after = await tribeAccountInstance.totalTaskEscrow()
        assert( after.toString() === before.toString())
      }
    })
    
    it("It should setTotalProjectEscrow", async function () {

      let newtotalProjectEscrow = 100
      await tribeAccountInstance.setTotalProjectEscrow(newtotalProjectEscrow,{from:curator})
      let after = await tribeAccountInstance.totalProjectEscrow()
      assert( after.toString() === newtotalProjectEscrow.toString())
    })
    
    it("It should fail to setTotalProjectEscrow if not curator", async function () {

      let newtotalProjectEscrow = 100
      let before = await tribeAccountInstance.totalProjectEscrow()

      try {
        await tribeAccountInstance.setTotalProjectEscrow(newtotalProjectEscrow,{from:nonCurator})
      } catch (error) {
        let after = await tribeAccountInstance.totalProjectEscrow()
        assert( after.toString() === before.toString())
      }
    })

  })
})