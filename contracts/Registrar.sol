pragma solidity ^0.4.8;

import './utility/Owned.sol';
import './Logger.sol';

contract Registrar is Owned {
    
    address[] addresses;

    Logger public logger;
    
    function addNewAddress(address _newAddress) public {
        addresses.push(_newAddress);
        // logger.emitNewTribeAddress(_newAddress);
    }

    function getAddresses() public returns (address[]) {
        return addresses;
    }

    constructor(address _address, address _loggerContractAddress) public {
        logger = Logger(_loggerContractAddress);
        addNewAddress(_address);
    }
}