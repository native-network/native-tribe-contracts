pragma solidity ^0.4.11;

import '../TribeStorage.sol';

contract TribeStorageFactory {
    
    function create() public returns(address) {
        TribeStorage tribeStorage = new TribeStorage();
        tribeStorage.transferOwnershipNow(msg.sender);
        return address(tribeStorage);
    }
}
