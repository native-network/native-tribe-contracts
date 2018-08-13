pragma solidity ^0.4.8;

contract ILogger {
    function addNewLoggerPermission(address addressToPermission) public;
    function emitTaskCreated(uint uuid, uint amount) public;
    function emitProjectCreated(uint uuid, uint amount, address rewardAddress) public;
    function emitNewSmartToken(address token) public;
    function emitIssuance(uint256 amount) public;
    function emitDestruction(uint256 amount) public;
    function emitTransfer(address from, address to, uint256 value) public;
    function emitApproval(address owner, uint spender, uint256 value) public;
    function emitGenericLog(string messageType, string message) public;
}