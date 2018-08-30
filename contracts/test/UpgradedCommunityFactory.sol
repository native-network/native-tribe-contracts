pragma solidity ^0.4.11;

import "./UpgradedCommunity.sol";

/*

Used in integration-test-upgrades.js to demonstrate how we can update a community

*/
contract UpgradedCommunityFactory {
    
    function create(
        uint minimumStakingRequirement, 
        uint lockupPeriodSeconds, 
        address curator, 
        address communityTokenContractAddress,
        address nativeTokenContractAddress, 
        address voteController, 
        address loggerContractAddress, 
        address communityAccountContractAddress,
        bool emergencyWithdrawEnabled
        ) public returns(address) {
        UpgradedCommunity upgradedCommunity = new UpgradedCommunity(
        minimumStakingRequirement, 
        lockupPeriodSeconds, 
        curator, 
        communityTokenContractAddress,
        nativeTokenContractAddress, 
        voteController,
        loggerContractAddress,
        communityAccountContractAddress,
        emergencyWithdrawEnabled);
        return address(upgradedCommunity);
    }
}
