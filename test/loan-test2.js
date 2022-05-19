const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const BigNumber = require('bignumber.js');
//const { loadFixture } = require("ethereum-waffle");
//const LoanRequest = artifacts.require("LoanRequest");


describe("Loan", function () {
  //const LOAN_AMOUNT = 10;  // load amount in ETH
  const LOAN_AMOUNT = ethers.utils.parseEther('10'); //amount of ETH to borrow in Wei
  const COLLATERAL_AMOUNT = 15;
  const ERC20_TOKEN_SUPPLY = 100;
  const LOAN_DURATION = 86400; // add 1 day - 86400 secs

  let Loan;
  let loan;
  let DappToken;
  let dappToken;
  let provider;

    // comment below to turn console.log back on
  //console.log = function(){}; // turn off console.log



  before(async function () {
    // [owner, user, user1, user2, user3] = await ethers.getSigners();
    [lender, borrower] = await ethers.getSigners();

    DappToken = await ethers.getContractFactory("DappToken");
    //dappToken = await DappToken.deploy(owner.address, ERC20_TOKEN_SUPPLY);
    dappToken = await DappToken.deploy(lender.address, ERC20_TOKEN_SUPPLY);


    Loan = await ethers.getContractFactory("Loan");
    const parties = ({
        // lender : owner.address,
        // borrower : user.address
        lender : lender.address,
        borrower : borrower.address
    });
    const collateral = ({
      token : dappToken.address,
      amount : COLLATERAL_AMOUNT,
    });

 
    const loanTerms = ({
        amount : LOAN_AMOUNT,
        duration : LOAN_DURATION,
    });
    loan = await Loan.deploy(parties, collateral, loanTerms);
    await loan.deployed();
    provider = ethers.provider;


    //set up token balance
    await dappToken.transfer(loan.address, COLLATERAL_AMOUNT, {from: lender.address});
    // console.log("borrower token balance  is " + await dappToken.balanceOf(borrower.address));
    // console.log("loan token balance  is " + await dappToken.balanceOf(loan.address));

    // simulate Ether was transferred from lender to borrower , in loanRequest acceptLoanRequest function
    await lender.sendTransaction(
      { to : borrower.address, 
        value : ethers.BigNumber.from(LOAN_AMOUNT)
      }
  );


    // let borrowerBalance = await provider.getBalance(borrower.address);
    // console.log("borrower ether balance is " + 
    // ethers.utils.formatEther(borrowerBalance));

    // let lenderBalance = await provider.getBalance(lender.address);
    // console.log("lender ether balance is " + 
    // ethers.utils.formatEther(lenderBalance));
       
    
  });

  after ( async function () {
    console.log(' ');
    console.log('------------ end of loan test  --------------');
    console.log(' ');
    
  });

  describe("Loan 2 (borrow ETH with ERC20 token as collaterla) testing", function () {

    it("lender should re possess loan correctly ", async function () {
      console.log("----------------------");

      console.log("borrower token  balance  is " + await dappToken.balanceOf(borrower.address));
      console.log("lender token balance  is " + await dappToken.balanceOf(lender.address));
      console.log("loan token balance  is " + await dappToken.balanceOf(loan.address));


      // lenderBalance = await provider.getBalance(lender.address);
      // InitialRoundLenderBalance = Math.round(ethers.utils.formatEther(lenderBalance));
      // //InitialRoundLenderBalance = Math.round(lenderBalance);
      // console.log("initial lender ether balance is " + InitialRoundLenderBalance);
  
      await network.provider.send("evm_increaseTime", [LOAN_DURATION]);
      await network.provider.send("evm_mine");
      //await ethers.provider.send("evm_mine", [LOAN_DURATION]);

      await loan.repossess();

      console.log("==== loan Test ==== after repossess =====");
      console.log("borrower token  balance  is " + await dappToken.balanceOf(borrower.address));
      lenderTokenBalance = await dappToken.balanceOf(lender.address);
      console.log("lender token balance  is " + lenderTokenBalance    );
      console.log("loan token balance  is " + await dappToken.balanceOf(loan.address));
      expect(lenderTokenBalance).to.equal(ERC20_TOKEN_SUPPLY);
      
      // lenderBalance = await provider.getBalance(lender.address);
      // lenderBalanceInWholeEth = Math.round(ethers.utils.formatEther(lenderBalance));
      // console.log("after payoff, lender ether balance is " + 
      //                 lenderBalanceInWholeEth);
  
  
      //expect(loanAmount).to.equal(LOAN_AMOUNT);
    });
   

  });


});


