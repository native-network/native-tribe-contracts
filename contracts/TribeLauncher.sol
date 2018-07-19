pragma solidity ^0.4.8;

import './Tribe.sol';
import './SmartToken.sol';
import './utility/Owned.sol';

contract TribeLauncher is Owned {

    event Launched(uint launchUuid, address launchedTribeAddress, address launchedTokenAddress);
    mapping (uint => address) public launchedTribes;
    uint public launchedTribeCount;

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
        
        SmartToken tribeToken = new SmartToken(tokenName, tokenTotalSupply, tokenDecimals, tokenSymbol, tokenVersion);
        launchedTokens[launchedTokenCount] = tribeToken;
        launchedTokenCount++;
        
        
        Tribe tribe = new Tribe(_minimumStakingRequirement, _lockupPeriod, _curatorAddress, address(tribeToken), _nativeTokenContractAddress, _voteController);
        launchedTribes[launchedTribeCount] = tribe;
        launchedTribeCount++;

        emit Launched(_launchUuid, tribe, tribeToken);
    }

    constructor() public {

    }
}