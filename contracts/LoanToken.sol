///SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
import "./DappToken.sol";

/// @title LoanToken
/// @notice Simple loan contract to lend ERC20 token requiring ETH as collateral
/** @dev created by lender          
    properties : fix rate, fix term, single lender and borrower.
    lender : fundLoan
    borrower : takeLoan and accept loan
    borrower : repay
    lender : liquidate
*/

contract LoanToken  {

    /// @notice Container for loan terms
    /// @member loanTokenAmount - loan token amount
    /// @member feeTokenAmount - loan fee amount in token
    /// @member ethCollaterlaAmount - collateral amount in ETH
    /// @member loanDuration - loan duration
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

    /// @notice Constructor (called by the lender)
    /// @param _loanTerms - loan terms
    /// @param _dappToken - dapp (ERC20) token to lend out 
    ///
    constructor(
        LoanTerms memory _loanTerms,
        DappToken _dappToken
     ) {
        lender = msg.sender;
        loanTerms = _loanTerms;
        dappToken = _dappToken;
        dueDate = block.timestamp + loanTerms.loanDuration;
    }


    /// @notice Lender needs to fund the loan with ERC20 token first
    function fundLoan() external payable {
        require( dappToken.transferFrom(msg.sender, address(this), loanTerms.loanTokenAmount) , "fundLoan: transfer failed");

    }

    /// @notice get loan terms
    /// @return loanTerms
    function getLoanTerms() external view returns (LoanTerms memory ) {
        return (loanTerms);
    }

    /// @notice  called by borrower to take up loan with collateral in ETH
    /// @dev ERC20 token to be loaned is transferred to borrower
    function takeUpLoan() external payable {
        require( msg.value == loanTerms.ethCollateralAmount);
        borrower = msg.sender;
        require(dappToken.transfer(borrower, loanTerms.loanTokenAmount), "failed to transfer loan token to borrower");
    }

  
    /// @notice  callbed by borrower to repay ERC token, and get back eth
    function repay() external {
        require(msg.sender == borrower);
        // console.log("loanTerms.loanTokenAmount + loanTerms.feeTokenAmount is " ,
        //                 loanTerms.loanTokenAmount + loanTerms.feeTokenAmount);
        require( dappToken.transferFrom(borrower, lender,
                 loanTerms.loanTokenAmount + loanTerms.feeTokenAmount) , "repay: transfer failed");

        // after repaid
        selfdestruct(payable(borrower)); // release eth back to borrower.
    }

    /// @notice  called by lender only when loan is not paid after due date
    /// @dev reclaim eth in collateral 
    function liquidate() external {
        require(msg.sender == lender, "only lender can liquidate the loan");
        // console.log("l..block.timestamp is ", block.timestamp);
        // console.log("l..dueDate is ", dueDate);
        require(block.timestamp > dueDate,
                        "cannot liquidate before the loan is due" );
        selfdestruct(payable(lender));
        
    }



}