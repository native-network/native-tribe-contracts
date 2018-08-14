pragma solidity ^0.4.24;

/*
    Owned Contract Interface
*/
contract IOwned {
    function transferOwnership(address _newOwner) public;
    function acceptOwnership() public;
    function transferOwnershipNow(address newContractOwner) public;
}