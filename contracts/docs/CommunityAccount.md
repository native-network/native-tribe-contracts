* [CommunityAccount](#communityaccount)
  * [totalTaskEscrow](#function-totaltaskescrow)
  * [stakedBalances](#function-stakedbalances)
  * [transferTokensOut](#function-transfertokensout)
  * [setTotalProjectEscrow](#function-settotalprojectescrow)
  * [escrowedProjectPayees](#function-escrowedprojectpayees)
  * [setEscrowedTaskBalances](#function-setescrowedtaskbalances)
  * [timeStaked](#function-timestaked)
  * [acceptOwnership](#function-acceptownership)
  * [setEscrowedProjectPayees](#function-setescrowedprojectpayees)
  * [totalStaked](#function-totalstaked)
  * [transferOwnershipNow](#function-transferownershipnow)
  * [setStakedBalances](#function-setstakedbalances)
  * [owner](#function-owner)
  * [totalProjectEscrow](#function-totalprojectescrow)
  * [setEscrowedProjectBalances](#function-setescrowedprojectbalances)
  * [setTotalTaskEscrow](#function-settotaltaskescrow)
  * [newOwner](#function-newowner)
  * [escrowedProjectBalances](#function-escrowedprojectbalances)
  * [setTotalStaked](#function-settotalstaked)
  * [escrowedTaskBalances](#function-escrowedtaskbalances)
  * [transferOwnership](#function-transferownership)
  * [setTimeStaked](#function-settimestaked)
  * [OwnerUpdate](#event-ownerupdate)
* [ICommunityAccount](#icommunityaccount)
  * [setTotalProjectEscrow](#function-settotalprojectescrow)
  * [setEscrowedTaskBalances](#function-setescrowedtaskbalances)
  * [acceptOwnership](#function-acceptownership)
  * [setEscrowedProjectPayees](#function-setescrowedprojectpayees)
  * [transferOwnershipNow](#function-transferownershipnow)
  * [setStakedBalances](#function-setstakedbalances)
  * [setEscrowedProjectBalances](#function-setescrowedprojectbalances)
  * [setTotalTaskEscrow](#function-settotaltaskescrow)
  * [setTotalStaked](#function-settotalstaked)
  * [transferOwnership](#function-transferownership)
  * [setTimeStaked](#function-settimestaked)
* [IERC20](#ierc20)
  * [approve](#function-approve)
  * [transferFrom](#function-transferfrom)
  * [balanceOf](#function-balanceof)
  * [transfer](#function-transfer)
  * [allowance](#function-allowance)
  * [Transfer](#event-transfer)
  * [Approval](#event-approval)
* [IOwned](#iowned)
  * [acceptOwnership](#function-acceptownership)
  * [transferOwnershipNow](#function-transferownershipnow)
  * [transferOwnership](#function-transferownership)
* [Owned](#owned)
  * [acceptOwnership](#function-acceptownership)
  * [transferOwnershipNow](#function-transferownershipnow)
  * [owner](#function-owner)
  * [newOwner](#function-newowner)
  * [transferOwnership](#function-transferownership)
  * [OwnerUpdate](#event-ownerupdate)

# CommunityAccount


## *function* totalTaskEscrow

CommunityAccount.totalTaskEscrow() `view` `0a6d96a5`





## *function* stakedBalances

CommunityAccount.stakedBalances() `view` `1460fa87`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* |  | undefined |


## *function* transferTokensOut

CommunityAccount.transferTokensOut(tokenContractAddress, destination, amount) `nonpayable` `193c114b`

**This function allows the community to transfer tokens out of the contract.**


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | tokenContractAddress | Address of community contract |
| *address* | destination | Destination address of user looking to remove tokens from contract |
| *uint256* | amount | Amount to transfer out of community |


## *function* setTotalProjectEscrow

CommunityAccount.setTotalProjectEscrow(balance) `nonpayable` `3b41b5f2`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | balance | Balance which to set total project to |


## *function* escrowedProjectPayees

CommunityAccount.escrowedProjectPayees() `view` `418ac0d6`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* |  | undefined |


## *function* setEscrowedTaskBalances

CommunityAccount.setEscrowedTaskBalances(uuid, balance) `nonpayable` `7174ac9e`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | uuid | id of escrowed task |
| *uint256* | balance | Balance to be set of escrowed task |


## *function* timeStaked

CommunityAccount.timeStaked() `view` `778f8cb0`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* |  | undefined |


## *function* acceptOwnership

CommunityAccount.acceptOwnership() `nonpayable` `79ba5097`

> used by a new owner to accept an ownership transfer




## *function* setEscrowedProjectPayees

CommunityAccount.setEscrowedProjectPayees(uuid, payeeAddress) `nonpayable` `7e549814`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | uuid | id of escrowed project |
| *address* | payeeAddress | Address funds will go to once project completed |


## *function* totalStaked

CommunityAccount.totalStaked() `view` `817b1cd2`





## *function* transferOwnershipNow

CommunityAccount.transferOwnershipNow(newContractOwner) `nonpayable` `8692ac86`

> transfers the contract ownership without needing the new owner to accept ownership

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | newContractOwner | new contract owner |


## *function* setStakedBalances

CommunityAccount.setStakedBalances(_amount, msgSender) `nonpayable` `8826fa2e`

**This is the community staking method**


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | _amount | Amount to be staked |
| *address* | msgSender | Address of the staker |


## *function* owner

CommunityAccount.owner() `view` `8da5cb5b`





## *function* totalProjectEscrow

CommunityAccount.totalProjectEscrow() `view` `9f205f68`





## *function* setEscrowedProjectBalances

CommunityAccount.setEscrowedProjectBalances(uuid, balance) `nonpayable` `cb0d3133`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | uuid | id of escrowed project |
| *uint256* | balance | Balance to be set of escrowed project |


## *function* setTotalTaskEscrow

CommunityAccount.setTotalTaskEscrow(balance) `nonpayable` `d3ff09a5`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | balance | Balance which to set total task escrow to |


## *function* newOwner

CommunityAccount.newOwner() `view` `d4ee1d90`





## *function* escrowedProjectBalances

CommunityAccount.escrowedProjectBalances() `view` `db661100`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* |  | undefined |


## *function* setTotalStaked

CommunityAccount.setTotalStaked(_totalStaked) `nonpayable` `e17e7a20`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | _totalStaked | Set total amount staked in community |


## *function* escrowedTaskBalances

CommunityAccount.escrowedTaskBalances() `view` `e9307358`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* |  | undefined |


## *function* transferOwnership

CommunityAccount.transferOwnership(_newOwner) `nonpayable` `f2fde38b`

> allows transferring the contract ownership the new owner still needs to accept the transfer can only be called by the contract owner

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | _newOwner | new contract owner |


## *function* setTimeStaked

CommunityAccount.setTimeStaked(_timeStaked, msgSender) `nonpayable` `fd9e5fbf`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | _timeStaked | Time of user staking into community |
| *address* | msgSender | Staker address |

## *event* OwnerUpdate

CommunityAccount.OwnerUpdate(_prevOwner, _newOwner) `34376542`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | _prevOwner | indexed |
| *address* | _newOwner | indexed |


---
# ICommunityAccount


## *function* setTotalProjectEscrow

ICommunityAccount.setTotalProjectEscrow(balance) `nonpayable` `3b41b5f2`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | balance | undefined |


## *function* setEscrowedTaskBalances

ICommunityAccount.setEscrowedTaskBalances(uuid, balance) `nonpayable` `7174ac9e`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | uuid | undefined |
| *uint256* | balance | undefined |


## *function* acceptOwnership

ICommunityAccount.acceptOwnership() `nonpayable` `79ba5097`





## *function* setEscrowedProjectPayees

ICommunityAccount.setEscrowedProjectPayees(uuid, payeeAddress) `nonpayable` `7e549814`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | uuid | undefined |
| *address* | payeeAddress | undefined |


## *function* transferOwnershipNow

ICommunityAccount.transferOwnershipNow(newContractOwner) `nonpayable` `8692ac86`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | newContractOwner | undefined |


## *function* setStakedBalances

ICommunityAccount.setStakedBalances(_amount, msgSender) `nonpayable` `8826fa2e`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | _amount | undefined |
| *address* | msgSender | undefined |


## *function* setEscrowedProjectBalances

ICommunityAccount.setEscrowedProjectBalances(uuid, balance) `nonpayable` `cb0d3133`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | uuid | undefined |
| *uint256* | balance | undefined |


## *function* setTotalTaskEscrow

ICommunityAccount.setTotalTaskEscrow(balance) `nonpayable` `d3ff09a5`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | balance | undefined |


## *function* setTotalStaked

ICommunityAccount.setTotalStaked(_totalStaked) `nonpayable` `e17e7a20`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | _totalStaked | undefined |


## *function* transferOwnership

ICommunityAccount.transferOwnership(_newOwner) `nonpayable` `f2fde38b`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | _newOwner | undefined |


## *function* setTimeStaked

ICommunityAccount.setTimeStaked(_timeStaked, msgSender) `nonpayable` `fd9e5fbf`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | _timeStaked | undefined |
| *address* | msgSender | undefined |


---
# IERC20


## *function* approve

IERC20.approve(spender, tokens) `nonpayable` `095ea7b3`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | spender | undefined |
| *uint256* | tokens | undefined |


## *function* transferFrom

IERC20.transferFrom(from, to, tokens) `nonpayable` `23b872dd`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | from | undefined |
| *address* | to | undefined |
| *uint256* | tokens | undefined |


## *function* balanceOf

IERC20.balanceOf(tokenOwner) `view` `70a08231`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | tokenOwner | undefined |


## *function* transfer

IERC20.transfer(to, tokens) `nonpayable` `a9059cbb`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | to | undefined |
| *uint256* | tokens | undefined |


## *function* allowance

IERC20.allowance(tokenOwner, spender) `view` `dd62ed3e`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | tokenOwner | undefined |
| *address* | spender | undefined |

## *event* Transfer

IERC20.Transfer(from, to, tokens) `ddf252ad`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | from | indexed |
| *address* | to | indexed |
| *uint256* | tokens | not indexed |

## *event* Approval

IERC20.Approval(tokenOwner, spender, tokens) `8c5be1e5`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | tokenOwner | indexed |
| *address* | spender | indexed |
| *uint256* | tokens | not indexed |


---
# IOwned


## *function* acceptOwnership

IOwned.acceptOwnership() `nonpayable` `79ba5097`





## *function* transferOwnershipNow

IOwned.transferOwnershipNow(newContractOwner) `nonpayable` `8692ac86`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | newContractOwner | undefined |


## *function* transferOwnership

IOwned.transferOwnership(_newOwner) `nonpayable` `f2fde38b`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | _newOwner | undefined |


---
# Owned


## *function* acceptOwnership

Owned.acceptOwnership() `nonpayable` `79ba5097`

> used by a new owner to accept an ownership transfer




## *function* transferOwnershipNow

Owned.transferOwnershipNow(newContractOwner) `nonpayable` `8692ac86`

> transfers the contract ownership without needing the new owner to accept ownership

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | newContractOwner | new contract owner |


## *function* owner

Owned.owner() `view` `8da5cb5b`





## *function* newOwner

Owned.newOwner() `view` `d4ee1d90`





## *function* transferOwnership

Owned.transferOwnership(_newOwner) `nonpayable` `f2fde38b`

> allows transferring the contract ownership the new owner still needs to accept the transfer can only be called by the contract owner

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | _newOwner | new contract owner |


## *event* OwnerUpdate

Owned.OwnerUpdate(_prevOwner, _newOwner) `34376542`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | _prevOwner | indexed |
| *address* | _newOwner | indexed |


---