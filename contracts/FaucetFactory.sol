// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import "./Faucet.sol";

contract FaucetFactory {
    // State variables
    address[] public deployedFaucets;
    mapping(address => address[]) public faucetsByOwner;
    mapping(address => bool) public isFaucet;

    // Events
    event FaucetCreated(
        address indexed faucetAddress,
        address indexed owner,
        uint256 timestamp
    );

    // Create a new Faucet contract
    function createFaucet() external {
        Faucet newFaucet = new Faucet();
        address newFaucetAddr = address(newFaucet);

        deployedFaucets.push(newFaucetAddr);
        faucetsByOwner[msg.sender].push(newFaucetAddr);
        isFaucet[newFaucetAddr] = true;

        // Transfer ownership to the creator
        newFaucet.transferOwnership(msg.sender);

        emit FaucetCreated(newFaucetAddr, msg.sender, block.timestamp);
    }

    // View functions

    // Get all deployed faucets
    function getAllFaucets() external view returns (address[] memory) {
        return deployedFaucets;
    }

    // Get faucets owned by specific address
    function getFaucetsByOwner(
        address owner
    ) external view returns (address[] memory) {
        return faucetsByOwner[owner];
    }

    // Get total number of faucets
    function getTotalFaucets() external view returns (uint256) {
        return deployedFaucets.length;
    }

    // Check if address is a faucet contract
    function checkIsFaucet(address addr) external view returns (bool) {
        return isFaucet[addr];
    }

    // Get faucet info by index
    function getFaucetByIndex(
        uint256 index
    )
        external
        view
        returns (
            address faucetAddress,
            address owner,
            uint256 balance,
            uint256 totalDonors
        )
    {
        require(index < deployedFaucets.length, "Index out of bounds");

        address faucetAddr = deployedFaucets[index];
        Faucet faucet = Faucet(payable(faucetAddr));

        return (
            faucetAddr,
            faucet.owner(),
            address(faucetAddr).balance,
            faucet.numOfDonors()
        );
    }
}
