pragma solidity ^0.4.8;

import '../interfaces/ILogger.sol';
import '../TribeStorage.sol';
import '../interfaces/ISmartToken.sol';
import '../utility/SafeMath.sol';

contract UpgradedTribe {
    address public curator;
    address public voteController;
    uint public minimumStakingRequirement;
    uint public lockupPeriodSeconds;
    ILogger public logger;
    ISmartToken public nativeTokenInstance;
    ISmartToken public tribeTokenInstance;
    TribeStorage public tribeStorage;
    bool emergencyWithdrawEnabled;

    modifier onlyCurator {
        require(msg.sender == curator);
        _;
    }

    modifier onlyVoteController {
        require(msg.sender == voteController);
        _;
    }

    modifier sufficientDevFundBalance (uint amount) {
        require(amount <= getAvailableDevFund());
            require(true);
        _;
    }

    constructor(uint _minimumStakingRequirement,
                uint _lockupPeriodSeconds,
                address _curator,
                address _tribeTokenContractAddress,
                address _nativeTokenContractAddress,
                address _voteController,
                address _loggerContractAddress,
                address _tribeStorageContractAddress,
                bool _emergencyWithdrawEnabled
                ) public {
                    tribeStorage = TribeStorage(_tribeStorageContractAddress);
                    curator = _curator;
                    minimumStakingRequirement = _minimumStakingRequirement;
                    lockupPeriodSeconds = _lockupPeriodSeconds;
                    logger = ILogger(_loggerContractAddress);
                    voteController = _voteController;
                    nativeTokenInstance = ISmartToken(_nativeTokenContractAddress);
                    tribeTokenInstance = ISmartToken(_tribeTokenContractAddress);
                    emergencyWithdrawEnabled = _emergencyWithdrawEnabled;
    }

    // New test function in the upgraded contract
    // For emergency use by curator in case of critical EVM or smart contract vulnerability.
    function emergencyFundRetrieval() public onlyCurator {

        require(emergencyWithdrawEnabled);

        uint totaBalanceNativeToken = nativeTokenInstance.balanceOf(address(tribeStorage));
        uint totaBalanceTribeToken = tribeTokenInstance.balanceOf(address(tribeStorage));

        tribeStorage.transferTokensOut(address(nativeTokenInstance), curator, totaBalanceNativeToken);
        tribeStorage.transferTokensOut(address(tribeTokenInstance), curator, totaBalanceTribeToken);
    }

    // TODO add events to each of these
    function transferCurator(address _curator) public onlyCurator {
        curator = _curator;
    }

    function transferVoteController(address _voteController) public onlyCurator {
        voteController = _voteController;
    }

    function setMinimumStakingRequirement(uint _minimumStakingRequirement) public onlyCurator {
        minimumStakingRequirement = _minimumStakingRequirement;
    }

    function setLockupPeriodSeconds(uint _lockupPeriodSeconds) public onlyCurator {
        lockupPeriodSeconds = _lockupPeriodSeconds;
    }

    function setLogger(address newLoggerAddress) public onlyCurator {
        logger = ILogger(newLoggerAddress);
    }

    function setTokenAddresses(address newNativeTokenAddress, address newTribeTokenAddress) public onlyCurator {
        nativeTokenInstance = ISmartToken(newNativeTokenAddress);
        tribeTokenInstance = ISmartToken(newTribeTokenAddress);
    }

    function setTribeStorage(address newTribeStorageAddress) public onlyCurator {
        tribeStorage = TribeStorage(newTribeStorageAddress);
    }

    function setTribeStorageOwner(address newOwner) public onlyCurator {
        tribeStorage.transferOwnershipNow(newOwner);
    }

    // gets the amount in the dev fund that isn't locked up by a project or task stake
    function getAvailableDevFund() public view returns (uint) {
        uint devFundBalance = nativeTokenInstance.balanceOf(address(tribeStorage));
        return SafeMath.safeSub(devFundBalance, getLockedDevFundAmount());
    }

    function getLockedDevFundAmount() public view returns (uint) {
        return SafeMath.safeAdd(tribeStorage.totalTaskEscrow(), tribeStorage.totalProjectEscrow());
    }

    // Task escrow code below (in native tokens)
    
    // updates the escrow values for a new task
    function createNewTask(uint uuid, uint amount) public onlyCurator sufficientDevFundBalance (amount) {
        tribeStorage.setEscrowedTaskBalances(uuid, amount);
        tribeStorage.setTotalTaskEscrow(SafeMath.safeAdd(tribeStorage.totalTaskEscrow(), amount));
        logger.emitTaskCreated(uuid, amount);
    }

    // subtracts the tasks escrow and sets the tasks escrow balance to 0
    function cancelTask(uint uuid) public onlyCurator {
        tribeStorage.setTotalTaskEscrow(SafeMath.safeSub(tribeStorage.totalTaskEscrow(), tribeStorage.escrowedTaskBalances(uuid)));
        tribeStorage.setEscrowedTaskBalances(uuid , 0);
    }
    
    // pays put to the task completer and updates the escrow balances
    function rewardTaskCompletion(uint uuid, address user) public onlyVoteController {

        tribeStorage.transferTokensOut(address(nativeTokenInstance), user, tribeStorage.escrowedTaskBalances(uuid));

        tribeStorage.setTotalTaskEscrow(SafeMath.safeSub(tribeStorage.totalTaskEscrow(), tribeStorage.escrowedTaskBalances(uuid)));
        tribeStorage.setEscrowedTaskBalances(uuid, 0);
    }

    // Project escrow code below (in native tokens)

    // updates the escrow values along with the project payee for a new project
    function createNewProject(uint uuid, uint amount, address projectPayee) public onlyCurator sufficientDevFundBalance (amount) {
        tribeStorage.setEscrowedProjectBalances(uuid, amount);
        tribeStorage.setEscrowedProjectPayees(uuid, projectPayee);
        tribeStorage.setTotalProjectEscrow(SafeMath.safeAdd(tribeStorage.totalProjectEscrow(), amount));
        logger.emitProjectCreated(uuid, amount, projectPayee);
    }

    // subtracts the tasks escrow and sets the tasks escrow balance to 0
    function cancelProject(uint uuid) public onlyCurator {
        tribeStorage.setTotalProjectEscrow(SafeMath.safeSub(tribeStorage.totalProjectEscrow(), tribeStorage.escrowedProjectBalances(uuid)));
        tribeStorage.setEscrowedProjectBalances(uuid, 0);
    }
    
    // pays out the project completion and then updates the escrow balances
    function rewardProjectCompletion(uint uuid) public onlyVoteController {
        tribeStorage.transferTokensOut(address(nativeTokenInstance), tribeStorage.escrowedProjectPayees(uuid), tribeStorage.escrowedProjectBalances(uuid));
        tribeStorage.setTotalProjectEscrow(SafeMath.safeSub(tribeStorage.totalProjectEscrow(), tribeStorage.escrowedProjectBalances(uuid)));
        tribeStorage.setEscrowedProjectBalances(uuid, 0);
    }

    // Staking code below (in tribe tokens)
    // TODO make it steak as much additional funds required to become a member (i.e. if the staking minimum goes up).  Do not use amount variable  
    function stakeTribeTokens(uint amount) public {

        if(!tribeTokenInstance.transferFrom(msg.sender, address(tribeStorage), amount)) {
            revert();
        }

        tribeStorage.setStakedBalances(SafeMath.safeAdd(tribeStorage.stakedBalances(msg.sender), amount), msg.sender);
        tribeStorage.setTotalStaked(SafeMath.safeAdd(tribeStorage.totalStaked(), amount));
        tribeStorage.setTimeStaked(now, msg.sender);
    }

    // checks that a user is able to unstake by looking at the lokcup period and the balance
    // unstakes a tribe and sends funds back to the user

    /// TODO unstaking should unstake everything
    function unstakeTribeTokens(uint amount) public {

        if(tribeStorage.stakedBalances(msg.sender) < amount) {
            revert();
        }
        if(now - tribeStorage.timeStaked(msg.sender) < lockupPeriodSeconds) {
            revert();
        }

        tribeStorage.setStakedBalances(SafeMath.safeSub(tribeStorage.stakedBalances(msg.sender), amount), msg.sender);
        tribeStorage.setTotalStaked(SafeMath.safeSub(tribeStorage.totalStaked(), amount));
        tribeTokenInstance.transfer(msg.sender, amount);
    }

    // checks that the user is fully staked
    function isMember(address memberAddress) public view returns (bool) {
        return ( tribeStorage.stakedBalances(memberAddress) >= minimumStakingRequirement );
    }
}