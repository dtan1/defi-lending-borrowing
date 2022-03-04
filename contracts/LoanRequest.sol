///SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
import "./DappToken.sol";
import "./Loan.sol";

/// @title LoanRquest
/// @notice Simple load to borrow ETH using ERC20 token as collateral
contract LoanRequest  {

    struct Collateral {
        IERC20 collateralToken;
        uint collateralAmount;
    }
    struct LoanTerms {
        uint amount;
        uint duration;
    }

    address borrower = msg.sender;
    Collateral internal collateral;
    LoanTerms loanTerms;
    uint internal payoffAmount;
    DappToken public dappToken;


    constructor(
        Collateral memory _collateral,
        LoanTerms memory _loanTerms,
        uint _payoffAmount,
        DappToken _dappToken
     ) {
        collateral = _collateral;
        loanTerms = _loanTerms;
        payoffAmount = _payoffAmount;
        ////console.log("payoffAmount is ", payoffAmount);
        dappToken = _dappToken;
        //console.log("*** contract **** constructor **** ");
        //console.log("address(dappToken) is ", address(dappToken));
    }

    function getPayoffAmount() public view returns(uint) {
        return payoffAmount;
    }

    function getCollateralAmount() public view returns(uint) {
        return collateral.collateralAmount;
    }

    // function getCollateralToken() public view returns(string memory) {
    //     return collateral.collateralToken.name();
    // }

   function increaseAllowance(address spender, uint amount) public {
        //console.log('**** inside contract **** increaseAllowance() *****');
        //console.log('msg.sender is ', msg.sender);
        //console.log('spender is ', spender);
        //console.log('address(dappToken) is ', address(dappToken));

        bool increaseAllowanceReturn = dappToken.increaseAllowance(spender, amount);
        assert(increaseAllowanceReturn);
    }

    function getAllowance(address owner, address spender) public view returns (uint) {
        //console.log('**** inside contract **** getAllowance() *****');
        //console.log('owner is ', owner);
        //console.log('spender is ', spender);
        //console.log('address(dappToken) is ', address(dappToken));

        uint allowance = dappToken.allowance(owner, spender);
        //console.log('*** inside contract, allowance is ' , allowance);
        return allowance;
    }

    // function getCollateralTokenAddress() public view returns(string memory) {
    //     return address(collateral.collateralToken);
    // }


    // function approveSpender(address spender, uint amount) public {
    //     //console.log('**** inside contract **** approveSpender *****');
    //     //console.log('msg.sener is ', msg.sender);
    //     //console.log('spender is  ', spender);
    //     dappToken.approve(spender, amount);
    //     uint allowance = dappToken.allowance(msg.sender, spender);
    //     //console.log('allowance(msg.sender, spender) is ' , allowance);
    // }

    event LoanRequstAccepted(address loan);

    // lender accepts ERC20 token from borrower as colleteral in the loan contract
    // i.e. ERC20 token is transferred from borrower to loan contract as collateral
    // lenders transfer loan amount to borrower
    function acceptLoanRequest() public payable {
        require (msg.value == loanTerms.amount);

        Loan.Parties memory parties = Loan.Parties (msg.sender,borrower);
        Loan.Collateral memory loanCollateral = Loan.Collateral (
                                                dappToken,
                                                collateral.collateralAmount);
        Loan.LoanTerms memory loanLoanTerms = Loan.LoanTerms(
                                                loanTerms.amount,
                                                loanTerms.duration);

        Loan loan = new Loan(parties, loanCollateral, loanLoanTerms);
      
        //dappToken.approve(address(this), collateral.collateralAmount);

        //console.log('**** inside contract **** acceptLoanRequest *****');
        //console.log('msg.sender is ', msg.sender);
        //console.log('address(this) is ', address(this));
        //console.log('address(dappToken) is ', address(dappToken));

        //uint allowance = dappToken.allowance(msg.sender, address(this));
        //console.log('*** inside contract, allowance is ' , allowance);

        dappToken.transferFrom(borrower, address(loan), collateral.collateralAmount);
        //console.log("loan token balance  is " , dappToken.balanceOf(address(loan)));
  
        payable(borrower).transfer(loanTerms.amount);
        emit LoanRequstAccepted(address(loan));

    }

}