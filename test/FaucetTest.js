const Faucet = artifacts.require("Faucet");
const FaucetFactory = artifacts.require("FaucetFactory");
const { expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");

contract("Faucet", (accounts) => {
  let faucet;
  const owner = accounts[0];
  const donor1 = accounts[1];
  const donor2 = accounts[2];
  const nonOwner = accounts[3];

  beforeEach(async () => {
    faucet = await Faucet.new({ from: owner });
  });

  describe("Deployment", () => {
    it("should set the deployer as owner", async () => {
      const contractOwner = await faucet.owner();
      assert.equal(contractOwner, owner, "Owner should be the deployer");
    });

    it("should initialize with zero balance and donors", async () => {
      const balance = await faucet.getContractBalance();
      const totalDonors = await faucet.numOfDonors();

      assert.equal(balance.toString(), "0", "Initial balance should be 0");
      assert.equal(totalDonors.toString(), "0", "Initial donors should be 0");
    });
  });

  describe("Donations", () => {
    it("should accept donations and update donor info", async () => {
      const donationAmount = web3.utils.toWei("1", "ether");

      const receipt = await faucet.donate({
        from: donor1,
        value: donationAmount,
      });

      // Check if event was emitted
      expectEvent(receipt, "FundReceived", {
        donor: donor1,
        amount: donationAmount,
      });

      // Check donor information
      const donation = await faucet.getDonationByAddress(donor1);
      const isDonor = await faucet.checkIsDonor(donor1);
      const numDonors = await faucet.numOfDonors();

      assert.equal(
        donation.toString(),
        donationAmount,
        "Donation amount should be recorded"
      );
      assert.equal(isDonor, true, "Address should be marked as donor");
      assert.equal(numDonors.toString(), "1", "Number of donors should be 1");
    });

    it("should accumulate donations from same donor", async () => {
      const firstDonation = web3.utils.toWei("1", "ether");
      const secondDonation = web3.utils.toWei("0.5", "ether");

      await faucet.donate({ from: donor1, value: firstDonation });
      await faucet.donate({ from: donor1, value: secondDonation });

      const totalDonation = await faucet.getDonationByAddress(donor1);
      const expectedTotal = web3.utils.toWei("1.5", "ether");

      assert.equal(
        totalDonation.toString(),
        expectedTotal,
        "Should accumulate donations"
      );
    });

    it("should track multiple donors", async () => {
      await faucet.donate({
        from: donor1,
        value: web3.utils.toWei("1", "ether"),
      });
      await faucet.donate({
        from: donor2,
        value: web3.utils.toWei("2", "ether"),
      });

      const numDonors = await faucet.numOfDonors();
      const donor1Amount = await faucet.getDonationByAddress(donor1);
      const donor2Amount = await faucet.getDonationByAddress(donor2);

      assert.equal(numDonors.toString(), "2", "Should have 2 donors");
      assert.equal(
        donor1Amount.toString(),
        web3.utils.toWei("1", "ether"),
        "Donor1 amount should be correct"
      );
      assert.equal(
        donor2Amount.toString(),
        web3.utils.toWei("2", "ether"),
        "Donor2 amount should be correct"
      );
    });

    it("should reject zero value donations", async () => {
      await expectRevert(
        faucet.donate({ from: donor1, value: "0" }),
        "Amount must be greater than 0"
      );
    });
  });

  describe("Withdrawals", () => {
    beforeEach(async () => {
      // Add some funds to contract
      await faucet.donate({
        from: donor1,
        value: web3.utils.toWei("5", "ether"),
      });
    });

    it("should allow owner to withdraw funds", async () => {
      const withdrawAmount = web3.utils.toWei("2", "ether");
      const initialOwnerBalance = await web3.eth.getBalance(owner);

      const receipt = await faucet.withdraw(withdrawAmount, { from: owner });

      // Check if event was emitted
      expectEvent(receipt, "FundsWithdrawn", {
        owner: owner,
        amount: withdrawAmount,
      });

      const contractBalance = await faucet.getContractBalance();
      const expectedBalance = web3.utils.toWei("3", "ether");

      assert.equal(
        contractBalance.toString(),
        expectedBalance,
        "Contract balance should be reduced"
      );
    });

    it("should allow owner to withdraw all funds", async () => {
      const receipt = await faucet.withdrawAll({ from: owner });

      const contractBalance = await faucet.getContractBalance();
      assert.equal(
        contractBalance.toString(),
        "0",
        "Contract should have zero balance"
      );
    });

    it("should reject withdrawals from non-owner", async () => {
      await expectRevert(
        faucet.withdraw(web3.utils.toWei("1", "ether"), { from: nonOwner }),
        "Only owner can call this function"
      );
    });

    it("should reject withdrawal of more than available balance", async () => {
      await expectRevert(
        faucet.withdraw(web3.utils.toWei("10", "ether"), { from: owner }),
        "Insufficient contract balance"
      );
    });
  });

  describe("View Functions", () => {
    beforeEach(async () => {
      await faucet.donate({
        from: donor1,
        value: web3.utils.toWei("1", "ether"),
      });
      await faucet.donate({
        from: donor2,
        value: web3.utils.toWei("2", "ether"),
      });
    });

    it("should return all donors and amounts", async () => {
      const result = await faucet.getAllDonors();
      const donors = result[0];
      const amounts = result[1];

      assert.equal(donors.length, 2, "Should return 2 donors");
      assert.equal(donors[0], donor1, "First donor should be correct");
      assert.equal(donors[1], donor2, "Second donor should be correct");
      assert.equal(
        amounts[0].toString(),
        web3.utils.toWei("1", "ether"),
        "First amount should be correct"
      );
      assert.equal(
        amounts[1].toString(),
        web3.utils.toWei("2", "ether"),
        "Second amount should be correct"
      );
    });

    it("should return fund statistics", async () => {
      const stats = await faucet.getFundStats();

      assert.equal(stats.fundOwner, owner, "Owner should be correct");
      assert.equal(
        stats.contractBalance.toString(),
        web3.utils.toWei("3", "ether"),
        "Balance should be correct"
      );
      assert.equal(
        stats.totalDonated.toString(),
        web3.utils.toWei("3", "ether"),
        "Total donated should be correct"
      );
      assert.equal(
        stats.totalDonors.toString(),
        "2",
        "Total donors should be correct"
      );
    });
  });

  describe("Ownership", () => {
    it("should allow owner to transfer ownership", async () => {
      const receipt = await faucet.transferOwnership(nonOwner, { from: owner });

      expectEvent(receipt, "OwnershipTransferred", {
        previousOwner: owner,
        newOwner: nonOwner,
      });

      const newOwner = await faucet.owner();
      assert.equal(newOwner, nonOwner, "Ownership should be transferred");
    });

    it("should reject ownership transfer from non-owner", async () => {
      await expectRevert(
        faucet.transferOwnership(nonOwner, { from: donor1 }),
        "Only owner can call this function"
      );
    });
  });
});

contract("FaucetFactory", (accounts) => {
  let factory;
  const owner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];

  beforeEach(async () => {
    factory = await FaucetFactory.new({ from: owner });
  });

  describe("Faucet Creation", () => {
    it("should create new faucet contracts", async () => {
      const receipt = await factory.createFaucet({ from: user1 });

      // Check if event was emitted
      expectEvent(receipt, "FaucetCreated");

      const totalFaucets = await factory.getTotalFaucets();
      assert.equal(totalFaucets.toString(), "1", "Should have 1 faucet");

      const userFaucets = await factory.getFaucetsByOwner(user1);
      assert.equal(userFaucets.length, 1, "User should have 1 faucet");
    });

    it("should allow multiple users to create faucets", async () => {
      await factory.createFaucet({ from: user1 });
      await factory.createFaucet({ from: user2 });
      await factory.createFaucet({ from: user1 }); // user1 creates another

      const totalFaucets = await factory.getTotalFaucets();
      const user1Faucets = await factory.getFaucetsByOwner(user1);
      const user2Faucets = await factory.getFaucetsByOwner(user2);

      assert.equal(totalFaucets.toString(), "3", "Should have 3 total faucets");
      assert.equal(user1Faucets.length, 2, "User1 should have 2 faucets");
      assert.equal(user2Faucets.length, 1, "User2 should have 1 faucet");
    });

    it("should set correct ownership for created faucets", async () => {
      await factory.createFaucet({ from: user1 });

      const userFaucets = await factory.getFaucetsByOwner(user1);
      const faucetAddress = userFaucets[0];

      const faucet = await Faucet.at(faucetAddress);
      const faucetOwner = await faucet.owner();

      assert.equal(faucetOwner, user1, "Faucet owner should be the creator");
    });
  });
});
