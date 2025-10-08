// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.21;

contract Faucet {
    //function: Addfunds, withdraw, addressIndex, getFunders

    uint256 public numOfFunders;

    mapping(uint256 => address) private lutFunders;
    mapping(address => bool) private funders;

    receive() external payable {}

    function addFunds() external payable {
        address funder = msg.sender;
        if (!funders[funder]) {
            uint256 index = numOfFunders++;
            funders[funder] = true;
            lutFunders[index] = funder;
        }
    }

    function getFundersIndex(uint256 index) public view returns (address) {
        return lutFunders[index];
    }

    function getAllFunders() public view returns (address[] memory) {
        address[] memory _funders = new address[](numOfFunders);

        for (uint256 i = 0; i < numOfFunders; i++) {
            _funders[i] = lutFunders[i];
        }
        return _funders;
    }

    function withdraw(
        uint256 withdrawAmount
    ) external limitWithdraw(withdrawAmount) {
        payable(msg.sender).transfer(withdrawAmount);
    }

    //modifier
    modifier limitWithdraw(uint256 withdrawAmount) {
        require(
            withdrawAmount <= 1 * (10 ** 18),
            "Cannot withdraw more than 1 ETH"
        );
        _;
    }
}
