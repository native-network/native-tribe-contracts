pragma solidity ^0.4.8;

import "./utility/Owned.sol";

// The registrar allows contracts to be upgraded
contract Registrar is Owned {

    address[] addresses;
    function addNewAddress(address _newAddress) public {
        addresses.push(_newAddress);
    }
    function getAddresses() public view returns (address[]) {
        return addresses;
    }
}