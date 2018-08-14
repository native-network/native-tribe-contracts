pragma solidity ^0.4.24;

import "./utility/Owned.sol";

/*

Centralized logger allows backend to easily watch all events on all tribes without needing to watch each tribe individually

*/
contract Logger is Owned{

    // Tribe
    event TaskCreated(address msgSender, uint _uuid, uint _amount);
    event ProjectCreated(address msgSender, uint _uuid, uint _amount, address _address);

    // SmartToken
    // triggered when a smart token is deployed - the _token address is defined for forward compatibility
    //  in case we want to trigger the event from a factory
    event NewSmartToken(address msgSender, address _token);
    // triggered when the total supply is increased
    event Issuance(address msgSender, uint256 _amount);
    // triggered when the total supply is decreased
    event Destruction(address msgSender, uint256 _amount);
    // erc20
    event Transfer(address msgSender, address indexed _from, address indexed _to, uint256 _value);
    event Approval(address msgSender, address indexed _owner, address indexed _spender, uint256 _value);
    
    // Logger
    event NewTribeAddress(address msgSender, address _newAddress);
    
    event GenericLog(string messageType, string message);
    mapping (address => bool) public permissionedAddresses;

    modifier hasLoggerPermissions(address _address) {
        require(permissionedAddresses[_address] == true);
        _;
    }

    function addNewLoggerPermission(address addressToPermission) ownerOnly public {
        permissionedAddresses[addressToPermission] = true;
    }

    function emitTaskCreated(uint uuid, uint amount) public hasLoggerPermissions(msg.sender) {
        emit TaskCreated(msg.sender, uuid, amount);
    }

    function emitProjectCreated(uint uuid, uint amount, address rewardAddress) public hasLoggerPermissions(msg.sender) {
        emit ProjectCreated(msg.sender, uuid, amount, rewardAddress);
    }
    
    function emitNewSmartToken(address token) public hasLoggerPermissions(msg.sender) {
        emit NewSmartToken(msg.sender, token);
    }

    function emitIssuance(uint256 amount) public hasLoggerPermissions(msg.sender) {
        emit Issuance(msg.sender, amount);
    }

    function emitDestruction(uint256 amount) public hasLoggerPermissions(msg.sender) {
        emit Destruction(msg.sender, amount);
    }

    function emitTransfer(address from, address to, uint256 value) public hasLoggerPermissions(msg.sender) {
        emit Transfer(msg.sender, from, to, value);
    }

    function emitApproval(address owner, address spender, uint256 value) public hasLoggerPermissions(msg.sender) {
        emit Approval(msg.sender, owner, spender, value);
    }

    function emitGenericLog(string messageType, string message) public hasLoggerPermissions(msg.sender) {
        emit GenericLog(messageType, message);
    }
}