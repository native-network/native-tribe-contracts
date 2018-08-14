# Setup

## Environment

### Install and run ganache-cli

1. npm install -g ganache-cli

2. npm install -g truffle

3. Ganache-cli -l 8000000

## Deploy contracts

1. truffle migrate --reset

## Run tests

1. truffle test

-----

# Native contract structures

##Overview

There are 3 main functionalities of a native tribe:


-Allow users to stake tribe tokens to become a tribe member.
-Allow the escrow lockup & rewarding  of native tokens to pay for a project.
-Allow the escrow lockup & rewarding of native tokens to pay for a task.



Projects Vs. Tasks:

Creating projects and tasks both require funds to be locked up until the task or project has been deemed complete.  There are two key differences between projects and tasks:


- Project completion is decided by the “voteController” address and has the “rewardee” address set when creating the project.


- Task completion is decided by the project “curator” and has the “rewardee” address set by the “curator” upon rewarding the task.



## Contracts

### Core Tribe contracts

Each tribe consists of 4 contracts

1. Registrar.sol
	
	Registrar stores the address of the latest version of the launched Tribe.sol contract

2. Tribe.sol

	This is the main contract containing tribe logic.  It has the following functionality:

	- Staking & unstaking tribe tokens for users to join tribes.
	- Allows creating projects and tasks by the curator and voteController
	- Allows reward project and task completion with native tokens 
	- Uses tribeAccount contract to store and track all staking and escrow funds.

3. TribeAccount.sol

	Owned by the Tribe contract. Stores and tracks all staked tribe tokens and escrowed native tokens


4. SmartToken.sol (used as tribe token)

	Bancor compatible smart token with built in token sale functionality.  Used as the tribe contract.


### Non-tribe native contracts

1. SmartToken.sol (used as native token)

	Bancor compatible smart token with built in token sale functionality.  Used as the native token

2. Logger.sol

	Centralized logging contract to help backend watch for tribe events.  All tribes log all events to this contract.


3. Tribe Launcher

	Helper contract is used to easily launch and connect all of the pieces required for a new tribe.  These are:

- Tribe token (SmartToken.sol)
- Tribe Account (TribeAccount.sol)
- Tribe (Tribe.sol)
- Registrar (Registrar.sol)

### Other contracts

1. Factory Contracts

	These factory contracts are used to keep the gas usage below the block gas limit when deploying Tribe Launcher.

	- RegistrarFactory.sol
	- SmartTokenFactory.sol
	- TribeAccount	Factory.sol
	- TribeStorageFactory.sol


2. Abstract Contracts & Interfaces

	Abstract contracts used to enforce contract structure are kept in the interfaces folder.

3. Utility Contracta

	- Owned.sol  Modified version of the bancor owned utility
	- SafeMath.sol Open Zeppelin safemath library

4. Test

	Contracts used in integration-test-upgrades.js to demonstrate upgrading an existing tribe to  new contract logic.

## Contract Upgrade Flow

The following example shows the overall flow of upgrading a tribe contract.  This same upgrade process can be seen inside of the integration-test-upgrades.js test.

1. Curator launches a new tribe using a new version of TribeLauncher.sol. 

	**Note** The example from integration-test-upgrades.js utilizes the launchTribe() function to launch all 4 tribe contracts (tribe, account, registrar, token).  Only the newly upgraded tribe contract is used in this test and the remaining new contracts are ignored.

2. Curator Updates the old tribe Registrar.sol contract to point to the newly created tribe contract.

3. Curator Updates the new tribe to use the old tribe token.

4. Curator updates the owner of the old tribe account to the new tribe.

5. Curator updates the new tribe to use the old tribe account

