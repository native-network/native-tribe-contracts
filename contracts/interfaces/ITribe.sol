pragma solidity ^0.4.8;

contract ITribe {
    // TODO make this better
    // address public voteController;
    // uint public minimumStakingRequirement;
    // uint public lockupPeriodSeconds;
    // ISmartToken public nativeTokenInstance;
    // ISmartToken public tribeTokenInstance;
    // ILogger public logger;
    // ITribeStorage public tribeStorage;
    // function transferCurator(address _curator) onlyCurator {
    // }
    // function transferVoteController(address _voteController);
    // function setMinimumStakingRequirement(uint _minimumStakingRequirement) onlyCurator;
    // function setLockupPeriodSeconds(uint _lockupPeriodSeconds) onlyCurator;
    // function setLogger(address newLoggerAddress) onlyCurator;
    // function setTokenAddresses(address newNativeTokenAddress, address newTribeTokenAddress) onlyCurator;
    // function setTribeStorage(address newTribeStorageAddress) onlyCurator;
    function getAvailableDevFund() public view returns (uint);
    function getLockedDevFundAmount() public view returns (uint);
    function createNewTask(uint uuid, uint amount) public;
    function cancelTask(uint uuid) public;
    function rewardTaskCompletion(uint uuid, address user) public;
    function createNewProject(uint uuid, uint amount, address projectPayee) public;
    function cancelProject(uint uuid) public;
    function rewardProjectCompletion(uint uuid) public;
    function stakeTribeTokens(uint amount) public;
    function unstakeTribeTokens(uint amount) public;
    function isMember(address memberAddress) public view returns (bool);

}