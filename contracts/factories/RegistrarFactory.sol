pragma solidity ^0.4.11;

import "../Registrar.sol";

/*

Helps keep TribeLauncher.sol from needing more than the block gas limit

*/
contract RegistrarFactory {
    
    function create() public returns(address) {
        Registrar registrar = new Registrar();
        registrar.transferOwnershipNow(msg.sender);
        return address(registrar);
    }
}
