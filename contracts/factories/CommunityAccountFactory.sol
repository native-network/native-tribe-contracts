pragma solidity ^0.4.11;

import "../CommunityAccount.sol";

/*

Helps keep CommunityLauncher.sol from needing more than the block gas limit

*/
contract CommunityAccountFactory {
    
    function create() public returns(address) {
        CommunityAccount communityAccount = new CommunityAccount();
        communityAccount.transferOwnershipNow(msg.sender);
        return address(communityAccount);
    }
}
