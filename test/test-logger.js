const TribeLauncher = artifacts.require("TribeLauncher");
const Tribe = artifacts.require("Tribe");
const Logger = artifacts.require("Logger");
const SmartToken = artifacts.require("SmartToken");
const SmartTokenFactory = artifacts.require("SmartTokenFactory");
const TribeStorageFactory = artifacts.require("TribeStorageFactory");
const Registrar = artifacts.require("Registrar");
const RegistrarFactory = artifacts.require("RegistrarFactory");
const TribeFactory = artifacts.require("TribeFactory");
const Bluebird = require('Bluebird');


contract('Logger', function () {

  const owner = web3.eth.accounts[0]
  const nonOwner = web3.eth.accounts[1]
  const permissionedAccount = web3.eth.accounts[2]
  const unpermissionedAccount = web3.eth.accounts[3]
  const user1 = web3.eth.accounts[4]
  const user2 = web3.eth.accounts[4]

  let loggerInstance

  beforeEach(async () => {
    loggerInstance = await Logger.deployed()
  })

  describe.only("It should test the logger", function() {

    // TODO do negative case for this
    it("It should allow a permissioned user to call all logger functions", async function () {
      const uuid = 1234
      const amount = 1000
      const ethereumAddress1 = user1
      const ethereumAddress2 = user2
      const messageType = 'Test Message Type'
      const messageLog = 'Test Log'

      await loggerInstance.addNewLoggerPermission(permissionedAccount, {from: owner})

      loggerInstance.emitTaskCreated(uuid, amount, {from: permissionedAccount})
      loggerInstance.emitProjectCreated(uuid, amount, ethereumAddress1, {from: permissionedAccount})
      loggerInstance.emitNewSmartToken(ethereumAddress1, {from: permissionedAccount})
      loggerInstance.emitIssuance(amount, {from: permissionedAccount})
      loggerInstance.emitDestruction(amount, {from: permissionedAccount})
      loggerInstance.emitTransfer(ethereumAddress1, ethereumAddress2, amount, {from: permissionedAccount})
      loggerInstance.emitApproval(ethereumAddress1, ethereumAddress2, amount, {from: permissionedAccount})
      loggerInstance.emitGenericLog(messageType, messageLog, {from: permissionedAccount})

      const loggerPromises = []
      
      loggerPromises.push(Bluebird.promisify(loggerInstance.TaskCreated)())
      loggerPromises.push(Bluebird.promisify(loggerInstance.ProjectCreated)())
      loggerPromises.push(Bluebird.promisify(loggerInstance.NewSmartToken)())
      loggerPromises.push(Bluebird.promisify(loggerInstance.Issuance)())
      loggerPromises.push(Bluebird.promisify(loggerInstance.Destruction)())
      loggerPromises.push(Bluebird.promisify(loggerInstance.Transfer)())
      loggerPromises.push(Bluebird.promisify(loggerInstance.Approval)())
      loggerPromises.push(Bluebird.promisify(loggerInstance.GenericLog)())
      
      return Bluebird.all(loggerPromises).then( (results) => {
        
        // TaskCreated
        assert(results[0].args._uuid.equals(uuid))
        assert(results[0].args._amount.equals(amount))
        
        // ProjectCreated
        assert(results[1].args._uuid.equals(uuid))
        assert(results[1].args._amount.equals(amount))
        assert(results[1].args._address === ethereumAddress1)
        
        // NewSmartToken
        assert(results[2].args._token === ethereumAddress1)
        
        // Issuance
        assert(results[3].args._amount.equals(amount))
        
        // Destruction
        assert(results[4].args._amount.equals(amount))

        // Transfer
        assert(results[5].args._value.equals(amount))
        assert(results[5].args._from === ethereumAddress1)
        assert(results[5].args._to === ethereumAddress2)

        // Approval
        assert(results[6].args._value.equals(amount))
        assert(results[6].args._owner === ethereumAddress1)
        assert(results[6].args._spender === ethereumAddress2)

        // GenericLog
        assert(results[7].args.messageType === messageType)
        assert(results[7].args.message === messageLog)

      }).catch((rejected) => {
        assert(false, rejected);
      })
    })

    it("It should fail if an unpermissioned user calls any logger functions", async function () {
      
      let anySucceeded = false
      
      try {
        loggerInstance.emitTaskCreated(uuid, amount, {from: unpermissionedAccount})
        anySucceeded = true
      } catch(err) {}
      try {
        loggerInstance.emitProjectCreated(uuid, amount, ethereumAddress1, {from: unpermissionedAccount})
        anySucceeded = true
      } catch(err) {}
      try {
        loggerInstance.emitNewSmartToken(ethereumAddress1, {from: unpermissionedAccount})
        anySucceeded = true
      } catch(err) {}
      try {
        loggerInstance.emitIssuance(amount, {from: unpermissionedAccount})
        anySucceeded = true
      } catch(err) {}
      try {
        loggerInstance.emitDestruction(amount, {from: unpermissionedAccount})
        anySucceeded = true
      } catch(err) {}
      try {
        loggerInstance.emitTransfer(ethereumAddress1, ethereumAddress2, amount, {from: unpermissionedAccount})
        anySucceeded = true
      } catch(err) {}
      try {
        loggerInstance.emitApproval(ethereumAddress1, ethereumAddress2, amount, {from: unpermissionedAccount})
        anySucceeded = true
      } catch(err) {}
      try {
        loggerInstance.emitGenericLog(messageType, messageLogs, {from: unpermissionedAccount})
        anySucceeded = true
      } catch(err) {}
      
      return assert(!anySucceeded)
    })

    it("It should fail if a non owner tries to permission a new address for logging", async function () {
      try {
        await loggerInstance.addNewLoggerPermission(permissionedAccount, {from: nonOwner})
      } catch(err) {
        return assert(true)
      }
      return assert(false)
    })
  })

})