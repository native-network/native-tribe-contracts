pragma solidity ^0.4.8;

import './SmartToken.sol';

// TODO -- use safemath for everything
contract Tribe {

    event TaskCreated(uint _uuid, uint _amount);
    event ProjectCreated(uint _uuid, uint _amount, address _address);
    
    address curator;
    address voteController;
    
    address public tribeTokenContractAddress;
    address public nativeTokenContractAddress;

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

    constructor(uint _minimumStakingRequirement, uint _lockupPeriodSeconds, address _curator, address _tribeTokenContractAddress, address _nativeTokenContractAddress, address _voteController) public {
        curator = _curator;
        minimumStakingRequirement = _minimumStakingRequirement;
        lockupPeriodSeconds = _lockupPeriodSeconds;
        tribeTokenContractAddress = _tribeTokenContractAddress;
        nativeTokenContractAddress = _nativeTokenContractAddress;

        voteController = _voteController;
    }

    function getAvailableDevFund() public view returns (uint) {
        SmartToken nativeTokenInstance = SmartToken(nativeTokenContractAddress);
        uint devFundBalance = nativeTokenInstance.balanceOf(address(this));
        return devFundBalance - getLockedDevFundAmount();
    }
    
    function getLockedDevFundAmount() public view returns (uint) {
        return totalTaskEscrow + totalProjectEscrow;
    }

    // Task escrow code below (in native tokens)
    
    
    function createNewTask(uint uuid, uint amount) public onlyCurator sufficientDevFundBalance (amount) {
        escrowedTaskBalances[uuid] = amount;
        totalTaskEscrow += amount;

        emit TaskCreated(uuid, amount);
    }

    function cancelTask(uint uuid) public onlyCurator {
        totalTaskEscrow -= escrowedTaskBalances[uuid];
        escrowedTaskBalances[uuid] = 0;
    }

    function rewardTaskCompletion(uint uuid, address user) public onlyVoteController {
        SmartToken nativeTokenInstance = SmartToken(nativeTokenContractAddress);
        nativeTokenInstance.transfer(user, escrowedTaskBalances[uuid]);
        totalTaskEscrow -= escrowedTaskBalances[uuid];
        escrowedTaskBalances[uuid] = 0;
    }

    // Project escrow code below (in native tokens)
    
    
    function createNewProject(uint uuid, uint amount, address projectPayee) public onlyCurator sufficientDevFundBalance (amount) {
        escrowedProjectBalances[uuid] = amount;
        escrowedProjectPayees[uuid] = projectPayee;
        totalProjectEscrow += amount;

        emit ProjectCreated(uuid, amount, projectPayee);
    }
    
    function cancelProject(uint uuid) public onlyCurator {
        totalProjectEscrow -= escrowedProjectBalances[uuid];
        escrowedProjectBalances[uuid] = 0;
    }
    
    function rewardProjectCompletion(uint uuid) public onlyVoteController {
        SmartToken nativeTokenInstance = SmartToken(nativeTokenContractAddress);
        nativeTokenInstance.transfer(escrowedProjectPayees[uuid], escrowedProjectBalances[uuid]);
        totalProjectEscrow -= escrowedProjectBalances[uuid];
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

        stakedBalances[msg.sender] += amount;
        totalStaked += amount;
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

        stakedBalances[msg.sender] -= amount;
        totalStaked -= amount;
        tribeTokenInstance.transfer(msg.sender, amount);
    }

    function isMember(address memberAddress) public view returns (bool) {
        return ( stakedBalances[memberAddress] >= minimumStakingRequirement );
    }
}