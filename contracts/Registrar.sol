pragma solidity ^0.4.24;

import "./utility/Owned.sol";
import "./interfaces/IRegistrar.sol";

/**
@notice Contains a record of all previous and current address of a community.  For upgradeability.
*/
contract Registrar is Owned, IRegistrar {

    address[] addresses;
    function addNewAddress(address _newAddress) public ownerOnly {
        addresses.push(_newAddress);
    }

    function getAddresses() public view returns (address[]) {
        return addresses;
    }
}