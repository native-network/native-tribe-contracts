pragma solidity ^0.4.24;

/*
    Community Interface
*/
contract ICommunity {
    function transferCurator(address _curator) public;
    function transferVoteController(address _voteController) public;
    function setMinimumStakingRequirement(uint _minimumStakingRequirement) public;
    function setLockupPeriodSeconds(uint _lockupPeriodSeconds) public;
    function setLogger(address newLoggerAddress) public;
    function setTokenAddresses(address newNativeTokenAddress, address newCommunityTokenAddress) public;
    function setCommunityAccount(address newCommunityAccountAddress) public;
    function setCommunityAccountOwner(address newOwner) public;
    function getAvailableDevFund() public view returns (uint);
    function getLockedDevFundAmount() public view returns (uint);
    function createNewTask(uint uuid, uint amount) public;
    function cancelTask(uint uuid) public;
    function rewardTaskCompletion(uint uuid, address user) public;
    function createNewProject(uint uuid, uint amount, address projectPayee) public;
    function cancelProject(uint uuid) public;
    function rewardProjectCompletion(uint uuid) public;
    function stakeCommunityTokens() public;
    function unstakeCommunityTokens() public;
    function isMember(address memberAddress)public view returns (bool);
}