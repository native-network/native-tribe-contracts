pragma solidity ^0.4.8;

import './utility/Owned.sol';
import './Logger.sol';

// The registrar allows contracts to be upgraded
contract Registrar {
    
    address[] addresses;
    address public loggerContractAddress;    

    function addNewAddress(address _newAddress) public {
        Logger logger = Logger(loggerContractAddress);
        logger.setNewContractOwner(address(this));

        addresses.push(_newAddress);
        logger.emitNewTribeAddress(_newAddress);
    }

    function getAddresses() public returns (address[]) {
        return addresses;
    }

    constructor(address _address, address _loggerContractAddress) public {
        loggerContractAddress = _loggerContractAddress;
        Logger logger = Logger(loggerContractAddress);
        logger.setNewContractOwner(address(this));
        addNewAddress(_address);
    }
}