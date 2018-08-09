pragma solidity ^0.4.8;


contract ITribeStorage {

    // Staking Variables.  In tribe token
    uint public minimumStakingRequirement;
    uint public lockupPeriodSeconds;
    mapping (address => uint256) public stakedBalances;
    mapping (address => uint256) public timeStaked;
    uint public totalStaked;
    
    // Escrow variables.  In native token
    uint public totalTaskEscrow;
    uint public totalProjectEscrow;
    mapping (uint256 => uint256) public escrowedTaskBalances;
    mapping (uint256 => uint256) public escrowedProjectBalances;
    mapping (uint256 => address) public escrowedProjectPayees;
    
    function setLockupPeriodSeconds(uint _lockupPeriodSeconds) public;
    function setMinimumStakingRequirement(uint _minimumStakingRequirement) public;
    function setStakedBalances(uint _amount) public;
    function setTotalStaked(uint _totalStaked) public;
    function setTimeStaked(uint _timeStaked) public;

    function setEscrowedTaskBalances(uint uuid, uint balance) public;
    function setEscrowedProjectBalances(uint uuid, uint balance) public;
    function setEscrowedProjectPayees(uint uuid, address payeeAddress) public;

    function setTotalTaskEscrow(uint balance) public;
    function setTotalProjectEscrow(uint balance) public;
}