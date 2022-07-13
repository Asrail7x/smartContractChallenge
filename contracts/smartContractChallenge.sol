// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract VouchersChallenge is ERC1155, Ownable, ERC1155Supply{
    using SafeERC20 for IERC20;
    
    // Id 0 = 1 Peso, Id 1 = 5 Pesos, Id 2 = 10 Pesos, Id 3 = 20 Pesos, Id 4 = 50 Pesos, Id 5 = 100 Pesos
    uint[6] public CashSupply = [50, 5, 5, 2, 2, 20]; //
    mapping (uint => uint) public CashToValue;

    constructor() ERC1155("Smart Contract Challenge") {
        // Define Values of each banknote
        CashToValue[0] = 1;
        CashToValue[1] = 5;
        CashToValue[2] = 10;
        CashToValue[3] = 20;
        CashToValue[4] = 50;
        CashToValue[5] = 100;
    }

    // External function that returns the sum of all the banknotes of a user
    function totalCashOfUser() external view returns(uint Z) {
        for (uint i; i < 6; i++) {
            Z += CashToValue[i] * balanceOf(msg.sender, i);
        }
        return Z;
    }

    // Admin functions to refill the "bank"
    function changeStocks(uint[6] memory updatedStocks) external onlyOwner {
        for (uint i; i < updatedStocks.length; i ++) {
            CashSupply[i] = updatedStocks[i];
        }
    }

    // Algorithm that determinated how much banknotes of each type is needed to fulfill the value
    function convertDenom(uint _value) public view returns(uint256[6] memory Z, bool Y) {
        uint totalSum;
        uint availableCash;
        for (uint i; i < CashSupply.length; i ++ ){
            availableCash += CashSupply[i] * CashToValue[i];
        }
        if (availableCash > _value) {
            do {
                if (_value - totalSum >= 100 && CashSupply[5] > 0) {
                    Z[5] += 1;
                    totalSum += 100;
                } else if( _value - totalSum >= 50 && CashSupply[4] > 0) {
                    Z[4] += 1;
                    totalSum += 50;
                } else if( _value - totalSum >= 20 && CashSupply[3] > 0){
                    Z[3] += 1;
                    totalSum += 20;
                } else if( _value - totalSum >= 10 && CashSupply[2] > 0) {
                    Z[2] += 1;
                    totalSum += 10;
                } else if( _value - totalSum >= 5 && CashSupply[1] > 0) {
                    Z[1] += 1;
                    totalSum += 5;
                } else if( _value - totalSum >= 1 && CashSupply[0] > 0) {
                    Z[0] += 1;
                    totalSum += 1;
                }
            } while(_value > totalSum);
            return (Z, true);
        } else {
            return (Z, false);
        }
    }

    // Public function to mint some bank notes
    function mintCash(uint value) external {
        require(value > 0 && value <= 2000, "Value must be greater than 0 and greater or equal to 2000");
        (, bool Y) = convertDenom(value);
        require(Y, "Not enough cash to mint");
        (uint256[6] memory cashArray, ) = convertDenom(value);
        for (uint i; i < cashArray.length; i++) {
            if (cashArray[i] != 0) {
                if (CashSupply[i] >= cashArray[i]) {
                    CashSupply[i] -= cashArray[i];
                    _mint(msg.sender, i, cashArray[i], "");
                } else {
                    revert("Not enough banknotes to fulfill this operation, please contact admin");
                }
            }
        }
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        internal
        override(ERC1155, ERC1155Supply)
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }


}
