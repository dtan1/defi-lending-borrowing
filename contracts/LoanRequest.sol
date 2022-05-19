///SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
import "./DappToken.sol";
import "./Loan.sol";

/// @title LoanRquest
/// @notice Simple loan to borrow ETH using ERC20 token as collateral
/** @dev created by borrower         
    borrower : create the loan request
    lender : accept loan request
*/
contract LoanRequest  {

    /// @notice State of the loan - in waiting for lender or has been accepted
    enum LoanState {
        WAITING,
        ACCEPTED
    }

    /// @notice Container for loan collateral
    /// @member collateralToken - ERC20 token as collateral
    /// @member collateralAmount - amount of ERC20 token in collateral 
    struct Collateral {
        IERC20 collateralToken;
        uint collateralAmount;
    }

    /// @notice Container for loan terms
    /// @member amount - amount of ETH to be borrowed
    /// @member duration - loan duration
    struct LoanTerms {
        uint amount;
        uint duration;
    }

    address borrower = msg.sender;
    Collateral internal collateral;
    LoanTerms loanTerms;
    uint internal payoffAmount;
    DappToken public dappToken;
    LoanState internal loanState;


    /// @notice Constructor (called by the borrower)
    /// @param _collateral - amount of ERC20 token in collateral
    /// @param _loanTerms - loanTerms for ETH  in Wei
    /// @param _payoffAmount - amount of ERC20 token in payoff
    /// @param _dappToken - dapp (ERC20) token to lend out 
    constructor(
        Collateral memory _collateral,
        LoanTerms memory _loanTerms,
        uint _payoffAmount,
        DappToken _dappToken
     ) {
        collateral = _collateral;
        loanTerms = _loanTerms;
        payoffAmount = _payoffAmount;
        dappToken = _dappToken;
        loanState = LoanState.WAITING;

    }

    /// @notice  borrower increase spender's allowance
    /// @param spender - spender address
    /// @param amount - amount of allwance to increase
   function increaseAllowance(address spender, uint amount) external {
        //console.log('**** inside contract **** increaseAllowance() *****');
        //console.log('msg.sender is ', msg.sender);
        //console.log('spender is ', spender);
        //console.log('address(dappToken) is ', address(dappToken));

        bool increaseAllowanceReturn = dappToken.increaseAllowance(spender, amount);
        assert(increaseAllowanceReturn);
    }

    // function getAllowance(address owner, address spender) external view returns (uint) {
    //     uint allowance = dappToken.allowance(owner, spender);
    //     return allowance;
    // }


    // function approveSpender(address spender, uint amount) public {
    //     dappToken.approve(spender, amount);
    //     uint allowance = dappToken.allowance(msg.sender, spender);
    //     //console.log('allowance(msg.sender, spender) is ' , allowance);
    // }

    event LoanRequstAccepted(address loan);

    /// @notice  called by lender to accept loan request
    /** @dev ERC20 token is transferred from borrower to loan contract as collateral;
             lenders transfer loan amount to borrower
    */
    function acceptLoanRequest() external payable {
        require( loanState == LoanState.WAITING, "Loan request is not in waiting state");
        require (msg.value == loanTerms.amount);

        Loan.Parties memory parties = Loan.Parties (msg.sender,borrower);
        Loan.Collateral memory loanCollateral = Loan.Collateral (
                                                dappToken,
                                                collateral.collateralAmount);
        Loan.LoanTerms memory loanLoanTerms = Loan.LoanTerms(
                                                loanTerms.amount,
                                                loanTerms.duration);

        Loan loan = new Loan(parties, loanCollateral, loanLoanTerms);
        loanState = LoanState.ACCEPTED;
  
        require( dappToken.transferFrom(borrower, address(loan), collateral.collateralAmount) , "");

        payable(borrower).transfer(loanTerms.amount); 
        emit LoanRequstAccepted(address(loan));

    }

}