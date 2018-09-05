pragma solidity ^0.4.24;
import "./Logger.sol";
import "./CommunityAccount.sol";
import "./interfaces/ISmartToken.sol";
import "./interfaces/ICommunity.sol";
import "./utility/SafeMath.sol";

/**
@notice Main community logic contract.
@notice functionality:
@notice 1) Stake / Unstake community tokens.  This is how user joins or leaves community.
@notice 2) Create Projects and Tasks by escrowing NTV token until curator or voteController determines task complete
@notice 3) Log all events to singleton Logger contract
@notice 4) Own communityAccount contract which holds all staking- and escrow-related funds and variables
@notice --- This abstraction of funds allows for easy upgrade process; launch new community -> transfer ownership of the existing communityAccount
@notice --- View test/integration-test-upgrades.js to demonstrate this process
 */
contract Community is ICommunity {

    address public curator;
    address public voteController;
    uint public minimumStakingRequirement;
    uint public lockupPeriodSeconds;
    ISmartToken public nativeTokenInstance;
    ISmartToken public communityTokenInstance;
    Logger public logger;
    CommunityAccount public communityAccount;

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

    /**
    @param _minimumStakingRequirement Minimum stake amount to join community
    @param _lockupPeriodSeconds Required minimum holding time, in seconds, after joining for staker to leave
    @param _curator Address of community curator
    @param _communityTokenContractAddress Address of community token contract
    @param _nativeTokenContractAddress Address of ontract
    @param _voteController Address of vote controller
    @param _loggerContractAddress
    @param _communityAccountContractAddress
     */
    constructor(uint _minimumStakingRequirement,
        uint _lockupPeriodSeconds,
        address _curator,
        address _communityTokenContractAddress,
        address _nativeTokenContractAddress,
        address _voteController,
        address _loggerContractAddress,
        address _communityAccountContractAddress) public {
        communityAccount = CommunityAccount(_communityAccountContractAddress);
        curator = _curator;
        minimumStakingRequirement = _minimumStakingRequirement;
        lockupPeriodSeconds = _lockupPeriodSeconds;
        logger = Logger(_loggerContractAddress);
        voteController = _voteController;
        nativeTokenInstance = ISmartToken(_nativeTokenContractAddress);
        communityTokenInstance = ISmartToken(_communityTokenContractAddress);
    }

    // TODO add events to each of these
    /**
    @notice Sets curator to input curator address
    @param _curator Address of new community curator
     */
    function transferCurator(address _curator) public onlyCurator {
        curator = _curator;
        logger.emitGenericLog("transferCurator", "");
    }

    /**
    @notice Sets vote controller to input vote controller address
    @param _voteController Address of new vote controller
     */
    function transferVoteController(address _voteController) public onlyCurator {
        voteController = _voteController;
        logger.emitGenericLog("transferVoteController", "");
    }

    /**
    @notice Sets the minimum community staking requirement
    @param _minimumStakingRequirement Minimum community staking requirement to be set
     */
    function setMinimumStakingRequirement(uint _minimumStakingRequirement) public onlyCurator {
        minimumStakingRequirement = _minimumStakingRequirement;
        logger.emitGenericLog("setMinimumStakingRequirement", "");
    }

    /**
    @notice Sets lockup period for community staking
    @param _lockupPeriodSeconds Community staking lockup period, in seconds
    */
    function setLockupPeriodSeconds(uint _lockupPeriodSeconds) public onlyCurator {
        lockupPeriodSeconds = _lockupPeriodSeconds;
        logger.emitGenericLog("setLockupPeriodSeconds", "");
    }

    /**
    @notice Updates Logger contract address to be used
    @param newLoggerAddress Address of new Logger contract
     */
    function setLogger(address newLoggerAddress) public onlyCurator {
        logger = Logger(newLoggerAddress);
        logger.emitGenericLog("setLogger", "");
    }

    /**
    @param newNativeTokenAddress New Native token address
    @param newCommunityTokenAddress New community token address
     */
    function setTokenAddresses(address newNativeTokenAddress, address newCommunityTokenAddress) public onlyCurator {
        nativeTokenInstance = ISmartToken(newNativeTokenAddress);
        communityTokenInstance = ISmartToken(newCommunityTokenAddress);
        logger.emitGenericLog("setTokenAddresses", "");
    }

    /**
    @param newCommunityAccountAddress Address of new community account
     */
    function setCommunityAccount(address newCommunityAccountAddress) public onlyCurator {
        communityAccount = CommunityAccount(newCommunityAccountAddress);
        logger.emitGenericLog("setCommunityAccount", "");
    }

    /**
    @param newOwner New community account owner address
     */
    function setCommunityAccountOwner(address newOwner) public onlyCurator {
        communityAccount.transferOwnershipNow(newOwner);
        logger.emitGenericLog("setCommunityAccountOwner", "");
    }

    /// @return Amount in the dev fund not locked up by project or task stake
    function getAvailableDevFund() public view returns (uint) {
        uint devFundBalance = nativeTokenInstance.balanceOf(address(communityAccount));
        return SafeMath.sub(devFundBalance, getLockedDevFundAmount());
    }

    /// @return Amount locked up in escrow
    function getLockedDevFundAmount() public view returns (uint) {
        return SafeMath.add(communityAccount.totalTaskEscrow(), communityAccount.totalProjectEscrow());
    }

    /* Task escrow code below (in community tokens) */

    /// @notice Updates the escrow values for a new task
    function createNewTask(uint uuid, uint amount) public onlyCurator sufficientDevFundBalance (amount) {
        communityAccount.setEscrowedTaskBalances(uuid, amount);
        communityAccount.setTotalTaskEscrow(SafeMath.add(communityAccount.totalTaskEscrow(), amount));
        logger.emitTaskCreated(uuid, amount);
        logger.emitGenericLog("createNewTask", "");
    }

    /// @notice Subtracts the tasks escrow and sets tasks escrow balance to 0
    function cancelTask(uint uuid) public onlyCurator {
        communityAccount.setTotalTaskEscrow(SafeMath.sub(communityAccount.totalTaskEscrow(), communityAccount.escrowedTaskBalances(uuid)));
        communityAccount.setEscrowedTaskBalances(uuid, 0);
        logger.emitGenericLog("cancelTask", "");
    }

    /// @notice Pays task completer and updates escrow balances
    function rewardTaskCompletion(uint uuid, address user) public onlyVoteController {
        communityAccount.transferTokensOut(address(nativeTokenInstance), user, communityAccount.escrowedTaskBalances(uuid));
        communityAccount.setTotalTaskEscrow(SafeMath.sub(communityAccount.totalTaskEscrow(), communityAccount.escrowedTaskBalances(uuid)));
        communityAccount.setEscrowedTaskBalances(uuid, 0);
        logger.emitGenericLog("rewardTaskCompletion", "");
    }

    /* Project escrow code below (in community tokens) */

    /// @notice updates the escrow values along with the project payee for a new project
    function createNewProject(uint uuid, uint amount, address projectPayee) public onlyCurator sufficientDevFundBalance (amount) {
        communityAccount.setEscrowedProjectBalances(uuid, amount);
        communityAccount.setEscrowedProjectPayees(uuid, projectPayee);
        communityAccount.setTotalProjectEscrow(SafeMath.add(communityAccount.totalProjectEscrow(), amount));
        logger.emitProjectCreated(uuid, amount, projectPayee);
        logger.emitGenericLog("createNewProject", "");
    }

    /// @notice Subtracts tasks escrow and sets tasks escrow balance to 0
    function cancelProject(uint uuid) public onlyCurator {
        communityAccount.setTotalProjectEscrow(SafeMath.sub(communityAccount.totalProjectEscrow(), communityAccount.escrowedProjectBalances(uuid)));
        communityAccount.setEscrowedProjectBalances(uuid, 0);
        logger.emitGenericLog("cancelProject", "");
    }

    /// @notice Pays out upon project completion
    /// @notice Updates escrow balances
    function rewardProjectCompletion(uint uuid) public onlyVoteController {
        communityAccount.transferTokensOut(
            address(nativeTokenInstance),
            communityAccount.escrowedProjectPayees(uuid),
            communityAccount.escrowedProjectBalances(uuid));
        communityAccount.setTotalProjectEscrow(SafeMath.sub(communityAccount.totalProjectEscrow(), communityAccount.escrowedProjectBalances(uuid)));
        communityAccount.setEscrowedProjectBalances(uuid, 0);
        logger.emitGenericLog("rewardProjectCompletion", "");
    }

    /// @notice Stake code (in community tokens)
    function stakeCommunityTokens() public {
        uint amount = minimumStakingRequirement - communityAccount.stakedBalances(msg.sender);
        require(amount > 0);
        require(communityTokenInstance.transferFrom(msg.sender, address(communityAccount), amount));

        communityAccount.setStakedBalances(SafeMath.add(communityAccount.stakedBalances(msg.sender), amount), msg.sender);
        communityAccount.setTotalStaked(SafeMath.add(communityAccount.totalStaked(), amount));
        communityAccount.setTimeStaked(now, msg.sender);
        logger.emitGenericLog("stakeCommunityTokens", "");
    }

    /// @notice Unstakes user from community and sends funds back to user
    /// @notice Checks lockup period and balance before unstaking
    function unstakeCommunityTokens() public {
        uint amount = communityAccount.stakedBalances(msg.sender);

        require(now - communityAccount.timeStaked(msg.sender) >= lockupPeriodSeconds);

        communityAccount.setStakedBalances(0, msg.sender);
        communityAccount.setTotalStaked(SafeMath.sub(communityAccount.totalStaked(), amount));
        communityTokenInstance.transfer(msg.sender, amount);
        logger.emitGenericLog("unstakeCommunityTokens", "");
    }

    /// @notice Checks that the user is fully staked
    function isMember(address memberAddress) public view returns (bool) {
        return (communityAccount.stakedBalances(memberAddress) >= minimumStakingRequirement);
    }
}