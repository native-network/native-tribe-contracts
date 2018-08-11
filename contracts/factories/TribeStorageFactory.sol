pragma solidity ^0.4.11;

import "../TribeStorage.sol";

/*

Helps keep TribeLauncher.sol from needing more than the block gas limit

*/
contract TribeStorageFactory {
    
    function create() public returns(address) {
        TribeStorage tribeStorage = new TribeStorage();
        tribeStorage.transferOwnershipNow(msg.sender);
        return address(tribeStorage);
    }
}
