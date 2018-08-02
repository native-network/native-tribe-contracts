pragma solidity ^0.4.8;

import './Logger.sol';
import './Tribe.sol';
import './SmartToken.sol';
import './utility/Owned.sol';

contract TribeLauncher is Owned {
    mapping (uint => address) public launchedTribes;
    uint public launchedTribeCount;

    address public LoggerContractAddress;
    
    mapping (uint => address) public launchedTokens;
    uint public launchedTokenCount;

    function launchTribe(
        uint _launchUuid, 
        uint _minimumStakingRequirement, 
        uint _lockupPeriod, 
        address _curatorAddress, 
        address _nativeTokenContractAddress, 
        address _voteController,
        string tokenName,
        uint tokenTotalSupply,
        uint8 tokenDecimals,
        string tokenSymbol,
        string tokenVersion
    ) public ownerOnly {

        SmartToken tribeToken = new SmartToken(tokenName, tokenTotalSupply, tokenDecimals, tokenSymbol, tokenVersion, msg.sender, LoggerContractAddress);
        launchedTokens[launchedTokenCount] = tribeToken;
        launchedTokenCount = SafeMath.safeAdd(launchedTokenCount,1);
        
        Tribe tribe = new Tribe(_minimumStakingRequirement, _lockupPeriod, _curatorAddress, address(tribeToken), _nativeTokenContractAddress, _voteController, LoggerContractAddress);
        launchedTribes[launchedTribeCount] = tribe;
        launchedTribeCount = SafeMath.safeAdd(launchedTribeCount,1);

        Logger log = Logger(LoggerContractAddress);
        log.setNewContractOwner(address(this));
        log.emitLaunched(_launchUuid, tribe, tribeToken);
    }

    constructor(address _LoggerContractAddress) public {
        LoggerContractAddress = _LoggerContractAddress;
    }
}