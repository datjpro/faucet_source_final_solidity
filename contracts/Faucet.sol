// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

contract Faucet {
    // State variables
    address public owner;
    uint256 public totalFunds;
    uint256 public numOfDonors;

    // Mappings
    mapping(address => uint256) public donations; // Track how much each address donated
    mapping(uint256 => address) private donorsList; // List of donors by index
    mapping(address => bool) private isDonor; // Check if address is a donor

    // Events
    event FundReceived(
        address indexed donor,
        uint256 amount,
        uint256 timestamp
    );
    event FundsWithdrawn(
        address indexed owner,
        uint256 amount,
        uint256 timestamp
    );
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier validAmount() {
        require(msg.value > 0, "Amount must be greater than 0");
        _;
    }

    // Constructor
    constructor() {
        owner = msg.sender; // Initially, factory is owner
        totalFunds = 0;
        numOfDonors = 0;
    }

    // Receive function - allows contract to receive ETH
    receive() external payable {
        donate();
    }

    // Fallback function
    fallback() external payable {
        donate();
    }

    // Donate function - anyone can donate to the fund
    function donate() public payable validAmount {
        address donor = msg.sender;
        uint256 amount = msg.value;

        // If this is a new donor, add to donors list
        if (!isDonor[donor]) {
            donorsList[numOfDonors] = donor;
            isDonor[donor] = true;
            numOfDonors++;
        }

        // Update donation amount
        donations[donor] += amount;
        totalFunds += amount;

        // Emit event
        emit FundReceived(donor, amount, block.timestamp);
    }

    // Withdraw function - only owner can withdraw
    function withdraw(uint256 amount) external onlyOwner {
        require(amount > 0, "Withdrawal amount must be greater than 0");
        require(
            amount <= address(this).balance,
            "Insufficient contract balance"
        );

        totalFunds -= amount;

        // Transfer funds to owner
        payable(owner).transfer(amount);

        // Emit event
        emit FundsWithdrawn(owner, amount, block.timestamp);
    }

    // Withdraw all funds - only owner can withdraw everything
    function withdrawAll() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        totalFunds = 0;

        // Transfer all funds to owner
        payable(owner).transfer(balance);

        // Emit event
        emit FundsWithdrawn(owner, balance, block.timestamp);
    }

    // View functions

    // Get contract balance
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Get donation amount by specific address
    function getDonationByAddress(
        address donor
    ) external view returns (uint256) {
        return donations[donor];
    }

    // Get donor address by index
    function getDonorByIndex(uint256 index) external view returns (address) {
        require(index < numOfDonors, "Index out of bounds");
        return donorsList[index];
    }

    // Get all donors with their donation amounts
    function getAllDonors()
        external
        view
        returns (address[] memory, uint256[] memory)
    {
        address[] memory donors = new address[](numOfDonors);
        uint256[] memory amounts = new uint256[](numOfDonors);

        for (uint256 i = 0; i < numOfDonors; i++) {
            address donor = donorsList[i];
            donors[i] = donor;
            amounts[i] = donations[donor];
        }

        return (donors, amounts);
    }

    // Get fund statistics
    function getFundStats()
        external
        view
        returns (
            address fundOwner,
            uint256 contractBalance,
            uint256 totalDonated,
            uint256 totalDonors
        )
    {
        return (owner, address(this).balance, totalFunds, numOfDonors);
    }

    // Check if address is a donor
    function checkIsDonor(address addr) external view returns (bool) {
        return isDonor[addr];
    }

    // Owner management functions

    // Transfer ownership to new address (only current owner)
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        require(
            newOwner != owner,
            "New owner must be different from current owner"
        );

        address previousOwner = owner;
        owner = newOwner;

        emit OwnershipTransferred(previousOwner, newOwner);
    }

    // Renounce ownership (only current owner) - makes contract ownerless
    function renounceOwnership() external onlyOwner {
        address previousOwner = owner;
        owner = address(0);

        emit OwnershipTransferred(previousOwner, address(0));
    }
}
