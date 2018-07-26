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

    modifier onlyCurator {
        assert(msg.sender == curator);
        _;
    }

    modifier onlyVoteController {
        assert(msg.sender == voteController);
        _;
    }

    modifier sufficientDevFundBalance (uint amount) {
        assert(amount <= getAvailableDevFund());
        _;
    }

    constructor(uint _minimumStakingRequirement, uint _lockupPeriodSeconds, address _curator, address _tribeTokenContractAddress, address _nativeTokenContractAddress, address _voteController, address _LoggerContractAddress) public {
        curator = _curator;
        minimumStakingRequirement = _minimumStakingRequirement;
        lockupPeriodSeconds = _lockupPeriodSeconds;
        tribeTokenContractAddress = _tribeTokenContractAddress;
        nativeTokenContractAddress = _nativeTokenContractAddress;
        LoggerContractAddress = _LoggerContractAddress;

        voteController = _voteController;
    }
    /**
    @dev returns the sum of _x and _y, asserts if the calculation overflows
    @param _x   value 1
    @param _y   value 2
    @return sum
    */
    function safeAdd(uint256 _x, uint256 _y) internal pure returns (uint256) {
        uint256 z = _x + _y;
        assert(z >= _x);
        return z;
    }

    /**
    @dev returns the difference of _x minus _y, asserts if the subtraction results in a negative number
    @param _x   minuend
    @param _y   subtrahend
    @return difference
    */
    function safeSub(uint256 _x, uint256 _y) internal pure returns (uint256) {
        assert(_x >= _y);
        return _x - _y;
    }
    function getAvailableDevFund() public view returns (uint) {
        SmartToken nativeTokenInstance = SmartToken(nativeTokenContractAddress);
        uint devFundBalance = nativeTokenInstance.balanceOf(address(this));
        return safeSub(devFundBalance, getLockedDevFundAmount());
    }
    
    function getLockedDevFundAmount() public view returns (uint) {
        return safeAdd(totalTaskEscrow, totalProjectEscrow);
    }

    // Task escrow code below (in native tokens)
    
    
    function createNewTask(uint uuid, uint amount) public onlyCurator sufficientDevFundBalance (amount) {
        escrowedTaskBalances[uuid] = amount;
        totalTaskEscrow = safeAdd(totalTaskEscrow, amount);

        Logger log = Logger(LoggerContractAddress);
        log.emitTaskCreated(uuid, amount);
    }

    function cancelTask(uint uuid) public onlyCurator {
        totalTaskEscrow = safeSub(totalTaskEscrow,escrowedTaskBalances[uuid]);
        escrowedTaskBalances[uuid] = 0;
    }

    function rewardTaskCompletion(uint uuid, address user) public onlyVoteController {
        SmartToken nativeTokenInstance = SmartToken(nativeTokenContractAddress);
        nativeTokenInstance.transfer(user, escrowedTaskBalances[uuid]);
        totalTaskEscrow = safeSub(totalTaskEscrow, escrowedTaskBalances[uuid]);
        escrowedTaskBalances[uuid] = 0;
    }

    // Project escrow code below (in native tokens)
        
    function createNewProject(uint uuid, uint amount, address projectPayee) public onlyCurator sufficientDevFundBalance (amount) {
        escrowedProjectBalances[uuid] = amount;
        escrowedProjectPayees[uuid] = projectPayee;
        totalProjectEscrow = safeAdd(totalProjectEscrow, amount);

        Logger log = Logger(LoggerContractAddress);
        log.emitProjectCreated(uuid, amount, projectPayee);
    }
    
    function cancelProject(uint uuid) public onlyCurator {
        totalProjectEscrow = safeSub(totalProjectEscrow, escrowedProjectBalances[uuid]);
        escrowedProjectBalances[uuid] = 0;
    }
    
    function rewardProjectCompletion(uint uuid) public onlyVoteController {
        SmartToken nativeTokenInstance = SmartToken(nativeTokenContractAddress);
        nativeTokenInstance.transfer(escrowedProjectPayees[uuid], escrowedProjectBalances[uuid]);
        totalProjectEscrow = safeSub(totalProjectEscrow, escrowedProjectBalances[uuid]);
        escrowedProjectBalances[uuid] = 0;
    }


    // Staking code below (in tribe tokens)
    

    function setMinimumStakingRequirement(uint _minimumStakingRequirement) public onlyCurator {
        minimumStakingRequirement = _minimumStakingRequirement;
    }

    function setlockupPeriod(uint _lockupPeriodSeconds) public onlyCurator {
        lockupPeriodSeconds = _lockupPeriodSeconds;
    }

    // TODO clarify how staking works.  Can they deposit multiple small amounts over time?   Does it have to be one deposit? etc...
    function stakeTribeTokens(uint amount) public {

        SmartToken tribeTokenInstance = SmartToken(tribeTokenContractAddress);
        
        if(!tribeTokenInstance.transferFrom(msg.sender, address(this), amount)) {
            revert();
        }

        stakedBalances[msg.sender] = safeAdd(stakedBalances[msg.sender], amount);
        totalStaked = safeAdd(totalStaked, amount);
        timeStaked[msg.sender] = now;
    }

    function unstakeTribeTokens(uint amount) public {

        SmartToken tribeTokenInstance = SmartToken(tribeTokenContractAddress);

        if(stakedBalances[msg.sender] < amount) {
            revert();
        }
        if(now - timeStaked[msg.sender] < lockupPeriodSeconds) {
            revert();
        }

        stakedBalances[msg.sender] = safeSub(stakedBalances[msg.sender], amount);
        totalStaked = safeSub(totalStaked, amount);
        tribeTokenInstance.transfer(msg.sender, amount);
    }

    function isMember(address memberAddress) public view returns (bool) {
        return ( stakedBalances[memberAddress] >= minimumStakingRequirement );
    }
}