pragma solidity ^0.4.8;
import './utility/Owned.sol';

// TODO -- use safemath for everything
contract SmartToken is Owned {

    // Smart token specific stuff
    bool public transfersEnabled = true;    // true if transfer/transferFrom are enabled, false if not
    // triggered when a smart token is deployed - the _token address is defined for forward compatibility, in case we want to trigger the event from a factory
    event NewSmartToken(address _token);
    // triggered when the total supply is increased
    event Issuance(uint256 _amount);
    // triggered when the total supply is decreased
    event Destruction(uint256 _amount);


    // verifies that the address is different than this contract address
    modifier notThis(address _address) {
        require(_address != address(this));
        _;
    }

    // validates an address - currently only checks that it isn't null
    modifier validAddress(address _address) {
        require(_address != address(0));
        _;
    }

    /**
    @dev returns the sum of _x and _y, asserts if the calculation overflows
    @param _x   value 1
    @param _y   value 2
    @return sum
    */
    function safeAdd(uint256 _x, uint256 _y) internal pure returns (uint256) {
        uint256 z = _x + _y;
        assert(z >= _x);
        return z;
    }

    /**
    @dev returns the difference of _x minus _y, asserts if the subtraction results in a negative number
    @param _x   minuend
    @param _y   subtrahend
    @return difference
    */
    function safeSub(uint256 _x, uint256 _y) internal pure returns (uint256) {
        assert(_x >= _y);
        return _x - _y;
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
        totalSupply = safeAdd(totalSupply, _amount);
        balances[_to] = safeAdd(balances[_to], _amount);
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

        balances[_from] = safeSub(balances[_from], _amount);
        totalSupply = safeSub(totalSupply, _amount);

        emit Transfer(_from, this, _amount);
        emit Destruction(_amount);
    }
    
    
    
    // ERC20 specific stuff
    uint256 public totalSupply;
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
    
    

    function transfer(address _to, uint256 _value) public returns (bool success) {
        if (balances[msg.sender] >= _value && _value > 0) {
            balances[msg.sender] = safeSub(balances[msg.sender], _value);
            balances[_to] = safeAdd(balances[_to], _value);
            emit Transfer(msg.sender, _to, _value);
            return true;
        } else {return false; }
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        if (balances[_from] >= _value && allowed[_from][msg.sender] >= _value && _value > 0) {
            balances[_to] = safeAdd(balances[_to], _value);
            balances[_from] = safeSub(balances[_from], _value);
            allowed[_from][msg.sender] = safeSub(allowed[_from][msg.sender], _value);
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

    function () public {
        revert();
    }

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
}