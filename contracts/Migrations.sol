pragma solidity ^0.4.23;

contract Migrations {
    address public owner;
    uint public last_completed_migration;

    /// @notice Creates contract; sets owner
    constructor() public {
        owner = msg.sender;
    }

    modifier restricted() {
        if (msg.sender == owner) _;
    }

    /// @param completed Corresponds to last completed migration
    /// @notice Allows for the pickup of contract launching if stopped
    /// @notice halfway through.
    /// @notice Requires sender to be owner
    function setCompleted(uint completed) public restricted {
        last_completed_migration = completed;
    }

    /// @notice Requires sender to be owner
    function upgrade(address new_address) public restricted {
        Migrations upgraded = Migrations(new_address);
        upgraded.setCompleted(last_completed_migration);
    }
}
