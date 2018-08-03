pragma solidity ^0.4.8;

import './utility/Owned.sol';
import './Logger.sol';

contract Registrar is Owned {
    
    address[] addresses;
    address public loggerContractAddress;    
    // Logger public logger;


    function addNewAddress(address _newAddress) public {
        Logger logger = Logger(loggerContractAddress);
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