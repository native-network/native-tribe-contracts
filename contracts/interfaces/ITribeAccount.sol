pragma solidity ^0.4.24;

import "../interfaces/IOwned.sol";

/*
    Tribe Account Interface
*/
contract ITribeAccount is IOwned {
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