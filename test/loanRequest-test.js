const { expect } = require("chai");
const { ethers } = require("hardhat");
//const LoanRequest = artifacts.require("LoanRequest");


describe("LoanRequest", function () {
  const LOAN_AMOUNT = ethers.utils.parseEther('3'); //amount of ETH to borrow in Wei
  //const LOAN_AMOUNT = 3; //amount of ETH to borrow

  const LOAN_DURATION = 86400; // add 1 day - 86400 secs
  const COLLATERAL_AMOUNT = 15;
  const ERC20_TOKEN_SUPPLY = 100;

  let LoanRequest;
  let loanRequest;
  let DappToken;
  let dappToken;


  // comment out to turn console.log back on
  console.log = function(){}; // turn off console.log


  before(async function () {
    [borrower, lender1, lender2] = await ethers.getSigners();

    DappToken = await ethers.getContractFactory("DappToken");
    dappToken = await DappToken.deploy(borrower.address, ERC20_TOKEN_SUPPLY);
    await dappToken.deployed();

    LoanRequest = await ethers.getContractFactory("LoanRequest");

    const collateral = ({
      collateralToken : dappToken.address,
      collateralAmount : COLLATERAL_AMOUNT,
    });

    const loanTerms = ({
      amount : LOAN_AMOUNT,
      duration : LOAN_DURATION,
    });

    loanRequest = await LoanRequest.deploy(collateral, loanTerms, LOAN_AMOUNT, dappToken.address);
    await loanRequest.deployed();
    //console.log("loadRequest addr is " + loanRequest.address);
    provider = ethers.provider;
    
  });

  after ( async function () {
    console.log(' ');
    console.log('------------ end of loan request test  --------------');
    console.log(' ');
    
  });

  describe("LoanRequest testing", function () {

    it("borrower should increate spender's (loanRequest contract)  allowance correctly ", async function () {     
      //let approval = await dappToken.approve(loanRequest.address, COLLATERAL_AMOUNT);
      // console.log("approaval is " + approval);
       // await loanRequest.approveSpender(loanRequest.address, COLLATERAL_AMOUNT );
       await dappToken.increaseAllowance(loanRequest.address, COLLATERAL_AMOUNT);
     
    });


    it("should get allowance correctly ", async function () {
      allowance = await dappToken.allowance(borrower.address, loanRequest.address);
      expect(allowance).to.equal(COLLATERAL_AMOUNT);

    });

    it("should accept loan request correctly ", async function () {
      borrowerTokenBalance = await dappToken.balanceOf(borrower.address);
      console.log("borrower token  balance  is " + borrowerTokenBalance);
      lender1TokenBalance = await dappToken.balanceOf(lender1.address);
      console.log("lender 1 token  balance  is " + lender1TokenBalance);

      await loanRequest.connect(lender1).acceptLoanRequest( { value : LOAN_AMOUNT});

      console.log("==== loanRequestTest ==== after acceptLoanRequest =====");
      borrowerTokenBalance = await dappToken.balanceOf(borrower.address);
      console.log("borrower token  balance  is " + borrowerTokenBalance);
      lender1TokenBalance = await dappToken.balanceOf(lender1.address);
      console.log("lender 1 token  balance  is " + lender1TokenBalance);
      console.log("lender 1 eth baalnce is " + 
                   ethers.utils.formatEther(await provider.getBalance(lender1.address))
                );
      console.log("borrower eth baalnce is " + 
                ethers.utils.formatEther(await provider.getBalance(borrower.address))
             );
      //console.log("loan token balance  is " + await dappToken.balanceOf(loan.address));
      expect(borrowerTokenBalance).to.equal(ERC20_TOKEN_SUPPLY - COLLATERAL_AMOUNT);

    });

    it("should reject loan request that has already been accepted correctly ", async function () {
      // await expect(loanRequest.acceptLoanRequest( { value : LOAN_AMOUNT})
      //             ).to.be.revertedWith("Loan request is not in waiting state");
       await expect(loanRequest.connect(lender2).acceptLoanRequest( { value : LOAN_AMOUNT})
                    ).to.be.reverted;

    });


  });

});
