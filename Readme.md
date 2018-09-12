# Setup

## Environment

### Install and run ganache-cli

1. npm install -g ganache-cli

2. npm install -g truffle

3. npm install

3. Ganache-cli -l 8000000

## Deploy contracts

1. truffle migrate --reset

## Run tests

1. truffle test

#### A note about tests

The tests were built to run on ganache or testrpc.  In order to run the tests on a live network node the tests will need to be refactored due to the way transaction receipts are received instantly on ganache / testrpc vs a live network.  Ganache / testrpc also return revert error messages in a different format, some of the tests are expecting a specific error string and will fail on a live network.

-----

# Native contract structures

##Overview

There are 3 main functionalities of a native community:


- Allow users to stake community tokens to become a community member.
- Allow the escrow lockup & rewarding  of native tokens to pay for a project.
- Allow the escrow lockup & rewarding of native tokens to pay for a task.



Projects Vs. Tasks:

Creating projects and tasks are both created by the curator and require funds to be locked up until the task or project has been deemed complete.  There are two key differences between projects and tasks:


- Project completion is decided by the “voteController” address and has the “rewardee” address set when creating the project.


- Task completion is decided by the project “curator” and has the “rewardee” address set by the “curator” upon rewarding the task.



## Contracts

### Core Community contracts

Each community consists of 4 contracts

1. Registrar.sol
	
	Registrar stores the address of the latest version of the launched Community.sol contract

2. Community.sol

	This is the main contract containing community logic.  It has the following functionality:

	- Staking & unstaking community tokens for users to join communities.
	- Allows creating projects and tasks by the curator and voteController.
	- Allows reward project and task completion with native tokens.
	- Uses communityAccount contract to store and track all staking and escrow funds.

3. CommunityAccount.sol

	Owned by the Community contract. Stores and tracks all staked community tokens and escrowed native tokens,


4. SmartToken.sol (used as community token)

	Bancor compatible smart token with built in token sale functionality.  Used as the community token.


### Non-community native contracts

1. SmartToken.sol (used as native token)

	Bancor compatible smart token with built in token sale functionality.  Used as the native token.

2. Logger.sol

	Centralized logging contract to help backend watch for community events.  All communities log all events to this contract.


3. Community Launcher

	Helper contract is used to easily launch and connect all of the pieces required for a new community.  These are:

	- Community token (SmartToken.sol)
	- Community Account (CommunityAccount.sol)
	- Community (Community.sol)
	- Registrar (Registrar.sol)

### Other contracts

1. Factory Contracts

	These factory contracts are used to keep the gas usage below the block gas limit when deploying Community Launcher.

	- RegistrarFactory.sol
	- SmartTokenFactory.sol
	- CommunityAccount	Factory.sol
	- CommunityStorageFactory.sol


2. Abstract Contracts & Interfaces

	Abstract contracts and interfaces are kept in the interfaces folder.

3. Utility Contracta

	- Owned.sol  Modified version of the bancor owned utility
	- SafeMath.sol Open Zeppelin safemath library

4. Test

	Contracts used in integration-test-upgrades.js to demonstrate upgrading an existing community to  new contract logic.

## Contract Upgrade Flow

The following example shows the overall flow of upgrading a community contract.  This same upgrade process can be seen inside of the integration-test-upgrades.js test.

1. Curator launches a new community using a new version of CommunityLauncher.sol. 

	**Note** The example from integration-test-upgrades.js utilizes the launchCommunity() function to launch all 4 community contracts (community, account, registrar, token).  Only the newly upgraded community contract is used in this test and the remaining new contracts are ignored.
	

2. Curator Updates the old community Registrar.sol contract to point to the newly created community contract.

3. Curator Updates the new community to use the old community token.

4. Curator updates the owner of the old community account to the new community.

5. Curator updates the new community to use the old community account.

## Launching individual tribes

#### Overview

To launch a tribe modify the parameters at the top of migrations/11_community.js and
run `npm run launch_community`

To setup the token sales modify the parameters at the top of token-sale.js and
 run `npm run token-sale`

#### Launching a new community checklist

##### 1) Edit migrations/community.js
    
    - Verify that loggerAddress is correct
    - Verify that nativeTokenAddress is correct
    - Verifty that fromAccount is correct (this will be the curator address and vote controller address)
    - Set relevent community variables:
        - name
        - tokenSymbol
        - minimumStakingRequirement
        - lockupPeriodSeconds
        - tokenVersion
        - totalSupply (Note: this typically usually set to 0 because the supply will be generated during rhe token sale event)
        - tokenDecimals

##### 2) Launch the community

    - From the project root run `npm launch_community`
    - Make note of the resulting contract addresses (Registrar, Community, Community Account, Community Token)
    - Make note of .  This is the curator address and vote controller address.
    
##### 3) Edit token-sale.js

    - Verify that nativeTokenAddress is correct
    - Verify that fromAccount is correct
    - Set relevent token sale variables
        - saleType is either 'eth' for an ethereum based sale or 'token' for a token based sale
        - params.tokenAddress (Address of the token launched in step 2)
        - params.nativeTokenAddress
        - params.startTime (Unix timestamps in seconds of when the token sale begins)
        - params.endTime (Unix timestamps in seconds of when the token sale begins)
        - params.price (For eth sales this is in wei.  For token sales this is the number of native tokens required to purchase a single token)
        - params.amountForSale
        - params.beneficiary (The account to receive proceeds from the token sale)

    
##### 4) Initializer the token sale

    - Run `npm run token-sale` from the project root with the same account used to launch the communiuty.
