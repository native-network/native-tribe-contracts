pragma solidity ^0.4.24;

import "./IOwned.sol";
import "./ITribe.sol";
import "./IRegistrar.sol";

/*
    Tribe Launcher Interface
*/
contract ITribeLauncher is IOwned {
    function launchTribe(uint[] ai, address[] addresses, string tokenName, string tokenSymbol, string tokenVersion) public;
    function launchRegistrar(address registrarFactoryContractAddress, ITribe tribe, address curatorAddress) public returns(IRegistrar);
    function launchTribeWithFactory(uint[] ai, address[] addresses, address _tribeTokenAddress, address _tribeAccountAddress) public returns(ITribe);
}