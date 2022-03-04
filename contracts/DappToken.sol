///SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

/// @title DappToekn
/// @notice Implements a basic standard ERC20 token 
contract DappToken  is ERC20, Ownable {
    ///using SafeMath for uint;

    constructor(address _owner, uint _supply) ERC20("DappToken","DAP") {
        _mint(_owner, _supply);
        //console.log("owner() is " , owner());
    }



}