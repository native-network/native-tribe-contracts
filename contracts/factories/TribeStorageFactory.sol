pragma solidity ^0.4.11;

import "../TribeAccount.sol";

/*

Helps keep TribeLauncher.sol from needing more than the block gas limit

*/
contract TribeAccountFactory {
    
    function create() public returns(address) {
        TribeAccount tribeAccount = new TribeAccount();
        tribeAccount.transferOwnershipNow(msg.sender);
        return address(tribeAccount);
    }
}
