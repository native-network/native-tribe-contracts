pragma solidity ^0.4.11;

import '../SmartToken.sol';

contract SmartTokenFactory {
    
    function create(string tokenName, uint tokenTotalSupply, uint8 tokenDecimals, string tokenSymbol, string tokenVersion, address msgSender) public returns(address) {
        SmartToken smartToken = new SmartToken(tokenName, tokenTotalSupply, tokenDecimals, tokenSymbol, tokenVersion, msgSender);
        smartToken.transferOwnershipNow(msg.sender);
        return address(smartToken);
    }
}
