const TribeStorageFactory = artifacts.require("TribeStorageFactory");
const TribeStorage = artifacts.require("TribeStorage");

contract('TribeStorage', function () {
  const curator = web3.eth.accounts[0]
  const nonCurator = web3.eth.accounts[1]

  let tribeStorageInstance

  beforeEach(async () => {
    
    tribeStorageFactoryInstance = await TribeStorageFactory.deployed()
    let tribeStorage = await tribeStorageFactoryInstance.create();
    tribeStorageInstance = TribeStorage.at(tribeStorage.receipt.logs[0].address)
  })

  describe("It should test the tribe account", function() {
    
    it("It should setStakedBalances", async function () {
      let newStakedBalances = 100;
      let before = await tribeStorageInstance.stakedBalances(curator);
      try {
        await tribeStorageInstance.setStakedBalances(newStakedBalances, curator,{from:curator});
      } catch (error) {
        let after = await tribeStorageInstance.stakedBalances(curator);
        assert( after.toString() === before.toString()) 
      }
    })
    it("It should fail to setStakedBalances if not curator", async function () {
      let newStakedBalances = 100;
      let before = await tribeStorageInstance.stakedBalances(curator);
      try {
        await tribeStorageInstance.setStakedBalances(newStakedBalances, curator,{from:nonCurator});
      } catch (error) {
        let after = await tribeStorageInstance.stakedBalances(curator);
        assert( after.toString() === before.toString()) 
      }
    })
    it("It should setTotalStaked", async function () {
      let newtotalStaked = 100;
      await tribeStorageInstance.setTotalStaked(newtotalStaked,{from:curator});
      let after = await tribeStorageInstance.totalStaked();
      assert( after.toString() === newtotalStaked.toString())
    })
    it("It should fail to setTotalStaked if not curator", async function () {
      let newtotalStaked = 100;
      let before = await tribeStorageInstance.totalStaked();
      try {
        await tribeStorageInstance.setTotalStaked(newtotalStaked,{from:nonCurator});
      } catch (error) {
        let after = await tribeStorageInstance.totalStaked();
        assert( after.toString() === before.toString()) 
      }
    })
    it("It should setEscrowedTaskBalances", async function () {
      let newescrowedTaskBalances = 100;
      await tribeStorageInstance.setEscrowedTaskBalances(1, newescrowedTaskBalances,{from:curator});
      let after = await tribeStorageInstance.escrowedTaskBalances(1);
      assert( after.toString() === newescrowedTaskBalances.toString())
    })
    it("It should fair to setEscrowedTaskBalances if not curator", async function () {
      let newescrowedTaskBalances = 100;
      let before = await tribeStorageInstance.escrowedTaskBalances(1);
      try {
        await tribeStorageInstance.setEscrowedTaskBalances(1, newescrowedTaskBalances,{from:nonCurator});
      } catch (error) {
        let after = await tribeStorageInstance.escrowedTaskBalances(1);
        assert( after.toString() === before.toString())
      }
    })
    it("It should setEscrowedProjectBalances", async function () {
      let newescrowedProjectBalances = 100;
      await tribeStorageInstance.setEscrowedProjectBalances(1,newescrowedProjectBalances,{from:curator} );
      let after = await tribeStorageInstance.escrowedProjectBalances(1);
      assert( after.toString() === newescrowedProjectBalances.toString())
    })
    it("It should fail to setEscrowedProjectBalances if not curator", async function () {
      let newescrowedProjectBalances = 100;
      let before = await tribeStorageInstance.escrowedProjectBalances(1);
      try {
        await tribeStorageInstance.setEscrowedProjectBalances(1,newescrowedProjectBalances,{from:nonCurator} );
      } catch (error) {
        let after = await tribeStorageInstance.escrowedProjectBalances(1);
        assert( after.toString() === before.toString())          
      }
    })
    it("It should setEscrowedProjectPayees", async function () {
      await tribeStorageInstance.setEscrowedProjectPayees(1, curator,{from:curator});
      let after = await tribeStorageInstance.escrowedProjectPayees(1);
      assert( after.toString() === curator)
    })
    it("It should fail to setEscrowedProjectPayees if not curator", async function () {
      await tribeStorageInstance.setEscrowedProjectPayees(1, curator,{from:curator});
      let before = await tribeStorageInstance.escrowedProjectPayees(1);

      try {
        await tribeStorageInstance.setEscrowedProjectPayees(1, nonCurator,{from:nonCurator});
      } catch (error) {
        let after = await tribeStorageInstance.escrowedProjectPayees(1);
        assert( after.toString() === before.toString())
      }
    })
    it("It should setTotalTaskEscrow", async function () {
      let newtotalTaskEscrow = 100;
      await tribeStorageInstance.setTotalTaskEscrow(newtotalTaskEscrow,{from:curator});
      let after = await tribeStorageInstance.totalTaskEscrow();
      assert( after.toString() === newtotalTaskEscrow.toString())
    })
    it("It should fair to setTotalTaskEscrow if not curator", async function () {
      let newtotalTaskEscrow = 100;
      let before = await tribeStorageInstance.totalTaskEscrow();
      try {
        await tribeStorageInstance.setTotalTaskEscrow(newtotalTaskEscrow,{from:nonCurator});
      } catch (error) {
        let after = await tribeStorageInstance.totalTaskEscrow();
        assert( after.toString() === before.toString())
      }
    })
    it("It should setTotalProjectEscrow", async function () {
      let newtotalProjectEscrow = 100;
      await tribeStorageInstance.setTotalProjectEscrow(newtotalProjectEscrow,{from:curator});
      let after = await tribeStorageInstance.totalProjectEscrow();
      assert( after.toString() === newtotalProjectEscrow.toString())
    })
    it("It should fail to setTotalProjectEscrow if not curator", async function () {
      let newtotalProjectEscrow = 100;
      let before = await tribeStorageInstance.totalProjectEscrow();

      try {
        await tribeStorageInstance.setTotalProjectEscrow(newtotalProjectEscrow,{from:nonCurator});
      } catch (error) {
        let after = await tribeStorageInstance.totalProjectEscrow();
        assert( after.toString() === before.toString())
      }
    })
  })
})