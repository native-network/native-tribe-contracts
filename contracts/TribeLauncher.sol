pragma solidity ^0.4.8;

import './Registrar.sol';
import './interfaces/ILogger.sol';
import './Tribe.sol';
import './TribeStorage.sol';
import './factories/SmartTokenFactory.sol';
import './factories/TribeStorageFactory.sol';

import './utility/Owned.sol';

contract TribeLauncher is Owned {
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
        
        // TODO use a factory to launch the tribe (gas savings)
        Tribe tribe = new Tribe(ai[1], ai[2], addresses[0], address(tribeToken), addresses[1], addresses[2], addresses[3], address(tribeStorage));
        tribeStorage.transferOwnershipNow(address(tribe));

        // TODO use a factory to launch the registrar (gas savings)
        Registrar registrar = new Registrar();
        registrar.addNewAddress(address(tribe));
        registrar.transferOwnershipNow(addresses[0]);
        launchedTribeRegistrars[launchedTribeCount] = registrar;
        launchedTribeCount = SafeMath.safeAdd(launchedTribeCount, 1);

        emit Launched(msg.sender, ai[0], tribe, tribeToken, registrar);
    }
    
}