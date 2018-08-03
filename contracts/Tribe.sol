pragma solidity ^0.4.8;

import './Logger.sol';
import './SmartToken.sol';
import './utility/SafeMath.sol';

contract Tribe {

    address public curator;
    address public voteController;
    
    address public tribeTokenContractAddress;
    address public nativeTokenContractAddress;

    address public LoggerContractAddress;
    // Staking Variables.  In tribe token
    uint public minimumStakingRequirement;
    uint public lockupPeriodSeconds;
    mapping (address => uint256) public stakedBalances;
    mapping (address => uint256) public timeStaked;
    uint totalStaked;

    // Escrow variables.  In native token
    uint totalTaskEscrow;
    uint totalProjectEscrow;
    mapping (uint256 => uint256) public escrowedTaskBalances;
    mapping (uint256 => uint256) public escrowedProjectBalances;
    mapping (uint256 => address) public escrowedProjectPayees;

    Logger public log;

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

    constructor(uint _minimumStakingRequirement, uint _lockupPeriodSeconds, address _curator, address _tribeTokenContractAddress, address _nativeTokenContractAddress, address _voteController, address _LoggerContractAddress) public {
        curator = _curator;
        minimumStakingRequirement = _minimumStakingRequirement;
        lockupPeriodSeconds = _lockupPeriodSeconds;
        tribeTokenContractAddress = _tribeTokenContractAddress;
        nativeTokenContractAddress = _nativeTokenContractAddress;
        LoggerContractAddress = _LoggerContractAddress;
        
        log = Logger(LoggerContractAddress);
        log.setNewContractOwner(msg.sender);
        log.setNewContractOwner(address(this));

        voteController = _voteController;
    }

    // gets the amount in the dev fund that isn't locked up by a project or task stake
    function getAvailableDevFund() public view returns (uint) {
        SmartToken nativeTokenInstance = SmartToken(nativeTokenContractAddress);
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
        SmartToken nativeTokenInstance = SmartToken(nativeTokenContractAddress);
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
    
    // pays out the project completion and then updates the escorw balances
    function rewardProjectCompletion(uint uuid) public onlyVoteController {
        SmartToken nativeTokenInstance = SmartToken(nativeTokenContractAddress);
        nativeTokenInstance.transfer(escrowedProjectPayees[uuid], escrowedProjectBalances[uuid]);
        totalProjectEscrow = SafeMath.safeSub(totalProjectEscrow, escrowedProjectBalances[uuid]);
        escrowedProjectBalances[uuid] = 0;
    }


    // Staking code below (in tribe tokens)
    
    // sets a minimum staking requrinment for a membership
    function setMinimumStakingRequirement(uint _minimumStakingRequirement) public onlyCurator {
        minimumStakingRequirement = _minimumStakingRequirement;
    }

    // set a lockup period for staking
    function setlockupPeriod(uint _lockupPeriodSeconds) public onlyCurator {
        lockupPeriodSeconds = _lockupPeriodSeconds;
    }

    // TODO clarify how staking works.  Can they deposit multiple small amounts over time?   Does it have to be one deposit? etc...
    function stakeTribeTokens(uint amount) public {

        SmartToken tribeTokenInstance = SmartToken(tribeTokenContractAddress);
        
        if(!tribeTokenInstance.transferFrom(msg.sender, address(this), amount)) {
            revert();
        }

        stakedBalances[msg.sender] = SafeMath.safeAdd(stakedBalances[msg.sender], amount);
        totalStaked = SafeMath.safeAdd(totalStaked, amount);
        timeStaked[msg.sender] = now;
    }

    // checks that a user is able to unstake by looking at the lokcup period and the balance
    // unstakes a tribe and sends funds back to the user
    function unstakeTribeTokens(uint amount) public {

        SmartToken tribeTokenInstance = SmartToken(tribeTokenContractAddress);

        if(stakedBalances[msg.sender] < amount) {
            revert();
        }
        if(now - timeStaked[msg.sender] < lockupPeriodSeconds) {
            revert();
        }

        stakedBalances[msg.sender] = SafeMath.safeSub(stakedBalances[msg.sender], amount);
        totalStaked = SafeMath.safeSub(totalStaked, amount);
        tribeTokenInstance.transfer(msg.sender, amount);
    }

    // checks that the user is fully staked
    function isMember(address memberAddress) public view returns (bool) {
        return ( stakedBalances[memberAddress] >= minimumStakingRequirement );
    }

    // Variable getters
    /*
        We are using these getter methods to allow the speration of the data into a unique contract
    */

    // function getCurator() public view returns (address) {
    //     return curator;
    // }
    // function getVoteController() public view returns (address) {
    //     return voteController;
    // }
    function getTribeTokenContractAddress() public view returns (address) {
        return tribeTokenContractAddress;
    }
    function getNativeTokenContractAddress() public view returns (address) {
        return nativeTokenContractAddress;
    }
    function getMinimumStakingRequirement() public view returns (uint) {
        return minimumStakingRequirement;
    }
    function getLockupPeriodSeconds() public view returns (uint) {
        return lockupPeriodSeconds;
    }
    function getStakedBalances(address _address) public view returns (uint) {
        return stakedBalances[_address];
    }
    function getTimeStaked(address _address) public view returns (uint) {
        return timeStaked[_address];
    }
    function getEscrowedTaskBalances(uint _uuid) public view returns (uint) {
        return escrowedTaskBalances[_uuid];
    }
    // function getEscrowedProjectBalances(uint _uuid) public view returns (uint) {
    //     return escrowedProjectBalances[_uuid];
    // }
    function getEscrowedProjectPayees(uint _uuid) public view returns (address) {
        return escrowedProjectPayees[_uuid];
    }



}