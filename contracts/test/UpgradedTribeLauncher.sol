pragma solidity ^0.4.8;

import '../Logger.sol';
import './UpgradedTribe.sol';
import '../Registrar.sol';
import '../TribeStorage.sol';
import '../factories/RegistrarFactory.sol';
import '../factories/SmartTokenFactory.sol';
import '../factories/TribeStorageFactory.sol';
import '../factories/TribeFactory.sol';

import '../utility/Owned.sol';

// Launches a new upgraded tribe
contract UpgradedTribeLauncher is Owned {
    mapping (uint => address) public launchedTribeRegistrars;
    uint public launchedTribeCount;
    
    address public TribeStorageContractAddress;
    
    event Launched(address msgSender, uint launchUuid, address launchedTribeAddress, address launchedTokenAddress, address launchedRegistrarddress);
    
    mapping (uint => address) public launchedTokens;
    uint public launchedTokenCount;
    
    function launchTribe(
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
        // 5 - tribeStorageFactoryContractAddress
        // 6 - registrarFactoryContractAddress
        // 7 - tribeFactoryContractAddress
        address[] addresses,
        string tokenName,
        string tokenSymbol,
        string tokenVersion
    ) public ownerOnly {
        SmartTokenFactory smartTokenFactory = SmartTokenFactory(addresses[4]);
        SmartToken tribeToken = SmartToken(smartTokenFactory.create(tokenName, ai[3], uint8(ai[4]), tokenSymbol, tokenVersion, msg.sender));
        tribeToken.transferOwnershipNow(addresses[0]);
        launchedTokens[launchedTokenCount] = tribeToken;
        launchedTokenCount = SafeMath.safeAdd(launchedTokenCount,1);
        
        TribeStorageFactory tribeStorageFactory = TribeStorageFactory(addresses[5]);
        TribeStorage tribeStorage = TribeStorage(tribeStorageFactory.create());

        UpgradedTribe tribe = UpgradedTribe(launchTribeWithFactory(ai, addresses, address(tribeToken), address(tribeStorage)));
        tribeStorage.transferOwnershipNow(address(tribe));

        // Using the launchRegistrar function to avoid stack becoming too deep
        Registrar registrar = launchRegistrar(addresses[6], tribe, addresses[0]);

        launchedTribeRegistrars[launchedTribeCount] = registrar;
        launchedTribeCount = SafeMath.safeAdd(launchedTribeCount, 1);

        Logger logger = Logger(addresses[3]);
        logger.addNewLoggerPermission(address(tribe));
        // THIS MUST BE CALLED to give permission back to the sender
        logger.transferOwnershipNow(msg.sender);
    
        emit Launched(msg.sender, ai[0], tribe, tribeToken, registrar);
    }

    // Abstracted to avoid stack-depth error in launchTribe()
    function launchRegistrar(address registrarFactoryContractAddress, UpgradedTribe tribe, address curatorAddress) public returns(Registrar) {
        RegistrarFactory registrarFactory = RegistrarFactory(registrarFactoryContractAddress);
        Registrar registrar = Registrar(registrarFactory.create());
        registrar.addNewAddress(address(tribe));
        registrar.transferOwnershipNow(curatorAddress);
        return registrar;
    }

    // Abstracted to avoid stack-depth error in launchTribe()
    function launchTribeWithFactory(uint[] ai, address[] addresses, address _tribeTokenAddress, address _tribeStorageAddress) public returns(UpgradedTribe) {
        TribeFactory tribeFactory = TribeFactory(addresses[7]);
        UpgradedTribe tribe = UpgradedTribe(tribeFactory.create(ai[1], ai[2], addresses[0], _tribeTokenAddress, addresses[1], addresses[2], addresses[3], _tribeStorageAddress));
        return tribe;
    }
    
}