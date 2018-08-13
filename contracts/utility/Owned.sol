pragma solidity ^0.4.8;

import "../interfaces/IOwned.sol";

/*
    This is the "owned" utility contract used by bancor with one additional function - transferOwnershipNow()
    
    The original unmodified version can be found here:
    https://github.com/bancorprotocol/contracts/commit/63480ca28534830f184d3c4bf799c1f90d113846
    
    Provides support and utilities for contract ownership
*/
contract Owned is IOwned {
    address public owner;
    address public newOwner;

    event OwnerUpdate(address indexed _prevOwner, address indexed _newOwner);

    /**
        @dev constructor
    */
    constructor() public {
        owner = msg.sender;
    }
    
    // allows execution by the owner only
    modifier ownerOnly {
        require(msg.sender == owner);
        _;
    }
    
    /**
        @dev allows transferring the contract ownership
        the new owner still needs to accept the transfer
        can only be called by the contract owner
        @param _newOwner    new contract owner
    */
    function transferOwnership(address _newOwner) public ownerOnly {
        require(_newOwner != owner);
        newOwner = _newOwner;
    }
    
    /**
        @dev used by a new owner to accept an ownership transfer
    */
    function acceptOwnership() public {
        require(msg.sender == newOwner);
        emit OwnerUpdate(owner, newOwner);
        owner = newOwner;
        newOwner = address(0);
    }

    /**
        @dev transfers the contract ownership without needing the new owner to accept ownership
        @param newContractOwner    new contract owner
    */
    function transferOwnershipNow(address newContractOwner) ownerOnly public {
        require(newContractOwner != owner);
        emit OwnerUpdate(owner, newContractOwner);
        owner = newContractOwner;
    }

}