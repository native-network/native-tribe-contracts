pragma solidity ^0.4.24;

import "../interfaces/IOwned.sol";

/*
    Smart Token interface
*/
contract IRegistrar is IOwned {
    function addNewAddress(address _newAddress) public;
    function getAddresses() public view returns (address[]);
}