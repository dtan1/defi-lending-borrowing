///SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

/// @title Loan
/// @notice simple loan contract
contract Loan  {
    struct Parties {
        address lender;
        address borrower;
    }

    struct Collateral {
        IERC20 token;
        uint amount;
    }
    struct LoanTerms {
        uint amount;
        uint duration;
    }

    Parties  parties;
    Collateral collateral;
    LoanTerms loanTerms;
    uint dueDate;



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

    function getLender() public view returns(address) {
        return parties.lender;
    }

    function getCollateralAmount() public view returns(uint) {
        return collateral.amount;
    }

    // function getCollateralToken() public view returns(string memory) {
    //     return collateral.token.name();
    // }

    function getDueDate() public view returns (uint) {
        return dueDate;
    }

    function getLoanAmount() public view returns(uint) {
        console.log("loanTerms.amount is ", loanTerms.amount);
        return loanTerms.amount;
    }

    //called by borrower to pay off the loan
    function payLoan() public payable {
        require(block.timestamp <= dueDate);
        console.log("l..msg.value is ", msg.value);
        console.log("l..msg.sender is ", msg.sender);
        //console.log("l..loanTerms.amount is ", loanTerms.amount);
        
        uint loanTermsAmount = loanTerms.amount*10**18;
        require(msg.value == loanTermsAmount);


        // console.log("l..collateral.token is ", collateral.token.name());
        // console.log("l..collateral.amount is ", collateral.amount);
        // console.log("l..contract balance is ", address(this).balance);
        // console.log("l..sender token balance is ", collateral.token.balanceOf(msg.sender));


        // transfer collateral ERC20 token back to borrower
        collateral.token.transfer(parties.borrower, collateral.amount);


        emit LoanPaid();
        selfdestruct(payable(parties.lender));

    }
}