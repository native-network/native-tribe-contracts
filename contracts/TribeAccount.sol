pragma solidity ^0.4.24;

import "./utility/Owned.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/ITribeAccount.sol";


/*

This contract is used as a tribes data store. This has two distinct advantages
1. We decouble the logic from the data
2. We can safetly upgrade the logic contract without accidently blowing away the stored data

*/

contract TribeAccount is Owned, ITribeAccount {
    
    // Staking Variables.  In tribe token
    mapping (address => uint256) public stakedBalances;
    mapping (address => uint256) public timeStaked;
    uint public totalStaked;
    
    // Escrow variables.  In native token
    uint public totalTaskEscrow;
    uint public totalProjectEscrow;
    mapping (uint256 => uint256) public escrowedTaskBalances;
    mapping (uint256 => uint256) public escrowedProjectBalances;
    mapping (uint256 => address) public escrowedProjectPayees;
    
    // This function allows the tribe to transfer tokens out of the contract.
    function transferTokensOut(address tokenContractAddress, address destination, uint amount) public ownerOnly {
        IERC20 token = IERC20(tokenContractAddress);
        token.transfer(destination, amount);
    }

    function setStakedBalances(uint _amount, address msgSender) public ownerOnly {
        stakedBalances[msgSender] = _amount;
    }

    function setTotalStaked(uint _totalStaked) public ownerOnly {
        totalStaked = _totalStaked;
    }

    function setTimeStaked(uint _timeStaked, address msgSender) public ownerOnly {
        timeStaked[msgSender] = _timeStaked;
    }

    function setEscrowedTaskBalances(uint uuid, uint balance) public ownerOnly {
        escrowedTaskBalances[uuid] = balance;
    }

    function setEscrowedProjectBalances(uint uuid, uint balance) public ownerOnly {
        escrowedProjectBalances[uuid] = balance;
    }

    function setEscrowedProjectPayees(uint uuid, address payeeAddress) public ownerOnly {
        escrowedProjectPayees[uuid] = payeeAddress;
    }

    function setTotalTaskEscrow(uint balance) public ownerOnly {
        totalTaskEscrow = balance;
    }

    function setTotalProjectEscrow(uint balance) public ownerOnly {
        totalProjectEscrow = balance;
    }
}