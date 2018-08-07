pragma solidity ^0.4.8;

import './Logger.sol';
import './TribeStorage.sol';
import './SmartToken.sol';
import './utility/SafeMath.sol';

contract Tribe {
    address public curator;
    address public voteController;

    address public LoggerContractAddress;

    // Escrow variables.  In native token
    uint totalTaskEscrow;
    uint totalProjectEscrow;
    mapping (uint256 => uint256) public escrowedTaskBalances;
    mapping (uint256 => uint256) public escrowedProjectBalances;
    mapping (uint256 => address) public escrowedProjectPayees;

    Logger public log;

    TribeStorage public tribeStorage;

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
                address _LoggerContractAddress,
                address _tribeStorageContractAddress) public {
        
         // tribeStorageContractAddress = _tribeStorageContractAddress;
        tribeStorage = TribeStorage(_tribeStorageContractAddress);
        // tribeStorage.lockupPeriodSeconds();

        curator = _curator;
        tribeStorage.setMinimumStakingRequirement(_minimumStakingRequirement);
        tribeStorage.setLockupPeriodSeconds(_lockupPeriodSeconds);
        tribeStorage.setTribeTokenContractAddress(_tribeTokenContractAddress);
        tribeStorage.setNativeTokenContractAddress(_nativeTokenContractAddress);
        
        LoggerContractAddress = _LoggerContractAddress;    
        log = Logger(LoggerContractAddress);
        log.setNewContractOwner(msg.sender);
        log.setNewContractOwner(address(this));
 
        voteController = _voteController;
    }

    // gets the amount in the dev fund that isn't locked up by a project or task stake
    function getAvailableDevFund() public view returns (uint) {
        SmartToken nativeTokenInstance = SmartToken(tribeStorage.nativeTokenContractAddress());
        uint devFundBalance = nativeTokenInstance.balanceOf(address(this));
        return SafeMath.safeSub(devFundBalance, getLockedDevFundAmount());
    }
    
    // adds the task and project escrows
    function getLockedDevFundAmount() public view returns (uint) {
        return SafeMath.safeAdd(totalTaskEscrow, totalProjectEscrow);
    }

    // Task escrow code below (in native tokens)
    
    // updates the escrow values for a new task
    function createNewTask(uint uuid, uint amount) public onlyCurator sufficientDevFundBalance (amount) {
        escrowedTaskBalances[uuid] = amount;
        totalTaskEscrow = SafeMath.safeAdd(totalTaskEscrow, amount);

        log.emitTaskCreated(uuid, amount);
    }

    // subtracts the tasks escrow and sets the tasks escrow balance to 0
    function cancelTask(uint uuid) public onlyCurator {
        totalTaskEscrow = SafeMath.safeSub(totalTaskEscrow,escrowedTaskBalances[uuid]);
        escrowedTaskBalances[uuid] = 0;
    }
    
    // pays put to the task completer and updates the escrow balances
    function rewardTaskCompletion(uint uuid, address user) public onlyVoteController {
        SmartToken nativeTokenInstance = SmartToken(tribeStorage.nativeTokenContractAddress());
        nativeTokenInstance.transfer(user, escrowedTaskBalances[uuid]);
        totalTaskEscrow = SafeMath.safeSub(totalTaskEscrow, escrowedTaskBalances[uuid]);
        escrowedTaskBalances[uuid] = 0;
    }

    // Project escrow code below (in native tokens)

    // updates the escrow values along with the project payee for a new project
    function createNewProject(uint uuid, uint amount, address projectPayee) public onlyCurator sufficientDevFundBalance (amount) {
        escrowedProjectBalances[uuid] = amount;
        escrowedProjectPayees[uuid] = projectPayee;
        totalProjectEscrow = SafeMath.safeAdd(totalProjectEscrow, amount);

        log.emitProjectCreated(uuid, amount, projectPayee);
    }

    // subtracts the tasks escrow and sets the tasks escrow balance to 0
    function cancelProject(uint uuid) public onlyCurator {
        totalProjectEscrow = SafeMath.safeSub(totalProjectEscrow, escrowedProjectBalances[uuid]);
        escrowedProjectBalances[uuid] = 0;
    }
    
    // pays out the project completion and then updates the escrow balances
    function rewardProjectCompletion(uint uuid) public onlyVoteController {
        SmartToken nativeTokenInstance = SmartToken(tribeStorage.nativeTokenContractAddress());
        nativeTokenInstance.transfer(escrowedProjectPayees[uuid], escrowedProjectBalances[uuid]);
        totalProjectEscrow = SafeMath.safeSub(totalProjectEscrow, escrowedProjectBalances[uuid]);
        escrowedProjectBalances[uuid] = 0;
    }

    // Staking code below (in tribe tokens)      
    // TODO clarify how staking works.  Can they deposit multiple small amounts over time?   Does it have to be one deposit? etc...
    function stakeTribeTokens(uint amount) public {

        SmartToken tribeTokenInstance = SmartToken(tribeStorage.tribeTokenContractAddress());
        
        if(!tribeTokenInstance.transferFrom(msg.sender, address(this), amount)) {
            revert();
        }

        tribeStorage.setStakedBalances(SafeMath.safeAdd(tribeStorage.getStakedBalances(msg.sender), amount));
        tribeStorage.setTotalStaked(SafeMath.safeAdd(tribeStorage.totalStaked(), amount));
        tribeStorage.setTimeStaked(now);
    }

    // checks that a user is able to unstake by looking at the lokcup period and the balance
    // unstakes a tribe and sends funds back to the user
    function unstakeTribeTokens(uint amount) public {

        SmartToken tribeTokenInstance = SmartToken(tribeStorage.tribeTokenContractAddress());

        if(tribeStorage.getStakedBalances(msg.sender) < amount) {
            revert();
        }
        if(now - tribeStorage.getTimeStaked(msg.sender) < tribeStorage.lockupPeriodSeconds()) {
            revert();
        }

        tribeStorage.setStakedBalances(SafeMath.safeSub(tribeStorage.getStakedBalances(msg.sender), amount));
        tribeStorage.setTotalStaked(SafeMath.safeSub(tribeStorage.totalStaked(), amount));
        tribeTokenInstance.transfer(msg.sender, amount);
    }

    // checks that the user is fully staked
    function isMember(address memberAddress) public view returns (bool) {
        return ( tribeStorage.getStakedBalances(memberAddress) >= tribeStorage.minimumStakingRequirement() );
    }
}