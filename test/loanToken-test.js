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
  //    amount : LOAN_AMOUNT,
  //duration : LOAN_DURATION,
      loanTokenAmount : LOAN_AMOUNT,
      feeTokenAmount : FEE_AMOUNT,
      ethCollateralAmount : COLLATERAL_AMOUNT,
      loanDuration : LOAN_DURATION 
    });

  let LoanToken;
  let loanToken;
  let DappToken;
  let dappToken;

  // comment out to turn console.log back on
  // console.log = function(){}; // turn off console.log


  // describe("Dapp token initialization", async () => {
  //   it('verify token name ', async() => {
  //     DappToken = await ethers.getContractFactory("DappToken");
  //     dappToken = await DappToken.deploy(lender.address, ERC20_TOKEN_SUPPLY);
  //     const dappTokenName = await dappToken.symbol();
  //     expect(dappTokenName).to.equal("DAP");
  //   })
    
  // })

  before(async function () {
    [lender, borrower] = await ethers.getSigners();
    console.log("lender addr is " + lender.address);
    console.log("borrower addr is " + borrower.address);

    DappToken = await ethers.getContractFactory("DappToken");
    dappToken = await DappToken.deploy(lender.address, ERC20_TOKEN_SUPPLY);
    await dappToken.deployed();
    console.log("dappToken addr is " + dappToken.address);


    LoanToken = await ethers.getContractFactory("LoanToken");

    // const LOAN_TERMS = ({
    //   amount : LOAN_AMOUNT,
    //   duration : LOAN_DURATION,
    //   loanTokenAmount : LOAN_AMOUNT,
    //   feeTokenAmount : FEE_AMOUNT,
    //   ethCollateralAmount : COLLATERAL_AMOUNT,
    //   repayByTimestamp : LOAN_DURATION  // today's date + loan duratoin ***
    // });

    loanToken = await LoanToken.deploy(LOAN_TERMS, dappToken.address);
    await loanToken.deployed();
    console.log("loanToken addr is " + loanToken.address);
    provider = ethers.provider;

    // set up borrower with BORROWER_STARTING_TOKEN  (transferred from lender)
    await dappToken.transfer(borrower.address, BORROWER_STARTING_TOKEN, {from: lender.address});
    console.log("borrower starting token balance  is " + await dappToken.balanceOf(borrower.address));
    console.log("lender starting token  balance  is " + await dappToken.balanceOf(lender.address));
    
    
  });

  after ( async function () {
    console.log(' ');
    console.log('------------ end of loan token test  --------------');
    console.log(' ');
    
  });

  describe("LoanToken testing", function () {
    // before( async() => {
    //   // create new instance
    //   dappToken = await DappToken.new(lender.address, ERC20_TOKEN_SUPPLY);

    // })
    it("should initialize loan terms struct correctly ", async function () {
      let  loanTerms = await loanToken.getLoanTerms();
      console.log("collateral amount is " + loanTerms.ethCollateralAmount);
      expect (loanTerms.ethCollateralAmount).to.equal(LOAN_TERMS.ethCollateralAmount);


    });



    it("should approvea spender from test js correctly ", async function () {
       
      console.log("===== loanTokenTest ==== dappToken.increaseAllowance ======");
       //await dappToken.increaseAllowance(loanToken.address, LOAN_AMOUNT);
       await dappToken.increaseAllowance(loanToken.address, LOAN_TERMS.loanTokenAmount);
     
    });



    it("lender should fund loan correctly ", async function () {

      console.log("lender token  balance  is " + await dappToken.balanceOf(lender.address));
      console.log("loan token  balance  is " + await dappToken.balanceOf(loanToken.address));
   

      //await loanToken.fundLoan( { value : LOAN_AMOUNT});
      await loanToken.fundLoan( { value : LOAN_TERMS.loanTokenAmount});

      console.log("==== loanTOkenTest ==== fundLoan =====");
      lenderTokenBalance = await dappToken.balanceOf(lender.address);
      console.log("lender token  balance  is " + lenderTokenBalance);
      loanTokenBalance = await dappToken.balanceOf(loanToken.address);
      console.log("loan token  balance  is " + loanTokenBalance);
     
      //expect(loanTokenBalance).to.equal(LOAN_AMOUNT);
      expect(loanTokenBalance).to.equal(LOAN_TERMS.loanTokenAmount);

    });

    it("borrower should take up loan correctly ", async function () {

        console.log("borrower token  balance  is " + await dappToken.balanceOf(borrower.address));
        console.log("loan token  balance  is " + await dappToken.balanceOf(loanToken.address));
     
  
        await loanToken.connect(borrower).takeUpLoan( { value : LOAN_TERMS.ethCollateralAmount});
  
        console.log("==== loanTOkenTest ==== takeUpLoan =====");
        borrowerTokenBalance = await dappToken.balanceOf(borrower.address);
        console.log("borrower token  balance  is " + borrowerTokenBalance);
        loanTokenBalance = await dappToken.balanceOf(loanToken.address);
        console.log("loan token  balance  is " + loanTokenBalance);

        //expect(borrowerTokenBalance).to.equal(LOAN_AMOUNT + BORROWER_STARTING_TOKEN);
        expect(borrowerTokenBalance).to.equal(LOAN_TERMS.loanTokenAmount + BORROWER_STARTING_TOKEN);
  
      });


      it("should approve spender from test js correctly ", async function () {
       
        //let approval = await dappToken.approve(loanToken.address, COLLATERAL_AMOUNT);
        // console.log("approaval is " + approval);
         // await loanToken.approveSpender(loanToken.address, COLLATERAL_AMOUNT );
        console.log("===== loanTokenTest ==== dappToken.increaseAllowance ======");
         await dappToken.connect(borrower).increaseAllowance(loanToken.address, 
                            LOAN_TERMS.loanTokenAmount+ 
                            LOAN_TERMS.feeTokenAmount);
       
      });

      it("borrower should repay loan correctly ", async function () {

        console.log("borrower token balance  is " + await dappToken.balanceOf(borrower.address));
        console.log("lender token  balance  is " + await dappToken.balanceOf(lender.address));
        console.log("loan token  balance  is " + await dappToken.balanceOf(loanToken.address));
     
  
        await loanToken.connect(borrower).repay();
  
        console.log("==== loanTOkenTest ==== repay =====");
        borrowerTokenBalance = await dappToken.balanceOf(borrower.address);
        console.log("borrower token  balance  is " + borrowerTokenBalance);
        lenderTokenBalance = await dappToken.balanceOf(lender.address);
        console.log("lender token  balance  is " + lenderTokenBalance);
        loanTokenBalance = await dappToken.balanceOf(loanToken.address);
        console.log("loan token  balance  is " + loanTokenBalance);

        //expect(lenderTokenBalance).to.equal(LENDER_STARTING_TOKEN + FEE_AMOUNT);
        expect(lenderTokenBalance).to.equal(LENDER_STARTING_TOKEN + 
                            LOAN_TERMS.feeTokenAmount);
  
      });


  });

});
