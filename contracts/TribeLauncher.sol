pragma solidity ^0.4.8;

import './Logger.sol';
import './Registrar.sol';
import './Tribe.sol';
import './SmartToken.sol';
import './utility/Owned.sol';

contract TribeLauncher is Owned {
    mapping (uint => address) public launchedTribes;
    uint public launchedTribeCount;

    address public LoggerContractAddress;
    event Launched(address msgSender, uint launchUuid, address launchedTribeAddress, address launchedTokenAddress);
    
    mapping (uint => address) public launchedTokens;
    uint public launchedTokenCount;

    uint _launchUuidIndex = 0;
    uint _minimumStakingRequirementIndex = 1;
    uint _lockupPeriodIndex = 2;
    uint tokenTotalSupplyIndex = 3;
    uint tokenDecimalsIndex = 4;

    function launchTribe(
        uint[] ai,
        address _curatorAddress, 
        address _nativeTokenContractAddress, 
        address _voteController,
        string tokenName,
        string tokenSymbol,
        string tokenVersion,
        address _LoggerContractAddress
    ) public ownerOnly {
        
        SmartToken tribeToken = new SmartToken(tokenName, ai[tokenTotalSupplyIndex], uint8(ai[tokenDecimalsIndex]), tokenSymbol, tokenVersion, msg.sender, LoggerContractAddress);
        launchedTokens[launchedTokenCount] = tribeToken;
        launchedTokenCount = SafeMath.safeAdd(launchedTokenCount,1);
        
        Tribe tribe = new Tribe(ai[_minimumStakingRequirementIndex], ai[_lockupPeriodIndex], _curatorAddress, address(tribeToken), _nativeTokenContractAddress, _voteController, LoggerContractAddress);
        
        Registrar registrar = new Registrar(address(tribe), _LoggerContractAddress);
        launchedTribes[launchedTribeCount] = registrar;
        launchedTribeCount = SafeMath.safeAdd(launchedTribeCount,1);
        emit Launched(msg.sender, ai[_launchUuidIndex], tribe, tribeToken);

        // setupLogger(_LoggerContractAddress, ai[_launchUuidIndex], registrar, tribeToken);
    }

    constructor(address _LoggerContractAddress) public {
        LoggerContractAddress = _LoggerContractAddress;
    }
}