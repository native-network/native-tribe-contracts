pragma solidity ^0.4.8;

import './interfaces/ILogger.sol';
import './interfaces/ITribeStorage.sol';
import './interfaces/ISmartToken.sol';
import './utility/SafeMath.sol';

contract Tribe {
    
    // TODO should we abstract these into an OwnedTribe utility????? mayber
    address public curator;
    address public voteController;
    uint public minimumStakingRequirement;
    uint public lockupPeriodSeconds;
    ISmartToken public nativeTokenInstance;
    ISmartToken public tribeTokenInstance;
    ILogger public logger;
    ITribeStorage public tribeStorage;

    modifier onlyCurator {
        require(msg.sender == curator);
        _;
    }

    modifier onlyVoteController {
        require(msg.sender == voteController);
        _;
    }

    modifier sufficientDevFundBalance (uint amount) {
        require(amount <= getAvailableDevFund());
        _;
    }

    constructor(uint _minimumStakingRequirement,
                uint _lockupPeriodSeconds,
                address _curator,
                address _tribeTokenContractAddress,
                address _nativeTokenContractAddress,
                address _voteController,
                address _loggerContractAddress,
                address _tribeStorageContractAddress) public {
                    tribeStorage = ITribeStorage(_tribeStorageContractAddress);
                    curator = _curator;
                    minimumStakingRequirement = _minimumStakingRequirement;
                    lockupPeriodSeconds = _lockupPeriodSeconds;
                    logger = ILogger(_loggerContractAddress);
                    voteController = _voteController;
                    nativeTokenInstance = ISmartToken(_nativeTokenContractAddress);
                    tribeTokenInstance = ISmartToken(_tribeTokenContractAddress);
    }

    // TODO add events to each of these
    function transferCurator(address _curator) public onlyCurator {
        curator = _curator;
    }

    function transferVoteController(address _voteController) public onlyCurator {
        voteController = _voteController;
    }

    function setMinimumStakingRequirement(uint _minimumStakingRequirement) public onlyCurator {
        minimumStakingRequirement = _minimumStakingRequirement;
    }

    function setLockupPeriodSeconds(uint _lockupPeriodSeconds) public onlyCurator {
        lockupPeriodSeconds = _lockupPeriodSeconds;
    }

    function setLogger(address newLoggerAddress) public onlyCurator {
        logger = ILogger(newLoggerAddress);
    }

    function setTokenAddresses(address newNativeTokenAddress, address newTribeTokenAddress) public onlyCurator {
        nativeTokenInstance = ISmartToken(newNativeTokenAddress);
        tribeTokenInstance = ISmartToken(newTribeTokenAddress);
    }

    function setTribeStorage(address newTribeStorageAddress) public onlyCurator {
        tribeStorage = ITribeStorage(newTribeStorageAddress);
    }

    // gets the amount in the dev fund that isn't locked up by a project or task stake
    function getAvailableDevFund() public view returns (uint) {
        uint devFundBalance = nativeTokenInstance.balanceOf(address(this));
        return SafeMath.safeSub(devFundBalance, getLockedDevFundAmount());
    }
    
    // adds the task and project escrows
    function getLockedDevFundAmount() public view returns (uint) {
        return SafeMath.safeAdd(tribeStorage.totalTaskEscrow(), tribeStorage.totalProjectEscrow());
    }

    // Task escrow code below (in native tokens)
    
    // updates the escrow values for a new task
    function createNewTask(uint uuid, uint amount) public onlyCurator sufficientDevFundBalance (amount) {
        tribeStorage.setEscrowedTaskBalances(uuid, amount);
        tribeStorage.setTotalTaskEscrow(SafeMath.safeAdd(tribeStorage.totalTaskEscrow(), amount));
        logger.emitTaskCreated(uuid, amount);
    }

    // subtracts the tasks escrow and sets the tasks escrow balance to 0
    function cancelTask(uint uuid) public onlyCurator {
        tribeStorage.setTotalTaskEscrow(SafeMath.safeSub(tribeStorage.totalTaskEscrow(), tribeStorage.escrowedTaskBalances(uuid)));
        tribeStorage.setEscrowedTaskBalances(uuid , 0);
    }
    
    // pays put to the task completer and updates the escrow balances
    function rewardTaskCompletion(uint uuid, address user) public onlyVoteController {
        nativeTokenInstance.transfer(user, tribeStorage.escrowedTaskBalances(uuid));
        tribeStorage.setTotalTaskEscrow(SafeMath.safeSub(tribeStorage.totalTaskEscrow(), tribeStorage.escrowedTaskBalances(uuid)));
        tribeStorage.setEscrowedTaskBalances(uuid, 0);
    }

    // Project escrow code below (in native tokens)

    // updates the escrow values along with the project payee for a new project
    function createNewProject(uint uuid, uint amount, address projectPayee) public onlyCurator sufficientDevFundBalance (amount) {
        tribeStorage.setEscrowedProjectBalances(uuid, amount);
        tribeStorage.setEscrowedProjectPayees(uuid, projectPayee);
        tribeStorage.setTotalProjectEscrow(SafeMath.safeAdd(tribeStorage.totalProjectEscrow(), amount));
        logger.emitProjectCreated(uuid, amount, projectPayee);
    }

    // subtracts the tasks escrow and sets the tasks escrow balance to 0
    function cancelProject(uint uuid) public onlyCurator {
        tribeStorage.setTotalProjectEscrow(SafeMath.safeSub(tribeStorage.totalProjectEscrow(), tribeStorage.escrowedProjectBalances(uuid)));
        tribeStorage.setEscrowedProjectBalances(uuid, 0);
    }
    
    // pays out the project completion and then updates the escrow balances
    function rewardProjectCompletion(uint uuid) public onlyVoteController {
        nativeTokenInstance.transfer(tribeStorage.escrowedProjectPayees(uuid), tribeStorage.escrowedProjectBalances(uuid));
        tribeStorage.setTotalProjectEscrow(SafeMath.safeSub(tribeStorage.totalProjectEscrow(), tribeStorage.escrowedProjectBalances(uuid)));
        tribeStorage.setEscrowedProjectBalances(uuid, 0);
    }

    // Staking code below (in tribe tokens)
    // TODO make it not use amount here.  It should just assume enuf tokens can be staked to become a member
    function stakeTribeTokens(uint amount) public {

        if(!tribeTokenInstance.transferFrom(msg.sender, address(this), amount)) {
            revert();
        }

        tribeStorage.setStakedBalances(SafeMath.safeAdd(tribeStorage.stakedBalances(msg.sender), amount));
        tribeStorage.setTotalStaked(SafeMath.safeAdd(tribeStorage.totalStaked(), amount));
        tribeStorage.setTimeStaked(now);
    }

    // checks that a user is able to unstake by looking at the lokcup period and the balance
    // unstakes a tribe and sends funds back to the user
    function unstakeTribeTokens(uint amount) public {

        if(tribeStorage.stakedBalances(msg.sender) < amount) {
            revert();
        }
        if(now - tribeStorage.timeStaked(msg.sender) < lockupPeriodSeconds) {
            revert();
        }

        tribeStorage.setStakedBalances(SafeMath.safeSub(tribeStorage.stakedBalances(msg.sender), amount));
        tribeStorage.setTotalStaked(SafeMath.safeSub(tribeStorage.totalStaked(), amount));
        tribeTokenInstance.transfer(msg.sender, amount);
    }

    // checks that the user is fully staked
    function isMember(address memberAddress) public view returns (bool) {
        return ( tribeStorage.stakedBalances(memberAddress) >= minimumStakingRequirement );
    }
}