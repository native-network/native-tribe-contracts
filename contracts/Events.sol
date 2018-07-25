pragma solidity ^0.4.8;

contract Events {

    event LaunchedEvent(uint launchUuid, address launchedTribeAddress, address launchedTokenAddress);

    function Launched(uint _launchUuid, address tribe, address tribeToken) public {
        emit LaunchedEvent(_launchUuid, tribe, tribeToken);
    }

    constructor() public {
    }
}