const { expect } = require("chai");
const { ethers } = require("hardhat");
//const LoanRequest = artifacts.require("LoanRequest");


describe("LoanRequest", function () {
  const LOAN_AMOUNT = 10;
  const LOAN_DURATION = 86400; // add 1 day - 86400 secs
  const COLLATERAL_AMOUNT = 15;
  const ERC20_TOKEN_SUPPLY = 100;

  let LoanRequest;
  let loanRequest;
  let DappToken;
  let dappToken;

  // comment out to turn console.log back on
  console.log = function(){}; // turn off console.log


  // describe("Dapp token initialization", async () => {
  //   it('verify token name ', async() => {
  //     DappToken = await ethers.getContractFactory("DappToken");
  //     dappToken = await DappToken.deploy(owner.address, ERC20_TOKEN_SUPPLY);
  //     const dappTokenName = await dappToken.symbol();
  //     expect(dappTokenName).to.equal("DAP");
  //   })
    
  // })

  before(async function () {
    [owner, user, user1, user2, user3] = await ethers.getSigners();
    console.log("owner add is " + owner.address);
    console.log("user addr is " + user.address);

    DappToken = await ethers.getContractFactory("DappToken");
    dappToken = await DappToken.deploy(owner.address, ERC20_TOKEN_SUPPLY);
    await dappToken.deployed();
    console.log("dappToken addr is " + dappToken.address);
    // dappTokenChecksumAddr = ethers.utils.getAddress(dappToken.address);
    // console.log("dappToken checksum addr is " + dappTokenChecksumAddr);


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
    console.log("loadRequest addr is " + loanRequest.address);
    provider = ethers.provider;
    
  });

  describe("LoanRequest testing", function () {
    // before( async() => {
    //   // create new instance
    //   dappToken = await DappToken.new(owner.address, ERC20_TOKEN_SUPPLY);

    // })
    it("should initialize collateral struct correctly ", async function () {
      let collateralAmount = await loanRequest.getCollateralAmount();
      console.log("collateral amoutn is " + collateralAmount);
      expect (collateralAmount).to.equal(COLLATERAL_AMOUNT);


    });

    // it("should retrieve collateral token correctly ", async function () {
    //   let collateralToken = await loanRequest.getCollateralToken();
    //   console.log("collateral token is " + collateralToken);
    //   //expect (collateralAmount).to.equal(COLLATERAL_AMOUNT);


    //   // payoffAmount = await loanRequest.getPayoffAmount();
    //   // console.log("payoff amount is " + payoffAmount);
    //   // expect(payoffAmount).to.equal(LOAN_AMOUNT);

    // });

    it("should approvea spender from test js correctly ", async function () {
       
      //let approval = await dappToken.approve(loanRequest.address, COLLATERAL_AMOUNT);
      // console.log("approaval is " + approval);
       // await loanRequest.approveSpender(loanRequest.address, COLLATERAL_AMOUNT );
      console.log("===== loanRequestTest ==== dappToken.increaseAllowance ======");
       await dappToken.increaseAllowance(loanRequest.address, COLLATERAL_AMOUNT);
     
    });

    // it("should approvea spender from inside loanRequest correctly ", async function () {
       
    //   //let approval = await dappToken.approve(loanRequest.address, COLLATERAL_AMOUNT);
    //   // console.log("approaval is " + approval);
    //    // await loanRequest.approveSpender(loanRequest.address, COLLATERAL_AMOUNT );
    //   console.log("===== loanRequestTest ==== loanRequest.increaseAllowance ======");
    //    await loanRequest.increaseAllowance(loanRequest.address, COLLATERAL_AMOUNT);
     
    // });


    it("should get allowance from test js correctly ", async function () {

      console.log("===== loadRequestTest ======");
      console.log("owner.address is " + owner.address);
      console.log("loadRequest.address is " + loanRequest.address);
      allowance = await dappToken.allowance(owner.address, loanRequest.address);
      console.log('allowance(owner.address, loanRequest.address) is ' + allowance);
      expect(allowance).to.equal(COLLATERAL_AMOUNT);

    });


    // it("should get allowance from inside loanRequest contract ccorectly ", async function () {

    //   console.log("===== loadRequestTest ======");
    //   console.log("owner.address is " + owner.address);
    //   console.log("loadRequest.address is " + loanRequest.address);
    //   allowance = await loanRequest.getAllowance(owner.address, loanRequest.address);
    //   console.log('allowance(owner.address, loanRequest.address) is ' + allowance);
    //   expect(allowance).to.equal(COLLATERAL_AMOUNT);
    // });

    it("should accept loan request correctly ", async function () {

      console.log("owner token  balance  is " + await dappToken.balanceOf(owner.address));
      console.log("user token  balance  is " + await dappToken.balanceOf(user.address));
   

      await loanRequest.acceptLoanRequest( { value : LOAN_AMOUNT});

      console.log("==== loanRequestTest ==== after acceptLoanRequest =====");
      ownerTokenBalance = await dappToken.balanceOf(owner.address);
       console.log("owner token  balance  is " + ownerTokenBalance);
       userTokenBalance = await dappToken.balanceOf(user.address);
      console.log("user token  balance  is " + userTokenBalance);
      //console.log("loan token balance  is " + await dappToken.balanceOf(loan.address));
      expect(ownerTokenBalance).to.equal(ERC20_TOKEN_SUPPLY - COLLATERAL_AMOUNT);

    });


  });

});
