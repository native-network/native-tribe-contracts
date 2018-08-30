pragma solidity ^0.4.11;

import "../Community.sol";

/*

Helps keep CommunityLauncher.sol from needing more than the block gas limit

*/
contract CommunityFactory {
    
    function create(
        uint minimumStakingRequirement, 
        uint lockupPeriodSeconds, 
        address curator, 
        address communityTokenContractAddress,
        address nativeTokenContractAddress, 
        address voteController, 
        address loggerContractAddress, 
        address communityAccountContractAddress) public returns(address) {
        Community community = new Community(
        minimumStakingRequirement, 
        lockupPeriodSeconds, 
        curator, 
        communityTokenContractAddress,
        nativeTokenContractAddress, 
        voteController,
        loggerContractAddress,
        communityAccountContractAddress);
        return address(community);
    }
}
