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
    /**
    @dev returns the sum of _x and _y, asserts if the calculation overflows
    @param _x   value 1
    @param _y   value 2
    @return sum
    */
    function safeAdd(uint256 _x, uint256 _y) internal pure returns (uint256) {
        uint256 z = _x + _y;
        assert(z >= _x);
        return z;
    }

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
        launchedTokenCount = safeAdd(launchedTokenCount,1);
        
        Tribe tribe = new Tribe(_minimumStakingRequirement, _lockupPeriod, _curatorAddress, address(tribeToken), _nativeTokenContractAddress, _voteController, LoggerContractAddress);
        launchedTribes[launchedTribeCount] = tribe;
        launchedTribeCount = safeAdd(launchedTribeCount,1);

        Logger log = Logger(LoggerContractAddress);
        log.setNewContractOwner(address(this));
        log.emitLaunched(_launchUuid, tribe, tribeToken);
    }

    constructor(address _LoggerContractAddress) public {
        LoggerContractAddress = _LoggerContractAddress;
    }
}