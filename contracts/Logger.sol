pragma solidity ^0.4.8;

import './utility/Owned.sol';

contract Logger is Owned {

    // Tribe
    event TaskCreated(uint _uuid, uint _amount);
    event ProjectCreated(uint _uuid, uint _amount, address _address);

    // TribeLauncher
    event Launched(uint launchUuid, address launchedTribeAddress, address launchedTokenAddress);

    // SmartToken
    // triggered when a smart token is deployed - the _token address is defined for forward compatibility, in case we want to trigger the event from a factory
    event NewSmartToken(address _token);
    // triggered when the total supply is increased
    event Issuance(uint256 _amount);
    // triggered when the total supply is decreased
    event Destruction(uint256 _amount);
    // erc20
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
    
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
        emit TaskCreated(_uuid, _amount);
    }

    function emitProjectCreated(uint _uuid, uint _amount, address _address) public isContractOwner(msg.sender) {
        emit ProjectCreated(_uuid, _amount, _address);
    }
    
    function emitLaunched(uint _launchUuid, address tribe, address tribeToken) public isContractOwner(msg.sender) {
        emit Launched(_launchUuid, tribe, tribeToken);
    }

    function emitNewSmartToken(address _token) public isContractOwner(msg.sender) {
        emit NewSmartToken(_token);
    }

    function emitIssuance(uint256 _amount) public isContractOwner(msg.sender) {
        emit Issuance(_amount);
    }

    function emitDestruction(uint256 _amount) public isContractOwner(msg.sender) {
        emit Destruction(_amount);
    }

    function emitTransfer(address _from, address _to, uint256 _value) public isContractOwner(msg.sender) {
        emit Transfer(_from, _to, _value);
    }

    function emitApproval(address _owner, address _spender, uint256 _value) public isContractOwner(msg.sender) {
        emit Approval(_owner, _spender, _value);
    }

    constructor() public {
    }
}