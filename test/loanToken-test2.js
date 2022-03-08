const { expect } = require("chai");
const { ethers } = require("hardhat");
//const LoanToken = artifacts.require("LoanToken");


describe("LoanToken", function () {
  const LOAN_AMOUNT = 10;
  const LOAN_DURATION = 86400; // add 1 day - 86400 secs
  const COLLATERAL_AMOUNT = 15;
  const FEE_AMOUNT = 2;

  const ERC20_TOKEN_SUPPLY = 100;
  const BORROWER_STARTING_TOKEN = 5;
  const LENDER_STARTING_TOKEN = ERC20_TOKEN_SUPPLY - BORROWER_STARTING_TOKEN; //95


    const LOAN_TERMS = ({

      loanTokenAmount : LOAN_AMOUNT,
      feeTokenAmount : FEE_AMOUNT,
      ethCollateralAmount : ethers.utils.parseEther(COLLATERAL_AMOUNT.toString()),
      loanDuration : LOAN_DURATION  // today's date + loan duratoin ***
    });

  let LoanToken;
  let loanToken;
  let DappToken;
  let dappToken;
  let lenderStartingEth;



  before(async function () {
    [lender, borrower] = await ethers.getSigners();
    console.log("lender addr is " + lender.address);
    console.log("borrower addr is " + borrower.address);

    DappToken = await ethers.getContractFactory("DappToken");
    dappToken = await DappToken.deploy(lender.address, ERC20_TOKEN_SUPPLY);
    await dappToken.deployed();
    console.log("dappToken addr is " + dappToken.address);


    LoanToken = await ethers.getContractFactory("LoanToken");


    loanToken = await LoanToken.deploy(LOAN_TERMS, dappToken.address);
    await loanToken.deployed();
    console.log("loanToken addr is " + loanToken.address);
    provider = ethers.provider;

    // set up borrower with BORROWER_STARTING_TOKEN  (transferred from lender)
    await dappToken.transfer(borrower.address, BORROWER_STARTING_TOKEN, {from: lender.address});
    console.log("borrower starting token balance  is " + await dappToken.balanceOf(borrower.address));
    console.log("lender starting token  balance  is " + await dappToken.balanceOf(lender.address));
    let lenderBalance = await provider.getBalance(lender.address);
    let lenderEthBalance = ethers.utils.formatEther(lenderBalance);
    console.log("lender strating ether balance is " + lenderEthBalance);
    lenderStartingEth = Math.round( parseInt(lenderEthBalance));
    console.log("lenderStartingEth is " + lenderStartingEth);
    
  });

  after ( async function () {
    console.log(' ');
    console.log('------------ end of loan token test 2 --------------');
    console.log(' ');
    
  });

  describe("LoanToken 2 testing", function () {

    it("lender should liquidate loan correctly ", async function () {

      await dappToken.increaseAllowance(loanToken.address, LOAN_TERMS.loanTokenAmount);
      await loanToken.fundLoan( { value : LOAN_TERMS.loanTokenAmount});
      await loanToken.connect(borrower).takeUpLoan( { value : LOAN_TERMS.ethCollateralAmount});
  

        console.log("borrower token balance  is " + await dappToken.balanceOf(borrower.address));
        console.log("lender token  balance  is " + await dappToken.balanceOf(lender.address));
        console.log("loan token  balance  is " + await dappToken.balanceOf(loanToken.address));
        let lenderBalance = await provider.getBalance(lender.address);
        console.log("lender ether balance is " + 
                      ethers.utils.formatEther(lenderBalance));
     
        let loanTokenBalance = await provider.getBalance(loanToken.address);
        console.log("loanToken ether balance is " + 
                    ethers.utils.formatEther(loanTokenBalance));
        await network.provider.send("evm_increaseTime", [LOAN_DURATION]);
        await network.provider.send("evm_mine");
        //await ethers.provider.send("evm_mine", [LOAN_DURATION]);
  
        await loanToken.liquidate();
  
        console.log("==== loanTOkenTest ==== liquidate =====");
        borrowerTokenBalance = await dappToken.balanceOf(borrower.address);
        console.log("borrower token  balance  is " + borrowerTokenBalance);
        lenderTokenBalance = await dappToken.balanceOf(lender.address);
        console.log("lender token  balance  is " + lenderTokenBalance);
        loanTokenBalance = await dappToken.balanceOf(loanToken.address);
        console.log("loan token  balance  is " + loanTokenBalance);

        lenderBalance = await provider.getBalance(lender.address);
        let lenderEthBalance = ethers.utils.formatEther(lenderBalance);
        console.log("lender ether balance is " + lenderEthBalance);
        lenderRoundEthBalance = Math.round( parseInt(lenderEthBalance));
        console.log("lenderRoundEthBalance is " + lenderRoundEthBalance);

        loanTokenBalance = await provider.getBalance(loanToken.address);
        console.log("loanToken ether balance is " + 
                    ethers.utils.formatEther(loanTokenBalance));

        console.log("ethers.utils.formatEther(LOAN_TERMS.ethCollateralAmount) " +
                   ethers.utils.formatEther(LOAN_TERMS.ethCollateralAmount) );

        ethCollateralAmount = parseInt( ethers.utils.formatEther(LOAN_TERMS.ethCollateralAmount));
        console.log("ethCollaterAmount is " + ethCollateralAmount);
        expect(lenderRoundEthBalance).to.equal(lenderStartingEth + ethCollateralAmount);
  
      });


  });

});
