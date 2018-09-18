pragma solidity ^0.4.24;

import "./utility/Owned.sol";
import "./utility/SafeMath.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/ISmartToken.sol";

/*

This contract implements the required functionality to be considered a Bancor smart token.
Additionally it has custom token sale functionality and the ability to withdraw tokens accidentally deposited

// TODO abstract this into 3 contracts and inherit from them: 1) ERC20, 2) Smart Token, 3) Native specific functionality
*/
contract SmartToken is Owned, IERC20, ISmartToken {

    /**
        Smart Token Implementation
    */

    bool public transfersEnabled = true;    // true if transfer/transferFrom are enabled, false if not
    /// @notice Triggered when a smart token is deployed - the _token address is defined for forward compatibility, in case we want to trigger the event from a factory
    event NewSmartToken(address _token);
    /// @notice Triggered when the total supply is increased
    event Issuance(uint256 _amount);
    // @notice Triggered when the total supply is decreased
    event Destruction(uint256 _amount);

    // @notice Verifies that the address is different than this contract address
    modifier notThis(address _address) {
        require(_address != address(this));
        _;
    }

    modifier transfersAllowed {
        assert(transfersEnabled);
        _;
    }

    /// @notice Validates an address - currently only checks that it isn't null
    modifier validAddress(address _address) {
        require(_address != address(0));
        _;
    }

    /**
        @dev disables/enables transfers
        can only be called by the contract owner
        @param _disable    true to disable transfers, false to enable them
    */
    function disableTransfers(bool _disable) public ownerOnly {
        transfersEnabled = !_disable;
    }

    /**
        @dev increases the token supply and sends the new tokens to an account
        can only be called by the contract owner
        @param _to         account to receive the new amount
        @param _amount     amount to increase the supply by
    */
    function issue(address _to, uint256 _amount)
    public
    ownerOnly
    validAddress(_to)
    notThis(_to)
    {
        totalSupply = SafeMath.add(totalSupply, _amount);
        balances[_to] = SafeMath.add(balances[_to], _amount);
        emit Issuance(_amount);
        emit Transfer(this, _to, _amount);
    }

    /**
        @dev removes tokens from an account and decreases the token supply
        can be called by the contract owner to destroy tokens from any account or by any holder to destroy tokens from his/her own account
        @param _from       account to remove the amount from
        @param _amount     amount to decrease the supply by
    */
    function destroy(address _from, uint256 _amount) public {
        require(msg.sender == _from || msg.sender == owner); // validate input
        balances[_from] = SafeMath.sub(balances[_from], _amount);
        totalSupply = SafeMath.sub(totalSupply, _amount);

        emit Transfer(_from, this, _amount);
        emit Destruction(_amount);
    }

    /**
        @notice ERC20 Implementation
    */
    uint256 public totalSupply;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);


    function transfer(address _to, uint256 _value) public transfersAllowed returns (bool success) {
        if (balances[msg.sender] >= _value && _to != address(0)) {
            balances[msg.sender] = SafeMath.sub(balances[msg.sender], _value);
            balances[_to] = SafeMath.add(balances[_to], _value);
            emit Transfer(msg.sender, _to, _value);
            return true;
        } else {return false; }
    }

    function transferFrom(address _from, address _to, uint256 _value) public transfersAllowed returns (bool success) {
        if (balances[_from] >= _value && allowed[_from][msg.sender] >= _value && _to != address(0)) {

            balances[_to] = SafeMath.add(balances[_to], _value);
            balances[_from] = SafeMath.sub(balances[_from], _value);
            allowed[_from][msg.sender] = SafeMath.sub(allowed[_from][msg.sender], _value);
            emit Transfer(_from, _to, _value);
            return true;
        } else { return false; }
    }

    function balanceOf(address _owner) public constant returns (uint256 balance) {
        return balances[_owner];
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) public constant returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }

    mapping (address => uint256) balances;
    mapping (address => mapping (address => uint256)) allowed;

    string public name;
    uint8 public decimals;
    string public symbol;
    string public version;

    constructor(string _name, uint _totalSupply, uint8 _decimals, string _symbol, string _version, address sender) public {
        balances[sender] = _totalSupply;               // Give the creator all initial tokens
        totalSupply = _totalSupply;                        // Update total supply
        name = _name;                                   // Set the name for display purposes
        decimals = _decimals;                            // Amount of decimals for display purposes
        symbol = _symbol;                               // Set the symbol for display purposes
        version = _version;

        emit NewSmartToken(address(this));
    }

    /**
        @notice Token Sale Implementation
    */
    uint public saleStartTime;
    uint public saleEndTime;
    uint public price;
    uint public amountRemainingForSale;
    bool public buyModeEth = true;
    address public beneficiary;
    address public payableTokenAddress;

    event TokenSaleInitialized(uint _saleStartTime, uint _saleEndTime, uint _price, uint _amountForSale, uint nowTime);
    event TokensPurchased(address buyer, uint amount);

    /**
        @dev increases the token supply and sends the new tokens to an account.  Similar to issue() but for use in token sale
        @param _to         account to receive the new amount
        @param _amount     amount to increase the supply by
    */
    function issuePurchase(address _to, uint256 _amount)
    internal
    validAddress(_to)
    notThis(_to)
    {
        totalSupply = SafeMath.add(totalSupply, _amount);
        balances[_to] = SafeMath.add(balances[_to], _amount);
        emit Issuance(_amount);
        emit Transfer(this, _to, _amount);
    }

    /**
        @notice Begins the token sale for this token instance
        @param _saleStartTime Unix timestamp of the token sale start
        @param _saleEndTime Unix timestamp of the token sale close
        @param _price If sale initialized in ETH: price in Wei.
                If not, token purchases are enabled and this is the amount of tokens issued per tokens paid
        @param _amountForSale Amount of tokens for sale
        @param _beneficiary Recipient of the token sale proceeds
    */
    function initializeTokenSale(uint _saleStartTime, uint _saleEndTime, uint _price, uint _amountForSale, address _beneficiary) public ownerOnly {
        // Check that the token sale has not yet been initialized
        initializeSale(_saleStartTime, _saleEndTime, _price, _amountForSale, _beneficiary);
    }
    /**
        @notice Begins the token sale for this token instance
        @notice Uses the same signature as initializeTokenSale() with:
        @param _tokenAddress The whitelisted token address to allow payments in
    */
    function initializeTokenSaleWithToken(uint _saleStartTime, uint _saleEndTime, uint _price, uint _amountForSale, address _beneficiary, address _tokenAddress) public ownerOnly {
        buyModeEth = false;
        payableTokenAddress = _tokenAddress;
        initializeSale(_saleStartTime, _saleEndTime, _price, _amountForSale, _beneficiary);
    }

    function initializeSale(uint _saleStartTime, uint _saleEndTime, uint _price, uint _amountForSale, address _beneficiary) internal {
        // Check that the token sale has not yet been initialized
        require(saleStartTime == 0);
        saleStartTime = _saleStartTime;
        saleEndTime = _saleEndTime;
        price = _price;
        amountRemainingForSale = _amountForSale;
        beneficiary = _beneficiary;
        emit TokenSaleInitialized(saleStartTime, saleEndTime, price, amountRemainingForSale, now);
    }

    function updateStartTime(uint _newSaleStartTime) public ownerOnly {
        saleStartTime = _newSaleStartTime;
    }

    function updateEndTime(uint _newSaleEndTime) public ownerOnly {
        require(_newSaleEndTime >= saleStartTime);
        saleEndTime = _newSaleEndTime;
    }

    function updateAmountRemainingForSale(uint _newAmountRemainingForSale) public ownerOnly {
        amountRemainingForSale = _newAmountRemainingForSale;
    }

    function updatePrice(uint _newPrice) public ownerOnly { 
        price = _newPrice;
    }

    /// @dev Allows owner to withdraw erc20 tokens that were accidentally sent to this contract
    function withdrawToken(IERC20 _token, uint amount) public ownerOnly {
        _token.transfer(msg.sender, amount);
    }

    /**
        @dev Allows token sale with parent token
    */
    function buyWithToken(IERC20 _token, uint amount) public payable {
        require(_token == payableTokenAddress);
        uint amountToBuy = SafeMath.mul(amount, price);
        require(amountToBuy <= amountRemainingForSale);
        require(now <= saleEndTime && now >= saleStartTime);
        amountRemainingForSale = SafeMath.sub(amountRemainingForSale, amountToBuy);
        require(_token.transferFrom(msg.sender, beneficiary, amount));
        issuePurchase(msg.sender, amountToBuy);
        emit TokensPurchased(msg.sender, amountToBuy);
    }

    function() public payable {
        require(buyModeEth == true);
        uint amountToBuy = SafeMath.div(msg.value, price);
        require(amountToBuy <= amountRemainingForSale);
        require(now <= saleEndTime && now >= saleStartTime);
        amountRemainingForSale = SafeMath.sub(amountRemainingForSale, amountToBuy);
        issuePurchase(msg.sender, amountToBuy);
        beneficiary.transfer(msg.value);
        emit TokensPurchased(msg.sender, amountToBuy);
    }
}