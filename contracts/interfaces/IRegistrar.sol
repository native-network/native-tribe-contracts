pragma solidity ^0.4.8;

// The logging library allows the events to be watched without the need to watch each contract 
contract IRegistrar {
    address[] addresses;
    function addNewAddress(address _newAddress) public;
    function getAddresses() public view returns (address[]);
}