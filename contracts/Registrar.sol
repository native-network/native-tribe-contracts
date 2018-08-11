pragma solidity ^0.4.8;

import "./utility/Owned.sol";

/*

Contains a record of all previous and current address of a tribe.  For upgradeability.

*/
contract Registrar is Owned {

    address[] addresses;
    function addNewAddress(address _newAddress) public {
        addresses.push(_newAddress);
    }
    function getAddresses() public view returns (address[]) {
        return addresses;
    }
}