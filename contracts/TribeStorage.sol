pragma solidity ^0.4.8;

interface TriberStorageInterface {
    function setLockupPeriodSeconds (uint _lockupPeriodSeconds) external;
    function setTribeTokenContractAddress (address _nativeTokenContractAddress) external;
    function setNativeTokenContractAddress (address _nativeTokenContractAddress) external;
    function setMinimumStakingRequirement (uint _minimumStakingRequirement) external;
    function setStakedBalances (uint _amount) external;
    function setTotalStaked (uint _totalStaked) external;
    function setTimeStaked (address _address) external;
    // function getStakedBalances (uint _uuid) external;
    // function getTimeStaked (address _address) external;
}

contract TribeStorage {

    address public curator;
    address public voteController;
    address public tribeTokenContractAddress;
    address public nativeTokenContractAddress;
    address public LoggerContractAddress;

    
    // Staking Variables.  In tribe token
    uint public minimumStakingRequirement;
    uint public lockupPeriodSeconds;
    mapping (address => uint256) public stakedBalances;
    mapping (address => uint256) public timeStaked;
    uint public totalStaked;


    // Escrow variables.  In native token
    uint public totalTaskEscrow;
    uint public totalProjectEscrow;
    mapping (uint256 => uint256) public escrowedTaskBalances;
    mapping (uint256 => uint256) public escrowedProjectBalances;
    mapping (uint256 => address) public escrowedProjectPayees;


    // set a lockup period for staking // is onlyCurator accurate here? It's the contract setting this
    function setLockupPeriodSeconds(uint _lockupPeriodSeconds) public  {
        lockupPeriodSeconds = _lockupPeriodSeconds;
    }
    function setTribeTokenContractAddress(address _tribeTokenContractAddress) public {
        tribeTokenContractAddress = _tribeTokenContractAddress;
    }
    function setNativeTokenContractAddress(address _nativeTokenContractAddress) public  {
        nativeTokenContractAddress = _nativeTokenContractAddress;
    }
    function setMinimumStakingRequirement(uint _minimumStakingRequirement) public {
        minimumStakingRequirement = _minimumStakingRequirement;
    }
    function setStakedBalances(uint _amount) public  {
        stakedBalances[msg.sender] = _amount;
    }
    function setTotalStaked(uint _totalStaked) public  {
        totalStaked = _totalStaked;
    }
    function setTimeStaked(uint _timeStaked) public  {
        timeStaked[msg.sender] = _timeStaked;
    }
    function getStakedBalances(address _address) public view returns (uint) {
        return stakedBalances[_address];
    }
    function getTimeStaked(address _address) public view returns (uint) {
        return timeStaked[_address];
    }
    function getEscrowedTaskBalances(uint _uuid) public view returns (uint) {
        return escrowedTaskBalances[_uuid];
    }
    function getEscrowedProjectPayees(uint _uuid) public view returns (address) {
        return escrowedProjectPayees[_uuid];
    }
}