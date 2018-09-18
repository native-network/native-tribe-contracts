pragma solidity ^0.4.24;

import "./Logger.sol";
import "./Community.sol";
import "./Registrar.sol";
import "./CommunityAccount.sol";
import "./factories/RegistrarFactory.sol";
import "./factories/SmartTokenFactory.sol";
import "./factories/CommunityAccountFactory.sol";
import "./factories/CommunityFactory.sol";
import "./utility/Owned.sol";
import "./interfaces/ICommunityLauncher.sol";

/**
@notice Helper contract used to easily launch and connect all pieces required for new community.  These are:
@notice 1) Community token - The smart token used by the community for staking
@notice 2) Community storage - Stores and tracks all staked and escrowed funds
@notice 3) Community  - Core logic of the community
@notice 4) Registrar - Stores latest community address
*/
contract CommunityLauncher is Owned, ICommunityLauncher {
    mapping (uint => address) public launchedCommunityRegistrars;
    uint public launchedCommunityCount;

    address public CommunityAccountContractAddress;

    event Launched(
        address msgSender,
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
    // 7 - communityFactoryContractAddress
        address[] addresses,
        string tokenName,
        string tokenSymbol,
        string tokenVersion
    ) public ownerOnly {
        SmartTokenFactory smartTokenFactory = SmartTokenFactory(addresses[4]);
        SmartToken communityToken = SmartToken(smartTokenFactory.create(tokenName, ai[3], uint8(ai[4]), tokenSymbol, tokenVersion, msg.sender));
        communityToken.transferOwnershipNow(addresses[0]);
        launchedTokens[launchedTokenCount] = communityToken;
        launchedTokenCount = SafeMath.add(launchedTokenCount,1);

        CommunityAccountFactory communityAccountFactory = CommunityAccountFactory(addresses[5]);
        CommunityAccount communityAccount = CommunityAccount(communityAccountFactory.create());

        ICommunity community = launchCommunityWithFactory(ai, addresses, address(communityToken), address(communityAccount));
        communityAccount.transferOwnershipNow(address(community));

        IRegistrar registrar = launchRegistrar(addresses[6], ICommunity(community), addresses[0]);

        launchedCommunityRegistrars[launchedCommunityCount] = registrar;
        launchedCommunityCount = SafeMath.add(launchedCommunityCount, 1);

        Logger logger = Logger(addresses[3]);
        logger.addNewLoggerPermission(address(community));

        // THIS MUST BE CALLED to give logger ownership back to the sender
        logger.transferOwnershipNow(msg.sender);

        emit Launched(msg.sender, ai[0], community, communityToken, registrar);
    }

    /// @notice Abstracted to avoid stack-depth error in launchCommunity()
    function launchRegistrar(address registrarFactoryContractAddress, ICommunity community, address curatorAddress) public returns(IRegistrar) {
        RegistrarFactory registrarFactory = RegistrarFactory(registrarFactoryContractAddress);
        IRegistrar registrar = Registrar(registrarFactory.create());
        registrar.addNewAddress(address(community));
        registrar.transferOwnershipNow(curatorAddress);
        return registrar;
    }

    /// @notice Abstracted to avoid stack-depth error in launchCommunity()
    function launchCommunityWithFactory(
        uint[] ai,
        address[] addresses,
        address _communityTokenAddress,
        address _communityAccountAddress
    ) public returns(ICommunity) {
        CommunityFactory communityFactory = CommunityFactory(addresses[7]);
        Community community = Community(
            Community(communityFactory.create(
                ai[1],
                ai[2],
                addresses[0],
                _communityTokenAddress,
                addresses[1],
                addresses[2],
                addresses[3],
                _communityAccountAddress)));
        return community;
    }
}