pragma solidity ^0.4.8;

import "./Logger.sol";
import "./Tribe.sol";
import "./Registrar.sol";
import "./TribeAccount.sol";
import "./factories/RegistrarFactory.sol";
import "./factories/SmartTokenFactory.sol";
import "./factories/TribeAccountFactory.sol";
import "./factories/TribeFactory.sol";

import "./utility/Owned.sol";
import "./interfaces/ITribeLauncher.sol";

/*

This helper contract is used to easily launch and connect all of the pieces required for a new tribe.  These are:

1) Tribe token - The smart token used by the tribe for staking
2) Tribe storage - Stores and tracks all staked and escrowed funds
3) Tribe  - Core logic of the tribe
4) Registrar - Stores latest tribe address

*/
contract TribeLauncher is Owned, ITribeLauncher {
    mapping (uint => address) public launchedTribeRegistrars;
    uint public launchedTribeCount;
    
    address public TribeAccountContractAddress;
    
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
        // 5 - tribeAccountFactoryContractAddress
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
        launchedTokenCount = SafeMath.add(launchedTokenCount,1);
        
        TribeAccountFactory tribeAccountFactory = TribeAccountFactory(addresses[5]);
        TribeAccount tribeAccount = TribeAccount(tribeAccountFactory.create());
        
        ITribe tribe = launchTribeWithFactory(ai, addresses, address(tribeToken), address(tribeAccount));
        tribeAccount.transferOwnershipNow(address(tribe));

        IRegistrar registrar = launchRegistrar(addresses[6], ITribe(tribe), addresses[0]);

        launchedTribeRegistrars[launchedTribeCount] = registrar;
        launchedTribeCount = SafeMath.add(launchedTribeCount, 1);

        Logger logger = Logger(addresses[3]);
        logger.addNewLoggerPermission(address(tribe));

        // THIS MUST BE CALLED to give logger ownership back to the sender
        logger.transferOwnershipNow(msg.sender);
    
        emit Launched(msg.sender, ai[0], tribe, tribeToken, registrar);
    }

    // Abstracted to avoid stack-depth error in launchTribe()
    function launchRegistrar(address registrarFactoryContractAddress, ITribe tribe, address curatorAddress) public returns(IRegistrar) {
        RegistrarFactory registrarFactory = RegistrarFactory(registrarFactoryContractAddress);
        IRegistrar registrar = Registrar(registrarFactory.create());
        registrar.addNewAddress(address(tribe));
        registrar.transferOwnershipNow(curatorAddress);
        return registrar;
    }

    // Abstracted to avoid stack-depth error in launchTribe()
    function launchTribeWithFactory(uint[] ai, address[] addresses, address _tribeTokenAddress, address _tribeAccountAddress) public returns(ITribe) {
        TribeFactory tribeFactory = TribeFactory(addresses[7]);
        Tribe tribe = Tribe(Tribe(tribeFactory.create(ai[1], ai[2], addresses[0], _tribeTokenAddress, addresses[1], addresses[2], addresses[3], _tribeAccountAddress)));
        return tribe;
    }
}