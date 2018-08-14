pragma solidity ^0.4.24;

import "../interfaces/IOwned.sol";

/*
    Tribe Account Interface
*/
contract ITribeAccount is IOwned {
    function setStakedBalances(uint _amount, address msgSender) public;
    function setTotalStaked(uint _totalStaked) public;
    function setTimeStaked(uint _timeStaked, address msgSender) public;
    function setEscrowedTaskBalances(uint uuid, uint balance) public;
    function setEscrowedProjectBalances(uint uuid, uint balance) public;
    function setEscrowedProjectPayees(uint uuid, address payeeAddress) public;
    function setTotalTaskEscrow(uint balance) public;
    function setTotalProjectEscrow(uint balance) public;
}