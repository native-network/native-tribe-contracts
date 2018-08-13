pragma solidity ^0.4.8;

import "../interfaces/IOwned.sol";
import "./IERC20.sol";

/*
    Smart Token interface
*/
contract ISmartToken is IOwned, IERC20 {
    function disableTransfers(bool _disable) public;
    function issue(address _to, uint256 _amount) public;
    function destroy(address _from, uint256 _amount) public;
}