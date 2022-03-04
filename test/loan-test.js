const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const BigNumber = require('bignumber.js');
const { loadFixture } = require("ethereum-waffle");
//const LoanRequest = artifacts.require("LoanRequest");


describe("Loan", function () {
  const LOAN_AMOUNT = 10;
  const COLLATERAL_AMOUNT = 15;
  const ERC20_TOKEN_SUPPLY = 100;
  const LOAN_DURATION = 86400; // add 1 day - 86400 secs

  let Loan;
  let loan;
  let DappToken;
  let dappToken;
  let provider;

    // uncomment below to turn console.log back on
  //console.log = function(){}; // turn off console.log



  before(async function () {
    [owner, user, user1, user2, user3] = await ethers.getSigners();
    console.log("owner add is " + owner.address);
    console.log("user addr is " + user.address);

    DappToken = await ethers.getContractFactory("DappToken");
    dappToken = await DappToken.deploy(owner.address, ERC20_TOKEN_SUPPLY);


    Loan = await ethers.getContractFactory("Loan");
    const parties = ({
        lender : owner.address,
        borrower : user.address
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
    await dappToken.transfer(loan.address, COLLATERAL_AMOUNT, {from: owner.address});
    console.log("user token balance  is " + await dappToken.balanceOf(user.address));
    console.log("loan token balance  is " + await dappToken.balanceOf(loan.address));

    // simulate Ether was transferred from owner to user , in loanRequest lendEther function
    await owner.sendTransaction(
        { to : user.address, 
          value : ethers.utils.parseEther(LOAN_AMOUNT.toString())
        }
    );

    let userBalance = await provider.getBalance(user.address);
    console.log("user ether balance is " + 
    ethers.utils.formatEther(userBalance));

    let ownerBalance = await provider.getBalance(owner.address);
    console.log("owner ether balance is " + 
    ethers.utils.formatEther(ownerBalance));
       
    
  });

  describe("Loan testing", function () {
    console.log("----------------------");
    it("should initialize parties struct correctly ", async function () {
      let lender = await loan.getLender();
      console.log("loan lender is " + lender);
      expect (lender).to.equal(owner.address);


      // payoffAmount = await loanRequest.getPayoffAmount();
      // console.log("payoff amount is " + payoffAmount);
      // expect(payoffAmount).to.equal(LOAN_AMOUNT);

    });

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

    it("should set loan amount correctly ", async function () {
        console.log("----------------------");
        let loanAmount = await loan.getLoanAmount();
        console.log("loan amount is  " + loanAmount);
        expect(loanAmount).to.equal(LOAN_AMOUNT);
  
      });

    it("should pay loan correctly ", async function () {
      console.log("----------------------");
      
      console.log("user token balance  is " + await dappToken.balanceOf(user.address));
 
      let ownerBalance = await provider.getBalance(owner.address);
      console.log("owner ether balance is " + 
                   ethers.utils.formatEther(ownerBalance));

    let userBalance = await provider.getBalance(user.address);
    console.log("user ether balance is " + 
                ethers.utils.formatEther(userBalance));

        // await loan.connect(user).payLoan( {value : LOAN_AMOUNT});
      payoffAmount = await ethers.utils.parseEther(LOAN_AMOUNT.toString());
       
      //let payoffAmount = parseInt(payoffAmountString);
      //console.log("payoffAmount is " + payoffAmount);
      //const bnPayoffAmount = BigInt(payoffAmount);
      //console.log("bnPayoffAmount is " + bnPayoffAmount);
      //await loan.connect(user).payLoan( {value : bnPayoffAmount });
      await loan.connect(user).payLoan( {value : ethers.BigNumber.from(payoffAmount) });

    

      let userTokenBalance = await dappToken.balanceOf(user.address);
      console.log("after payoff, user token  balance  is " + userTokenBalance);
      console.log("after payoff, loan token balance  is " + await dappToken.balanceOf(loan.address));
  
      expect(userTokenBalance).to.equal(COLLATERAL_AMOUNT);

      userBalance = await provider.getBalance(user.address);
      console.log("after payoff, user ether balance is " + 
      ethers.utils.formatEther(userBalance));

      ownerBalance = await provider.getBalance(owner.address);
      console.log("after payoff, owner ether balance is " + 
        ethers.utils.formatEther(ownerBalance));
    });

  });

});
