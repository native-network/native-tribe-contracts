pragma solidity ^0.4.11;

import "../Registrar.sol";

contract RegistrarFactory {
    
    function create() public returns(address) {
        Registrar registrar = new Registrar();
        registrar.transferOwnershipNow(msg.sender);
        return address(registrar);
    }
}
