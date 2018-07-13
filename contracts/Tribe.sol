pragma solidity ^0.4.8;

// TODO -- use safemath for everything
contract Tribe {

    uint minimumStakingRequirement;
    uint lockupPeriod;
    
    function Tribe(uint _minimumStakingRequirement, uint _lockupPeriod) public {
        minimumStakingRequirement = _minimumStakingRequirement;
        lockupPeriod = _lockupPeriod;
    }
}