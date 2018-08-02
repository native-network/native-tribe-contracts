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
    
    mapping (uint => address) public launchedTokens;
    uint public launchedTokenCount;
    /**
    @dev returns the sum of _x and _y, requires if the calculation overflows
    @param _x   value 1
    @param _y   value 2
    @return sum
    */
    function safeAdd(uint256 _x, uint256 _y) internal pure returns (uint256) {
        uint256 z = _x + _y;
        require(z >= _x);
        return z;
    }
    
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
        launchedTokenCount = safeAdd(launchedTokenCount,1);
        
        Tribe tribe = new Tribe(ai[_minimumStakingRequirementIndex], ai[_lockupPeriodIndex], _curatorAddress, address(tribeToken), _nativeTokenContractAddress, _voteController, LoggerContractAddress);
        
        Registrar registrar = new Registrar(address(tribe), _LoggerContractAddress);
        launchedTribes[launchedTribeCount] = registrar;
        launchedTribeCount = safeAdd(launchedTribeCount,1);

        setupLogger(_LoggerContractAddress, ai[_launchUuidIndex], registrar, tribeToken);
    }

    function setupLogger(address LoggerContractAddress, uint _launchUuid, Registrar registrar, SmartToken tribeToken) public {
        Logger log = Logger(LoggerContractAddress);
        log.setNewContractOwner(address(this));
        log.emitLaunched(_launchUuid, registrar, tribeToken);
    }

    constructor(address _LoggerContractAddress) public {
        LoggerContractAddress = _LoggerContractAddress;
    }
}