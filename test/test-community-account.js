const CommunityAccountFactory = artifacts.require("CommunityAccountFactory")
const CommunityAccount = artifacts.require("CommunityAccount")

contract('CommunityAccount', function () {
  const curator = web3.eth.accounts[0]
  const nonCurator = web3.eth.accounts[1]

  let communityAccountInstance

  beforeEach(async () => {
    
    communityAccountFactoryInstance = await CommunityAccountFactory.deployed()
    let communityAccount = await communityAccountFactoryInstance.create()
    communityAccountInstance = CommunityAccount.at(communityAccount.receipt.logs[0].address)
  })

  describe("It should test the community account", function() {
    
    it("It should setStakedBalances", async function () {

      let newStakedBalances = 100
      let before = await communityAccountInstance.stakedBalances(curator)
      try {
        await communityAccountInstance.setStakedBalances(newStakedBalances, curator,{from:curator})
      } catch (error) {
        let after = await communityAccountInstance.stakedBalances(curator)
        assert( after.toString() === before.toString()) 
      }
    })

    it("It should fail to setStakedBalances if not curator", async function () {

      let newStakedBalances = 100
      let before = await communityAccountInstance.stakedBalances(curator)
      try {
        await communityAccountInstance.setStakedBalances(newStakedBalances, curator, {from:nonCurator})
      } catch (error) {
        let after = await communityAccountInstance.stakedBalances(curator)
        assert( after.toString() === before.toString()) 
      }
    })

    it("It should setTotalStaked", async function () {

      let newtotalStaked = 100
      await communityAccountInstance.setTotalStaked(newtotalStaked,{from:curator})
      let after = await communityAccountInstance.totalStaked()
      assert( after.toString() === newtotalStaked.toString())
    })

    it("It should fail to setTotalStaked if not curator", async function () {

      let newtotalStaked = 100
      let before = await communityAccountInstance.totalStaked()
      try {
        await communityAccountInstance.setTotalStaked(newtotalStaked,{from:nonCurator})
      } catch (error) {
        let after = await communityAccountInstance.totalStaked()
        assert( after.toString() === before.toString()) 
      }
    })
    
    it("It should setEscrowedTaskBalances", async function () {

      let newescrowedTaskBalances = 100
      await communityAccountInstance.setEscrowedTaskBalances(1, newescrowedTaskBalances,{from:curator})
      let after = await communityAccountInstance.escrowedTaskBalances(1)
      assert( after.toString() === newescrowedTaskBalances.toString())
    })
    
    it("It should fair to setEscrowedTaskBalances if not curator", async function () {

      let newescrowedTaskBalances = 100
      let before = await communityAccountInstance.escrowedTaskBalances(1)
      try {
        await communityAccountInstance.setEscrowedTaskBalances(1, newescrowedTaskBalances,{from:nonCurator})
      } catch (error) {
        let after = await communityAccountInstance.escrowedTaskBalances(1)
        assert( after.toString() === before.toString())
      }
    })
    
    it("It should setEscrowedProjectBalances", async function () {

      let newescrowedProjectBalances = 100
      await communityAccountInstance.setEscrowedProjectBalances(1,newescrowedProjectBalances,{from:curator} )
      let after = await communityAccountInstance.escrowedProjectBalances(1)
      assert( after.toString() === newescrowedProjectBalances.toString())
    })
    
    it("It should fail to setEscrowedProjectBalances if not curator", async function () {

      let newescrowedProjectBalances = 100
      let before = await communityAccountInstance.escrowedProjectBalances(1)
      try {
        await communityAccountInstance.setEscrowedProjectBalances(1,newescrowedProjectBalances,{from:nonCurator} )
      } catch (error) {
        let after = await communityAccountInstance.escrowedProjectBalances(1)
        assert( after.toString() === before.toString())          
      }
    })
    
    it("It should setEscrowedProjectPayees", async function () {

      await communityAccountInstance.setEscrowedProjectPayees(1, curator,{from:curator})
      let after = await communityAccountInstance.escrowedProjectPayees(1)
      assert( after.toString() === curator)
    })
    
    it("It should fail to setEscrowedProjectPayees if not curator", async function () {

      await communityAccountInstance.setEscrowedProjectPayees(1, curator,{from:curator})
      let before = await communityAccountInstance.escrowedProjectPayees(1)

      try {
        await communityAccountInstance.setEscrowedProjectPayees(1, nonCurator,{from:nonCurator})
      } catch (error) {
        let after = await communityAccountInstance.escrowedProjectPayees(1)
        assert( after.toString() === before.toString())
      }
    })
    
    it("It should setTotalTaskEscrow", async function () {

      let newtotalTaskEscrow = 100
      await communityAccountInstance.setTotalTaskEscrow(newtotalTaskEscrow,{from:curator})
      let after = await communityAccountInstance.totalTaskEscrow()
      assert( after.toString() === newtotalTaskEscrow.toString())
    })

    it("It should fair to setTotalTaskEscrow if not curator", async function () {

      let newtotalTaskEscrow = 100
      let before = await communityAccountInstance.totalTaskEscrow()
      try {
        await communityAccountInstance.setTotalTaskEscrow(newtotalTaskEscrow,{from:nonCurator})
      } catch (error) {
        let after = await communityAccountInstance.totalTaskEscrow()
        assert( after.toString() === before.toString())
      }
    })
    
    it("It should setTotalProjectEscrow", async function () {

      let newtotalProjectEscrow = 100
      await communityAccountInstance.setTotalProjectEscrow(newtotalProjectEscrow,{from:curator})
      let after = await communityAccountInstance.totalProjectEscrow()
      assert( after.toString() === newtotalProjectEscrow.toString())
    })
    
    it("It should fail to setTotalProjectEscrow if not curator", async function () {

      let newtotalProjectEscrow = 100
      let before = await communityAccountInstance.totalProjectEscrow()

      try {
        await communityAccountInstance.setTotalProjectEscrow(newtotalProjectEscrow,{from:nonCurator})
      } catch (error) {
        let after = await communityAccountInstance.totalProjectEscrow()
        assert( after.toString() === before.toString())
      }
    })

  })
})