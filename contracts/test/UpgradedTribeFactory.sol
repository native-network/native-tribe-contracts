pragma solidity ^0.4.11;

import "./UpgradedTribe.sol";

/*

Used in integration-test-upgrades.js to demonstrate how we can update a tribe

*/
contract UpgradedTribeFactory {
    
    function create(
        uint minimumStakingRequirement, 
        uint lockupPeriodSeconds, 
        address curator, 
        address tribeTokenContractAddress, 
        address nativeTokenContractAddress, 
        address voteController, 
        address loggerContractAddress, 
        address tribeStorageContractAddress,
        bool emergencyWithdrawEnabled
        ) public returns(address) {
        UpgradedTribe upgradedTribe = new UpgradedTribe(
        minimumStakingRequirement, 
        lockupPeriodSeconds, 
        curator, 
        tribeTokenContractAddress, 
        nativeTokenContractAddress, 
        voteController,
        loggerContractAddress,
        tribeStorageContractAddress,
        emergencyWithdrawEnabled);
        return address(upgradedTribe);
    }
}
