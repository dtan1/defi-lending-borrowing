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

    // let currentBlockNo =  await ethers.provider.getBlockNumber();
    // console.log("currentBlockNo is " + currentBlockNo);
    // let currentBlock =  await ethers.provider.getBlock(currentBlockNo);
    // console.log("currentBLock is " + currentBlock);
    // let currentTime =  await currentBlock.timeStamp;
    // console.log("currentTime is " + currentTime);

    // const now = new BigNumber(currentTime.toString());
    //console.log("now is " + now);

    //await ethers.provider.send('evm_setNextBockTimestamp',[now]);

    // const tmw = await ethers.provider.send("evm_increaseTime", [tomorrow]);
    // await ethers.provider.send('evn_mine', []);
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

    // simulate Ether was transferred from owner to user , in loanRequest acceptLoanRequest function
    // await lender.sendTransaction(
    //   { to : borrower.address, 
    //     value : ethers.utils.parseEther(LOAN_AMOUNT.toString())
    //   }
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

  describe("Loan (borrow ETH with ERC20 token as collaterla) testing", function () {


    it("should retrieve due date correctly ", async function () {
        console.log("----------------------");
      dueDate = await loan.getDueDate();
      date = new Date(dueDate * 1000);
      datevalues = [
          date.getFullYear(),
          date.getMonth()+1,
          date.getDate(),
          date.getHours(),
          date.getMinutes(),
          date.getSeconds()
      ];
      console.log("datevalues is " + datevalues);

      //expect(payoffAmount).to.equal(LOAN_AMOUNT);

    });


    it("should pay loan correctly ", async function () {
      console.log("----------------------");  
      // console.log("borrower token balance  is " + await dappToken.balanceOf(borrower.address));
      // console.log("loan token balance  is " + await dappToken.balanceOf(loan.address));
  

      lenderBalance = await provider.getBalance(lender.address);
      InitialRoundLenderBalance = Math.round(ethers.utils.formatEther(lenderBalance));
      //InitialRoundLenderBalance = Math.round(lenderBalance);
      console.log("initial lender ether balance is " + InitialRoundLenderBalance);

      borrowerBalance = await provider.getBalance(borrower.address);
      InitialRoundBorrowerBalance = Math.round(ethers.utils.formatEther(borrowerBalance));
      //InitialRoundBorrowerBalance = Math.round(borrowerBalance);
      console.log("initial borrower ether balance is " + InitialRoundBorrowerBalance);

      console.log("initial borrower token  balance  is " + await dappToken.balanceOf(borrower.address));
      console.log("initial loan token balance  is " + await dappToken.balanceOf(loan.address));

      console.log("ERC20 token in collateral is " + COLLATERAL_AMOUNT);
      

      //payoffAmount = await ethers.utils.parseEther(LOAN_AMOUNT.toString());
      payoffAmount = LOAN_AMOUNT;
      //console.log("payoff amount is " + ethers.utils.formatEther(payoffAmount));
      await loan.connect(borrower).payLoan( {value : ethers.BigNumber.from(payoffAmount) });

      borrowerTokenBalance = await dappToken.balanceOf(borrower.address);
      console.log("after payoff, borrower token  balance  is " + borrowerTokenBalance);
      console.log("after payoff, loan token balance  is " + await dappToken.balanceOf(loan.address));

      expect(borrowerTokenBalance).to.equal(COLLATERAL_AMOUNT);
      expect(await dappToken.balanceOf(loan.address)).to.equal("0");

      loanAmountInWholeEth = parseInt(ethers.utils.formatEther(LOAN_AMOUNT));
      console.log("loan amount in ether is " + loanAmountInWholeEth);

      borrowerBalance = await provider.getBalance(borrower.address);
      borrowerBalanceInWholeETH = Math.round(ethers.utils.formatEther(borrowerBalance));
      console.log("after payoff, borrower ether balance is " + 
                     borrowerBalanceInWholeETH);


      
      //expect(borrowerBalanceInWholeETH).to.equal(InitialRoundBorrowerBalance - LOAN_AMOUNT);

      expect(borrowerBalanceInWholeETH).to.equal(InitialRoundBorrowerBalance - 
                                                 loanAmountInWholeEth);

      lenderBalance = await provider.getBalance(lender.address);
      lenderBalanceInWholeEth = Math.round(ethers.utils.formatEther(lenderBalance));
      console.log("after payoff, lender ether balance is " + 
                     lenderBalanceInWholeEth);
      //expect(lenderBalanceInWholeEth).to.equal(InitialRoundLenderBalance + LOAN_AMOUNT);
      expect(lenderBalanceInWholeEth).to.equal(InitialRoundLenderBalance + 
                                               loanAmountInWholeEth);



    });

    // it("owner should re possess loan correctly ", async function () {
    //   console.log("----------------------");
    //   console.log("loan.address is " + loan.address);
    //   // let loanAmount = await loan.getLoanAmount();
    //   // console.log("loan amount is  " + loanAmount);
    //   await loan.repossess();
    //   //expect(loanAmount).to.equal(LOAN_AMOUNT);

    // });


  });


});
