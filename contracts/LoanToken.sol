///SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
import "./DappToken.sol";
import "./Loan.sol";

/// @title LoanToken
/// @notice Simple loan to borrow ERC20 token using ETH as collateral
/// properties : fix rate, fix term, single lender and borrower.
/// fundLoan
/// takeLoan and accept loan
/// repay
/// liquidate
contract LoanToken  {

    struct LoanTerms {
        uint loanTokenAmount;
        uint feeTokenAmount;
        uint ethCollateralAmount;
        //uint repayByTimestamp;
        uint loanDuration;
    }

    address borrower;
    address lender;
    LoanTerms public loanTerms;
    DappToken public dappToken;
    uint dueDate; 


    constructor(
        LoanTerms memory _loanTerms,
        DappToken _dappToken
     ) {
        lender = msg.sender;
        loanTerms = _loanTerms;
        dappToken = _dappToken;
        dueDate = block.timestamp + loanTerms.loanDuration;
        //console.log("*** contract **** constructor **** ");
        //console.log("address(dappToken) is ", address(dappToken));
    }


    // lender transfer ERC token to the contract
    // which can later be transferred to borrower as a loan
    function fundLoan() public payable {
        // require ...
        dappToken.transferFrom(msg.sender, address(this), loanTerms.loanTokenAmount);

    }

    // get loan terms
    function getLoanTerms() public view returns (LoanTerms memory ) {
        return (loanTerms);
    }

    // called by borrower
    // borrower supply eth as collateral
    // ERC token to be loaned is transferred to borrower
    function takeUpLoan() public payable {
        require( msg.value == loanTerms.ethCollateralAmount);
        borrower = msg.sender;
        dappToken.transfer(borrower, loanTerms.loanTokenAmount);
    }

  
    // callbed by borrower to repay ERC token, and get back eth
    function repay() public {
        require(msg.sender == borrower);
        console.log("loanTerms.loanTokenAmount + loanTerms.feeTokenAmount is " ,
                        loanTerms.loanTokenAmount + loanTerms.feeTokenAmount);
        dappToken.transferFrom(borrower, lender,
                 loanTerms.loanTokenAmount + loanTerms.feeTokenAmount);

        // after repaid
        selfdestruct(payable(borrower)); // release eth back to borrower.
    }

    // called by lender only when loan is not paid after due date
    // reclaim eth in collateral 
    function liquidate() public {
        require(msg.sender == lender, "only lender can liquidate the loan");
        console.log("l..block.timestamp is ", block.timestamp);
        console.log("l..dueDate is ", dueDate);
        require(block.timestamp > dueDate,
                        "cannot liquidate before the loan is due" );
        selfdestruct(payable(lender));
        
    }



}