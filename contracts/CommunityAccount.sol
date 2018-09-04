pragma solidity ^0.4.24;

import "./utility/Owned.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/ICommunityAccount.sol";

/**
@title Tribe Account
@notice This contract is used as a community's data store.
@notice Advantages:
@notice 1) Decouple logic contract from data contract
@notice 2) Safely upgrade logic contract without compromising stored data
*/
contract CommunityAccount is Owned, ICommunityAccount {

    // Staking Variables.  In community token
    mapping (address => uint256) public stakedBalances;
    mapping (address => uint256) public timeStaked;
    uint public totalStaked;

    // Escrow variables.  In native token
    uint public totalTaskEscrow;
    uint public totalProjectEscrow;
    mapping (uint256 => uint256) public escrowedTaskBalances;
    mapping (uint256 => uint256) public escrowedProjectBalances;
    mapping (uint256 => address) public escrowedProjectPayees;
    
    /// @notice This function allows the community to transfer tokens out of the contract.
    /// @param tokenContractAddress Address of community contract
    /// @param destination Destination address of user looking to remove tokens from contract
    /// @param amount Amount to transfer out of community
    function transferTokensOut(address tokenContractAddress, address destination, uint amount) public ownerOnly {
        IERC20 token = IERC20(tokenContractAddress);
        token.transfer(destination, amount);
    }

    /// @notice This is the community staking method
    /// @param _amount Amount to be staked
    /// @param msgSender Address of the staker
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