pragma solidity ^0.4.11;

import "../Tribe.sol";

/*

Helps keep TribeLauncher.sol from needing more than the block gas limit

*/
contract TribeFactory {
    
    function create(
        uint minimumStakingRequirement, 
        uint lockupPeriodSeconds, 
        address curator, 
        address tribeTokenContractAddress, 
        address nativeTokenContractAddress, 
        address voteController, 
        address loggerContractAddress, 
        address tribeStorageContractAddress) public returns(address) {
        Tribe tribe = new Tribe(
        minimumStakingRequirement, 
        lockupPeriodSeconds, 
        curator, 
        tribeTokenContractAddress, 
        nativeTokenContractAddress, 
        voteController,
        loggerContractAddress,
        tribeStorageContractAddress);
        return address(tribe);
    }
}
