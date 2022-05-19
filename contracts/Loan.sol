///SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

/// @title Loan
/// @notice simple loan contract
contract Loan  {

    /// @notice Container for loan parties involved
    /// @member lender of the loan
    /// @member borrower of the loan
    struct Parties {
        address lender;
        address borrower;
    }

    /// amount of ERC20 token as collateral
    /// @notice Container for loan collateral
    /// @member token - ERC20 token as collateral
    /// @member amount - amount of ERC20 token in collateral 
    struct Collateral {
        IERC20 token;
        uint amount;
    }

    /// loan terms : amount and duration
    /// @notice Container for loan terms
    /// @member amount - amount of ETH (in Wei) to borrow/loan
    /// @member duration - duration of the loan
    struct LoanTerms {
        uint amount;
        uint duration;
    }

    Parties  parties;
    Collateral collateral;
    LoanTerms loanTerms;
    uint dueDate;


    /// @notice Constructor 
    /// @param _parties - loan parties involved
    /// @param _collateral - amount of ERC20 token in collateral
    /// @param _loanTerms - loanTerms for ETH 
    constructor(
        Parties memory _parties,
        Collateral memory _collateral,
        LoanTerms memory _loanTerms
     ) {
        parties = _parties;
        collateral = _collateral;
        loanTerms = _loanTerms;
        dueDate = block.timestamp + loanTerms.duration;
        console.log("dueDate is " , dueDate);
    }

    event LoanPaid();

    /// @notice modifier for lender only execution
    modifier onlyLender() {
        require(msg.sender == parties.lender);
        _;
    }

    /// @notice modifier for borrower only execution
    modifier onlyBorrower() {
        require(msg.sender == parties.borrower);
        _;
    }

    // function getLender() public view returns(address) {
    //     return parties.lender;
    // }

    // function getCollateralAmount() public view returns(uint) {
    //     return collateral.amount;
    // }

    // function getCollateralToken() public view returns(string memory) {
    //     return collateral.token.name();
    // }

     /// @notice retrieve load due data
     /// @return dueDate in seconds since
    function getDueDate() external view returns (uint) {
        return dueDate;
    }

    // function getLoanAmount() public view returns(uint) {
    //     console.log("loanTerms.amount is ", loanTerms.amount);
    //     return loanTerms.amount;
    // }


     /// @notice called by borrower to pay off the loan
    function payLoan() external payable onlyBorrower {
        require(block.timestamp <= dueDate);
        // console.log("l..msg.value is ", msg.value);
        // console.log("l..msg.sender is ", msg.sender);
        //console.log("l..loanTerms.amount is ", loanTerms.amount);
        
       // uint loanTermsAmount = loanTerms.amount*10**18;
        require(msg.value == loanTerms.amount, "amount pay not equal to loan amount");
        uint collateralAmount = collateral.amount;
        collateral.amount = 0;

        // transfer collateral ERC20 token back to borrower
        //require(collateral.token.transfer(parties.borrower, collateral.amount), "payloan failed");
        require(collateral.token.transfer(parties.borrower, collateralAmount), "payloan failed");

        emit LoanPaid();

        // transfer ETH back to the lender
        selfdestruct(payable(parties.lender));

    }

    /** @notice called by lender to claim the ERC20 token in collateral  
                and re possess ETH in loan
    */  
    function repossess() external payable onlyLender {
        // console.log("l..block.timestamp is ", block.timestamp);
        // console.log("l..dueDate is ", dueDate);
        require(block.timestamp > dueDate, "loan is not due yet ");
        require(collateral.token.transfer(parties.lender, collateral.amount), "repossess failed");
        selfdestruct(payable(parties.lender));
    }
}