const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const BigNumber = require('bignumber.js');
//const { loadFixture } = require("ethereum-waffle");
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

    // comment below to turn console.log back on
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

  after ( async function () {
    // reset Ether balanace
    await user.sendTransaction(
        { to : owner.address, 
          value : ethers.utils.parseEther(LOAN_AMOUNT.toString())
        }
    );
    console.log(' ');
    console.log('------------ end of loan test 2 --------------');
    console.log(' ');
    
  });

  describe("Loan 2 testing", function () {

    it("owner should re possess loan correctly ", async function () {
      console.log("----------------------");


      // let loanAmount = await loan.getLoanAmount();
      // console.log("loan amount is  " + loanAmount);
      let userTokenBalance = await dappToken.balanceOf(user.address);
      console.log("user token  balance  is " + userTokenBalance);
      console.log("owner token balance  is " + await dappToken.balanceOf(owner.address));
      console.log("loan token balance  is " + await dappToken.balanceOf(loan.address));
      let ownerBalance = await provider.getBalance(owner.address);
      console.log("owner ether balance is " + 
                    ethers.utils.formatEther(ownerBalance));
  
      await network.provider.send("evm_increaseTime", [LOAN_DURATION]);
      await network.provider.send("evm_mine");
      //await ethers.provider.send("evm_mine", [LOAN_DURATION]);

      await loan.repossess();

      console.log("==== loan Test ==== after repossess =====");
      console.log("user token  balance  is " + await dappToken.balanceOf(user.address));
      ownerTokenBalance = await dappToken.balanceOf(owner.address);
      console.log("owner token balance  is " + ownerTokenBalance    );
      console.log("loan token balance  is " + await dappToken.balanceOf(loan.address));
      expect(ownerTokenBalance).to.equal(ERC20_TOKEN_SUPPLY);

      ownerBalance = await provider.getBalance(owner.address);
      console.log("owner ether balance is " + 
                    ethers.utils.formatEther(ownerBalance));
  
  
      //expect(loanAmount).to.equal(LOAN_AMOUNT);

    });




  });

});
