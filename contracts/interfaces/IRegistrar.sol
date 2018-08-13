pragma solidity ^0.4.8;

import "../interfaces/IOwned.sol";

contract IRegistrar is IOwned {
    function addNewAddress(address _newAddress) public;
    function getAddresses() public view returns (address[]);
}