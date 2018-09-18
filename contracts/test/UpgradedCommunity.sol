pragma solidity ^0.4.24;

import "../Logger.sol";
import "../CommunityAccount.sol";
import "../interfaces/ISmartToken.sol";
import "../utility/SafeMath.sol";

/*

Used in integration-test-upgrades.js to demonstrate how we can update a community

*/
contract UpgradedCommunity {
    address public curator;
    address public voteController;
    uint public minimumStakingRequirement;
    uint public lockupPeriodSeconds;
    Logger public logger;
    ISmartToken public nativeTokenInstance;
    ISmartToken public communityTokenInstance;
    CommunityAccount public communityAccount;
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
        _;
    }

    constructor(uint _minimumStakingRequirement,
                uint _lockupPeriodSeconds,
                address _curator,
                address _communityTokenContractAddress,
                address _nativeTokenContractAddress,
                address _voteController,
                address _loggerContractAddress,
                address _communityAccountContractAddress,
                bool _emergencyWithdrawEnabled
                ) public {
                    communityAccount = CommunityAccount(_communityAccountContractAddress);
                    curator = _curator;
                    minimumStakingRequirement = _minimumStakingRequirement;
                    lockupPeriodSeconds = _lockupPeriodSeconds;
                    logger = Logger(_loggerContractAddress);
                    voteController = _voteController;
                    nativeTokenInstance = ISmartToken(_nativeTokenContractAddress);
                    communityTokenInstance = ISmartToken(_communityTokenContractAddress);
                    emergencyWithdrawEnabled = _emergencyWithdrawEnabled;
    }

    // New test function to demonstrate upgraded contract
    // For emergency use by curator in case of critical EVM or smart contract vulnerability.
    function emergencyFundRetrieval() public onlyCurator {
        require(emergencyWithdrawEnabled);

        uint totaBalanceNativeToken = nativeTokenInstance.balanceOf(address(communityAccount));
        uint totaBalanceCommunityToken = communityTokenInstance.balanceOf(address(communityAccount));

        communityAccount.transferTokensOut(address(nativeTokenInstance), curator, totaBalanceNativeToken);
        communityAccount.transferTokensOut(address(communityTokenInstance), curator, totaBalanceCommunityToken);
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

    function setTokenAddresses(address newNativeTokenAddress, address newCommunityTokenAddress) public onlyCurator {
        nativeTokenInstance = ISmartToken(newNativeTokenAddress);
        communityTokenInstance = ISmartToken(newCommunityTokenAddress);
    }

    function setCommunityAccount(address newCommunityAccountAddress) public onlyCurator {
        communityAccount = CommunityAccount(newCommunityAccountAddress);
    }

    function setCommunityAccountOwner(address newOwner) public onlyCurator {
        communityAccount.transferOwnershipNow(newOwner);
    }

    // gets the amount in the dev fund that isn't locked up by a project or task stake
    function getAvailableDevFund() public view returns (uint) {
        uint devFundBalance = nativeTokenInstance.balanceOf(address(communityAccount));
        return SafeMath.sub(devFundBalance, getLockedDevFundAmount());
    }

    function getLockedDevFundAmount() public view returns (uint) {
        return SafeMath.add(communityAccount.totalTaskEscrow(), communityAccount.totalProjectEscrow());
    }

    // Task escrow code below (in native tokens)
    
    // updates the escrow values for a new task
    function createNewTask(uint uuid, uint amount) public onlyCurator sufficientDevFundBalance (amount) {
        communityAccount.setEscrowedTaskBalances(uuid, amount);
        communityAccount.setTotalTaskEscrow(SafeMath.add(communityAccount.totalTaskEscrow(), amount));
        logger.emitTaskCreated(uuid, amount);
    }

    // subtracts the tasks escrow and sets the tasks escrow balance to 0
    function cancelTask(uint uuid) public onlyCurator {
        communityAccount.setTotalTaskEscrow(SafeMath.sub(communityAccount.totalTaskEscrow(), communityAccount.escrowedTaskBalances(uuid)));
        communityAccount.setEscrowedTaskBalances(uuid , 0);
    }
    
    // pays put to the task completer and updates the escrow balances
    function rewardTaskCompletion(uint uuid, address user) public onlyVoteController {
        communityAccount.transferTokensOut(address(nativeTokenInstance), user, communityAccount.escrowedTaskBalances(uuid));
        communityAccount.setTotalTaskEscrow(SafeMath.sub(communityAccount.totalTaskEscrow(), communityAccount.escrowedTaskBalances(uuid)));
        communityAccount.setEscrowedTaskBalances(uuid, 0);
    }

    // Project escrow code below (in native tokens)

    // updates the escrow values along with the project payee for a new project
    function createNewProject(uint uuid, uint amount, address projectPayee) public onlyCurator sufficientDevFundBalance (amount) {
        communityAccount.setEscrowedProjectBalances(uuid, amount);
        communityAccount.setEscrowedProjectPayees(uuid, projectPayee);
        communityAccount.setTotalProjectEscrow(SafeMath.add(communityAccount.totalProjectEscrow(), amount));
        logger.emitProjectCreated(uuid, amount, projectPayee);
    }

    // subtracts the tasks escrow and sets the tasks escrow balance to 0
    function cancelProject(uint uuid) public onlyCurator {
        communityAccount.setTotalProjectEscrow(SafeMath.sub(
            communityAccount.totalProjectEscrow(),
            communityAccount.escrowedProjectBalances(uuid)));
        communityAccount.setEscrowedProjectBalances(uuid, 0);
    }
    
    // pays out the project completion and then updates the escrow balances
    function rewardProjectCompletion(uint uuid) public onlyVoteController {
        communityAccount.transferTokensOut(
            address(nativeTokenInstance),
            communityAccount.escrowedProjectPayees(uuid),
            communityAccount.escrowedProjectBalances(uuid));
        communityAccount.setTotalProjectEscrow(SafeMath.sub(
            communityAccount.totalProjectEscrow(),
            communityAccount.escrowedProjectBalances(uuid)));
        communityAccount.setEscrowedProjectBalances(uuid, 0);
    }

    // Staking code below (in community tokens)
    //  make it steak as much additional funds required to become a member (i.e. if the staking minimum goes up).  Do not use amount variable  
    function stakeCommunityTokens(uint amount) public {
        require(communityTokenInstance.transferFrom(msg.sender, address(communityAccount), amount));

        communityAccount.setStakedBalances(SafeMath.add(communityAccount.stakedBalances(msg.sender), amount), msg.sender);
        communityAccount.setTotalStaked(SafeMath.add(communityAccount.totalStaked(), amount));
        communityAccount.setTimeStaked(now, msg.sender);
    }

    // checks that a user is able to unstake by looking at the lokcup period and the balance
    // unstakes a community and sends funds back to the user
    function unstakeCommunityTokens(uint amount) public {

        require(communityAccount.stakedBalances(msg.sender) >= amount);
        require(now - communityAccount.timeStaked(msg.sender) >= lockupPeriodSeconds);

        communityAccount.setStakedBalances(SafeMath.sub(communityAccount.stakedBalances(msg.sender), amount), msg.sender);
        communityAccount.setTotalStaked(SafeMath.sub(communityAccount.totalStaked(), amount));
        require(communityAccount.transferTokensOut(address(communityTokenInstance), msg.sender, amount));
    }

    // checks that the user is fully staked
    function isMember(address memberAddress) public view returns (bool) {
        return ( communityAccount.stakedBalances(memberAddress) >= minimumStakingRequirement );
    }
}