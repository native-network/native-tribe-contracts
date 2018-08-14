pragma solidity ^0.4.24;

import "../Logger.sol";
import "../TribeAccount.sol";
import "../interfaces/ISmartToken.sol";
import "../utility/SafeMath.sol";

/*

Used in integration-test-upgrades.js to demonstrate how we can update a tribe

*/
contract UpgradedTribe {
    address public curator;
    address public voteController;
    uint public minimumStakingRequirement;
    uint public lockupPeriodSeconds;
    Logger public logger;
    ISmartToken public nativeTokenInstance;
    ISmartToken public tribeTokenInstance;
    TribeAccount public tribeAccount;
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
                address _tribeAccountContractAddress,
                bool _emergencyWithdrawEnabled
                ) public {
                    tribeAccount = TribeAccount(_tribeAccountContractAddress);
                    curator = _curator;
                    minimumStakingRequirement = _minimumStakingRequirement;
                    lockupPeriodSeconds = _lockupPeriodSeconds;
                    logger = Logger(_loggerContractAddress);
                    voteController = _voteController;
                    nativeTokenInstance = ISmartToken(_nativeTokenContractAddress);
                    tribeTokenInstance = ISmartToken(_tribeTokenContractAddress);
                    emergencyWithdrawEnabled = _emergencyWithdrawEnabled;
    }

    // New test function to demonstrate upgraded contract
    // For emergency use by curator in case of critical EVM or smart contract vulnerability.
    function emergencyFundRetrieval() public onlyCurator {
        require(emergencyWithdrawEnabled);

        uint totaBalanceNativeToken = nativeTokenInstance.balanceOf(address(tribeAccount));
        uint totaBalanceTribeToken = tribeTokenInstance.balanceOf(address(tribeAccount));

        tribeAccount.transferTokensOut(address(nativeTokenInstance), curator, totaBalanceNativeToken);
        tribeAccount.transferTokensOut(address(tribeTokenInstance), curator, totaBalanceTribeToken);
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
        logger = Logger(newLoggerAddress);
    }

    function setTokenAddresses(address newNativeTokenAddress, address newTribeTokenAddress) public onlyCurator {
        nativeTokenInstance = ISmartToken(newNativeTokenAddress);
        tribeTokenInstance = ISmartToken(newTribeTokenAddress);
    }

    function setTribeAccount(address newTribeAccountAddress) public onlyCurator {
        tribeAccount = TribeAccount(newTribeAccountAddress);
    }

    function setTribeAccountOwner(address newOwner) public onlyCurator {
        tribeAccount.transferOwnershipNow(newOwner);
    }

    // gets the amount in the dev fund that isn't locked up by a project or task stake
    function getAvailableDevFund() public view returns (uint) {
        uint devFundBalance = nativeTokenInstance.balanceOf(address(tribeAccount));
        return SafeMath.sub(devFundBalance, getLockedDevFundAmount());
    }

    function getLockedDevFundAmount() public view returns (uint) {
        return SafeMath.add(tribeAccount.totalTaskEscrow(), tribeAccount.totalProjectEscrow());
    }

    // Task escrow code below (in native tokens)
    
    // updates the escrow values for a new task
    function createNewTask(uint uuid, uint amount) public onlyCurator sufficientDevFundBalance (amount) {
        tribeAccount.setEscrowedTaskBalances(uuid, amount);
        tribeAccount.setTotalTaskEscrow(SafeMath.add(tribeAccount.totalTaskEscrow(), amount));
        logger.emitTaskCreated(uuid, amount);
    }

    // subtracts the tasks escrow and sets the tasks escrow balance to 0
    function cancelTask(uint uuid) public onlyCurator {
        tribeAccount.setTotalTaskEscrow(SafeMath.sub(tribeAccount.totalTaskEscrow(), tribeAccount.escrowedTaskBalances(uuid)));
        tribeAccount.setEscrowedTaskBalances(uuid , 0);
    }
    
    // pays put to the task completer and updates the escrow balances
    function rewardTaskCompletion(uint uuid, address user) public onlyVoteController {
        tribeAccount.transferTokensOut(address(nativeTokenInstance), user, tribeAccount.escrowedTaskBalances(uuid));
        tribeAccount.setTotalTaskEscrow(SafeMath.sub(tribeAccount.totalTaskEscrow(), tribeAccount.escrowedTaskBalances(uuid)));
        tribeAccount.setEscrowedTaskBalances(uuid, 0);
    }

    // Project escrow code below (in native tokens)

    // updates the escrow values along with the project payee for a new project
    function createNewProject(uint uuid, uint amount, address projectPayee) public onlyCurator sufficientDevFundBalance (amount) {
        tribeAccount.setEscrowedProjectBalances(uuid, amount);
        tribeAccount.setEscrowedProjectPayees(uuid, projectPayee);
        tribeAccount.setTotalProjectEscrow(SafeMath.add(tribeAccount.totalProjectEscrow(), amount));
        logger.emitProjectCreated(uuid, amount, projectPayee);
    }

    // subtracts the tasks escrow and sets the tasks escrow balance to 0
    function cancelProject(uint uuid) public onlyCurator {
        tribeAccount.setTotalProjectEscrow(SafeMath.sub(
            tribeAccount.totalProjectEscrow(),
            tribeAccount.escrowedProjectBalances(uuid)));
        tribeAccount.setEscrowedProjectBalances(uuid, 0);
    }
    
    // pays out the project completion and then updates the escrow balances
    function rewardProjectCompletion(uint uuid) public onlyVoteController {
        tribeAccount.transferTokensOut(
            address(nativeTokenInstance),
            tribeAccount.escrowedProjectPayees(uuid),
            tribeAccount.escrowedProjectBalances(uuid));
        tribeAccount.setTotalProjectEscrow(SafeMath.sub(
            tribeAccount.totalProjectEscrow(),
            tribeAccount.escrowedProjectBalances(uuid)));
        tribeAccount.setEscrowedProjectBalances(uuid, 0);
    }

    // Staking code below (in tribe tokens)
    //  make it steak as much additional funds required to become a member (i.e. if the staking minimum goes up).  Do not use amount variable  
    function stakeTribeTokens(uint amount) public {
        if(!tribeTokenInstance.transferFrom(msg.sender, address(tribeAccount), amount)) {
            revert();
        }

        tribeAccount.setStakedBalances(SafeMath.add(tribeAccount.stakedBalances(msg.sender), amount), msg.sender);
        tribeAccount.setTotalStaked(SafeMath.add(tribeAccount.totalStaked(), amount));
        tribeAccount.setTimeStaked(now, msg.sender);
    }

    // checks that a user is able to unstake by looking at the lokcup period and the balance
    // unstakes a tribe and sends funds back to the user
    function unstakeTribeTokens(uint amount) public {

        if(tribeAccount.stakedBalances(msg.sender) < amount) {
            revert();
        }
        if(now - tribeAccount.timeStaked(msg.sender) < lockupPeriodSeconds) {
            revert();
        }

        tribeAccount.setStakedBalances(SafeMath.sub(tribeAccount.stakedBalances(msg.sender), amount), msg.sender);
        tribeAccount.setTotalStaked(SafeMath.sub(tribeAccount.totalStaked(), amount));
        tribeTokenInstance.transfer(msg.sender, amount);
    }

    // checks that the user is fully staked
    function isMember(address memberAddress) public view returns (bool) {
        return ( tribeAccount.stakedBalances(memberAddress) >= minimumStakingRequirement );
    }
}