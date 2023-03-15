# defi-lending-borrowing

This repo shows an example of a simple Defi smart contract for lending and borrowing ERC20 tokens using ETH, as well as lending and borrowing ETH using ERC20 token, developed using the hardhat framework
<br><br>

## Motivation ##
This is the first of a series of Defi smart contracts using solidity. This Defi series covers the basic codes in varioius areas of Defi projects such as :
- Staking tokens
- borrow & loan ETH, borrow & loan ERC20 tokens
- token swap
- flash loan
- etc

<br>

## Functional Description ##
There are 2 types of lending/borrowing here : one is related to borrowing ETH using ERC20 token as collateral, the other is realted to lending ERC20 token using ETH as collateral :
- borrowing ETH using ERC20 token as collateral: (loanRequest)
  - borrower creates a this simple loan request with the following info :
    - amount of ERC20 tokens in collateral
    - loan terms for ETH i.e. loan amount and duration
    - payoff amount in ERC20 token
  - state of loan
  - accept loan request (called by lender) by creating a loan smart contract (loan.sol)
    - pay off loan (called by borrower)
    - claim back ERC20 token in colleteral if borrower fails to pay off loan by due date

- a general loan when lender can lend out ERC20 token using ETH as collateral : (loanToken)
  - a lender needs to fund the loan first
  - borrower can take up a loan
  - borrower can pay back the loan (and get back ETH)
  - lender can liquidate the loan after due date
  - loan due date

### Owner only functions ###
- borrowing ETH using ERC20 token as collateral: (loanRequest)
  - here, borrower is the owner.
    - pay off loan
- creating a loan contract :
  - here, lender is the owner
    - claim back ERC20 token in colleteral if borrower fails to pay off loan by due date
  
### User functions ###
- borrowing ETH using ERC20 token as collateral: (loanRequest)
  - here, lender is the user.
    - accept loan request
- creating a loan contract :
  - borrower needs to pay back the loan before due date
- a general loan when lender can lend out ERC20 token using ETH as collateral :
  - a lender needs to fund the loan first
  - borrower can take up a loan
  - borrower can pay back the loan (and get back ETH)
  - lender can liquidate the loan after due date

### Contract (internal) functions ###
- n/a
<br>

## Technical Description ###

### Technical background ###
- As this smart contract project is built using the hardhat framework, please refer to this project/repo [basic smart contract using hardhat](https://github.com/dtan1/contractviahardhat) regarding building a basic smart contract using the hardhat framwork. 
- The README section contains a quick overview and usage of various hardhat commands etc. It serves as a good, quick refresher.

### Technical dependencis ###
Below is a brief summary of the technical libraries or tools that is used in this project :
- development fraemwork : hardhat
- coding libraries : openzeppelin - ERC20.sol, and Ownable.sol
- unit test libraries : chai assertion, ether.js 

### Technical consideration ###

#### States ####
- borrowing ETH using ERC20 token as collateral: (loanRequest)
  - struct is used to specify 
    - loan collateral 
    - loan term
  - enum :
    - loan state (either Waiting or accepted)

- creating a loan contract :
  - 
 
- a general loan when lender can lend out ERC20 token using ETH as collateral :
  - 
  

#### Functions ####
- 


<br>

## Testing ##

### Unit Test ###
- 

-  :
  




