pragma solidity ^0.4.8;

// The logging library allows the events to be watched without the need to watch each contract 
contract ILogger {

    event TaskCreated(address msgSender, uint _uuid, uint _amount);
    event ProjectCreated(address msgSender, uint _uuid, uint _amount, address _address);
    event Launched(address msgSender, uint launchUuid, address launchedTribeAddress, address launchedTokenAddress);
    event NewSmartToken(address msgSender, address _token);
    event Issuance(address msgSender, uint256 _amount);
    event Destruction(address msgSender, uint256 _amount);
    event Transfer(address msgSender, address indexed _from, address indexed _to, uint256 _value);
    event Approval(address msgSender, address indexed _owner, address indexed _spender, uint256 _value);
    event NewTribeAddress(address msgSender, address _newAddress);
    
    mapping (address => address) public contractOwners;

    function setNewContractOwner(address _address) public;
    function emitTaskCreated(uint _uuid, uint _amount) public;
    function emitProjectCreated(uint _uuid, uint _amount, address _address) public;
    function emitLaunched(uint _launchUuid, address tribe, address tribeToken) public;
    function emitNewSmartToken(address _token) public;
    function emitIssuance(uint256 _amount) public;
    function emitDestruction(uint256 _amount) public;
    function emitTransfer(address _from, address _to, uint256 _value) public;
    function emitApproval(address _owner, address _spender, uint256 _value) public;
    function emitNewTribeAddress(address _address) public;
}