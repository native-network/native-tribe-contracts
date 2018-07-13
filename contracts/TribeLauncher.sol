pragma solidity ^0.4.8;

import './Tribe.sol';
import './utility/Owned.sol';

contract TribeLauncher is Owned {

    event Launched(uint launchUuid, address launchedAddress);
    mapping (uint => address) public launchedTribes;
    uint public launchedCount;

    function launchTribe(uint _launchUuid, uint _minimumStakingRequirement, uint _lockupPeriod, address _curatorAddress, address _tribeTokenContractAddress) public ownerOnly {
        Tribe tribe = new Tribe(_minimumStakingRequirement, _lockupPeriod, _curatorAddress, _tribeTokenContractAddress);
        launchedTribes[launchedCount] = tribe;
        launchedCount++;
        emit Launched(_launchUuid, tribe);
    }

    constructor() public {
        launchedCount = 0;
    }
}