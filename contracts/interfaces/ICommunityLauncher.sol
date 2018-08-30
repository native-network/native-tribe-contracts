pragma solidity ^0.4.24;

import "./IOwned.sol";
import "./ICommunity.sol";
import "./IRegistrar.sol";

/*
    Community Launcher Interface
*/
contract ICommunityLauncher is IOwned {
    function launchCommunity(uint[] ai, address[] addresses, string tokenName, string tokenSymbol, string tokenVersion) public;
    function launchRegistrar(address registrarFactoryContractAddress, ICommunity community, address curatorAddress) public returns(IRegistrar);
    function launchCommunityWithFactory(uint[] ai, address[] addresses, address _communityTokenAddress, address _communityAccountAddress) public returns(ICommunity);
}
