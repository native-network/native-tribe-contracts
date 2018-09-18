pragma solidity ^0.4.24;

import "./utility/Owned.sol";
import "./interfaces/IRegistrar.sol";

/**
@notice Contains a record of all previous and current address of a community; For upgradeability.
*/
contract Registrar is Owned, IRegistrar {

    address[] addresses;
    /// @notice Adds new community logic contract address to Registrar
    /// @param _newAddress Address of community logic contract to upgrade to
    function addNewAddress(address _newAddress) public ownerOnly {
        addresses.push(_newAddress);
    }

    /// @return Array of community logic contract addresses
    function getAddresses() public view returns (address[]) {
        return addresses;
    }
}