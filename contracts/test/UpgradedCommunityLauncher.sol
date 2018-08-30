pragma solidity ^0.4.24;

import "../Logger.sol";
import "../Registrar.sol";
import "../CommunityAccount.sol";
import "../factories/RegistrarFactory.sol";
import "../factories/SmartTokenFactory.sol";
import "../factories/CommunityAccountFactory.sol";
import "../utility/Owned.sol";

import "./UpgradedCommunityFactory.sol";
import "./UpgradedCommunity.sol";


/*

Used in integration-test-upgrades.js to demonstrate how we can update a community

*/
contract UpgradedCommunityLauncher is Owned {
    mapping (uint => address) public launchedCommunityRegistrars;
    uint public launchedCommunityCount;
    
    address public CommunityAccountContractAddress;
    
    event Launched(address msgSender,
        uint launchUuid,
        address launchedCommunityAddress,
        address launchedTokenAddress,
        address launchedRegistrarddress);
    
    mapping (uint => address) public launchedTokens;
    uint public launchedTokenCount;
    
    function launchCommunity(
        // Put into arrays too fix stack too deep error.
        // 0 = launchUuid
        // 1 = minimumStakingRequirement
        // 2 = lockupPeriodSeconds
        // 3 = tokenTotalSupply
        // 4 = tokenDecimals
        uint[] ai,
        // Put into arrays too fix stack too deep error.
        // 0 - curatorAddress
        // 1 - nativeTokenContractAddress
        // 2 - voteController
        // 3 - loggerContractAddress
        // 4 - smartTokenFactoryContractAddress
        // 5 - communityAccountFactoryContractAddress
        // 6 - registrarFactoryContractAddress
        // 7 - upgradedCommunityFactoryContractAddress
        address[] addresses,
        string tokenName,
        string tokenSymbol,
        string tokenVersion,
        bool emergencyWithdrawEnabled
    ) public ownerOnly {
        
        SmartTokenFactory smartTokenFactory = SmartTokenFactory(addresses[4]);
        SmartToken communityToken = SmartToken(smartTokenFactory.create(tokenName, ai[3], uint8(ai[4]), tokenSymbol, tokenVersion, msg.sender));
        communityToken.transferOwnershipNow(addresses[0]);
        launchedTokens[launchedTokenCount] = communityToken;
        launchedTokenCount = SafeMath.add(launchedTokenCount,1);
        
        CommunityAccount communityAccount = CommunityAccount(CommunityAccountFactory(addresses[5]).create());

        UpgradedCommunity upgradedCommunity = launchUpgradedCommunityWithFactory(
            ai,
            addresses,
            address(communityToken),
            address(communityAccount),
            emergencyWithdrawEnabled);
        communityAccount.transferOwnershipNow(address(upgradedCommunity));
        
        // Using the launchRegistrar function to avoid stack becoming too deep
        Registrar registrar = launchRegistrar(addresses[6], upgradedCommunity, addresses[0]);

        launchedCommunityRegistrars[launchedCommunityCount] = registrar;
        launchedCommunityCount = SafeMath.add(launchedCommunityCount, 1);

        Logger logger = Logger(addresses[3]);
        logger.addNewLoggerPermission(address(upgradedCommunity));
        // THIS MUST BE CALLED to give permission back to the sender
        logger.transferOwnershipNow(msg.sender);
    
        emit Launched(msg.sender, ai[0], address(upgradedCommunity), communityToken, registrar);
    }

    // Abstracted to avoid stack-depth error in launchCommunity()
    function launchRegistrar(address registrarFactoryContractAddress, UpgradedCommunity community, address curatorAddress) public returns(Registrar) {
        RegistrarFactory registrarFactory = RegistrarFactory(registrarFactoryContractAddress);
        Registrar registrar = Registrar(registrarFactory.create());
        registrar.addNewAddress(address(community));
        registrar.transferOwnershipNow(curatorAddress);
        return registrar;
    }

    // Abstracted to avoid stack-depth error in launchCommunity()
    function launchUpgradedCommunityWithFactory(
        uint[] ai,
        address[] addresses,
        address _communityTokenAddress,
        address communityAccountAddress,
        bool emergencyWithdrawEnabled) public returns(UpgradedCommunity) {
        UpgradedCommunityFactory upgradedCommunityFactory = UpgradedCommunityFactory(addresses[7]);
        UpgradedCommunity community = UpgradedCommunity(
            upgradedCommunityFactory.create(
                ai[1],
                ai[2],
                addresses[0],
                _communityTokenAddress,
                addresses[1],
                addresses[2],
                addresses[3],
                communityAccountAddress,
                emergencyWithdrawEnabled));
        return community;
    }
    
}