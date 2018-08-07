pragma solidity ^0.4.8;

import './utility/Owned.sol';

// The logging library allows the events to be watched without the need to watch each contract 
contract Logger is Owned {

    // Tribe
    event TaskCreated(address msgSender, uint _uuid, uint _amount);
    event ProjectCreated(address msgSender, uint _uuid, uint _amount, address _address);

    // TribeLauncher
    event Launched(address msgSender, uint launchUuid, address launchedTribeAddress, address launchedTokenAddress);

    // SmartToken
    // triggered when a smart token is deployed - the _token address is defined for forward compatibility, in case we want to trigger the event from a factory
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
    
    mapping (address => address) public contractOwners;

    // validates an address - currently only checks that it isn't null
    modifier isContractOwner(address _address) {
        require(contractOwners[_address] == _address);
        _;
    }

    function setNewContractOwner(address _address) public {
        contractOwners[_address] = _address;
    }

    function emitTaskCreated(uint _uuid, uint _amount) public isContractOwner(msg.sender) {
        emit TaskCreated(msg.sender, _uuid, _amount);
    }

    function emitProjectCreated(uint _uuid, uint _amount, address _address) public isContractOwner(msg.sender) {
        emit ProjectCreated(msg.sender, _uuid, _amount, _address);
    }
    
    function emitLaunched(uint _launchUuid, address tribe, address tribeToken) public isContractOwner(msg.sender) {
        emit Launched(msg.sender, _launchUuid, tribe, tribeToken);
    }

    function emitNewSmartToken(address _token) public isContractOwner(msg.sender) {
        emit NewSmartToken(msg.sender, _token);
    }

    function emitIssuance(uint256 _amount) public isContractOwner(msg.sender) {
        emit Issuance(msg.sender, _amount);
    }

    function emitDestruction(uint256 _amount) public isContractOwner(msg.sender) {
        emit Destruction(msg.sender, _amount);
    }

    function emitTransfer(address _from, address _to, uint256 _value) public isContractOwner(msg.sender) {
        emit Transfer(msg.sender, _from, _to, _value);
    }

    function emitApproval(address _owner, address _spender, uint256 _value) public isContractOwner(msg.sender) {
        emit Approval(msg.sender, _owner, _spender, _value);
    }

    function emitNewTribeAddress(address _address) public {
        emit NewTribeAddress(msg.sender, _address);
    }

    constructor() public {
    }
}