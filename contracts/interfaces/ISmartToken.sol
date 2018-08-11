pragma solidity ^0.4.8;

import "../utility/Owned.sol";
import "./IERC20.sol";

contract ISmartToken is Owned {
    address public LoggerContractAddress;
    bool public transfersEnabled = true;
    event NewSmartToken(address _token);
    event TokenSaleInitialized(uint _saleStartTime, uint _saleEndTime, uint _priceInWei, uint _amountForSale, uint nowTime);
    event TokensPurchased(address buyer, uint amount);
    function disableTransfers(bool _disable) public;
    function issue(address _to, uint256 _amount) public;
    function destroy(address _from, uint256 _amount) public;
    uint256 public totalSupply;
    function transfer(address _to, uint256 _value) public returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success);
    function balanceOf(address _owner) public constant returns (uint256 balance);
    function approve(address _spender, uint256 _value) public returns (bool success);
    function allowance(address _owner, address _spender) public constant returns (uint256 remaining);
    mapping (address => uint256) balances;
    mapping (address => mapping (address => uint256)) allowed;
    string public name;
    uint8 public decimals;
    string public symbol;
    string public version;
    uint public saleStartTime;
    uint public saleEndTime;
    uint public priceInWei;
    uint public amountRemainingForSale;
    function initializeTokenSale(uint _saleStartTime, uint _saleEndTime, uint _priceInWei, uint _amountForSale) public;
    function updateStartTime(uint _newSaleStartTime) public;
    function updateEndTime(uint _newSaleEndTime) public;
    function updateAmountRemainingForSale(uint _newAmountRemainingForSale) public;
    function withdrawToken(IERC20 _token, uint amount) public;
    function() public payable;
}