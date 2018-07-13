pragma solidity ^0.4.8;

import './SmartToken.sol';

// TODO -- use safemath for everything
// TODO escrow stuff
contract Tribe {
    
    address curator;

    address public tribeTokenContractAddress;
    
    uint public minimumStakingRequirement;
    uint public lockupPeriodSeconds;

    modifier onlyCurator {
        assert(msg.sender == curator);
        _;
    }

    constructor(uint _minimumStakingRequirement, uint _lockupPeriodSeconds, address _curator, address _tribeTokenContractAddress) public {
        curator = _curator;
        minimumStakingRequirement = _minimumStakingRequirement;
        lockupPeriodSeconds = _lockupPeriodSeconds;
        tribeTokenContractAddress = _tribeTokenContractAddress;
    }

    





    // Staking code below

    mapping (address => uint256) public stakedBalances;
    mapping (address => uint256) public timeStaked;
    

    function setMinimumStakingRequirement(uint _minimumStakingRequirement) public onlyCurator {
        minimumStakingRequirement = _minimumStakingRequirement;
    }

    function setlockupPeriod(uint _lockupPeriodSeconds) public onlyCurator {
        lockupPeriodSeconds = _lockupPeriodSeconds;
    }

    // TODO clarify how staking works.  Can they deposit multiple small amounts over time?   Does it have to be one deposit? etc...
    function stakeTribeTokens(uint amount) public {

        SmartToken tribeTokenInstance = SmartToken(tribeTokenContractAddress);
        
        if(!tribeTokenInstance.transferFrom(msg.sender, address(this), amount)) {
            revert();
        }

        stakedBalances[msg.sender] += amount;
        timeStaked[msg.sender] = now;
    }

    function unstakeTribeTokens(uint amount) public {

        SmartToken tribeTokenInstance = SmartToken(tribeTokenContractAddress);

        if(stakedBalances[msg.sender] < amount) {
            revert();
        }
        if(now - timeStaked[msg.sender] < lockupPeriodSeconds) {
            revert();
        }

        stakedBalances[msg.sender] -= amount;
        tribeTokenInstance.transfer(msg.sender, amount);
    }

    function isMember(address memberAddress) public view returns (bool) {
        return ( stakedBalances[memberAddress] >= minimumStakingRequirement );
    }
}