// Console interaction script for Faucet system
// Run with: truffle console --network development
// Then: exec('scripts/interact.js')

const Faucet = artifacts.require("Faucet");
const FaucetFactory = artifacts.require("FaucetFactory");

module.exports = async function (callback) {
  try {
    console.log("🚀 Starting Faucet System Interaction...\n");

    // Get accounts
    const accounts = await web3.eth.getAccounts();
    const [owner, user1, user2, user3] = accounts;

    console.log("📋 Available Accounts:");
    console.log("Owner:", owner);
    console.log("User1:", user1);
    console.log("User2:", user2);
    console.log("User3:", user3);
    console.log();

    // Get deployed factory
    const factory = await FaucetFactory.deployed();
    console.log("🏭 FaucetFactory deployed at:", factory.address);

    // Check initial state
    const initialFaucets = await factory.getTotalFaucets();
    console.log("📊 Initial number of faucets:", initialFaucets.toString());
    console.log();

    // Create first faucet by user1
    console.log("🎯 User1 creating first faucet...");
    const createTx1 = await factory.createFaucet({ from: user1 });
    console.log("✅ Faucet created. Transaction:", createTx1.tx);

    // Create second faucet by user2
    console.log("🎯 User2 creating second faucet...");
    const createTx2 = await factory.createFaucet({ from: user2 });
    console.log("✅ Faucet created. Transaction:", createTx2.tx);
    console.log();

    // Get all faucets
    const allFaucets = await factory.getAllFaucets();
    console.log("📋 All created faucets:", allFaucets);

    // Get faucets by owner
    const user1Faucets = await factory.getFaucetsByOwner(user1);
    const user2Faucets = await factory.getFaucetsByOwner(user2);
    console.log("👤 User1's faucets:", user1Faucets);
    console.log("👤 User2's faucets:", user2Faucets);
    console.log();

    // Interact with first faucet
    const faucet1Address = user1Faucets[0];
    const faucet1 = await Faucet.at(faucet1Address);

    console.log(`💰 Interacting with Faucet1 (${faucet1Address}):`);
    console.log("Owner:", await faucet1.owner());

    // Make donations to faucet1
    console.log("\n🎁 Making donations to Faucet1:");

    // User2 donates 1 ETH
    await faucet1.donate({
      from: user2,
      value: web3.utils.toWei("1", "ether"),
    });
    console.log("✅ User2 donated 1 ETH");

    // User3 donates 0.5 ETH
    await faucet1.donate({
      from: user3,
      value: web3.utils.toWei("0.5", "ether"),
    });
    console.log("✅ User3 donated 0.5 ETH");

    // User2 donates another 0.3 ETH
    await faucet1.donate({
      from: user2,
      value: web3.utils.toWei("0.3", "ether"),
    });
    console.log("✅ User2 donated additional 0.3 ETH");
    console.log();

    // Check faucet stats
    const stats = await faucet1.getFundStats();
    console.log("📊 Faucet1 Statistics:");
    console.log("- Owner:", stats.fundOwner);
    console.log(
      "- Contract Balance:",
      web3.utils.fromWei(stats.contractBalance, "ether"),
      "ETH"
    );
    console.log(
      "- Total Donated:",
      web3.utils.fromWei(stats.totalDonated, "ether"),
      "ETH"
    );
    console.log("- Total Donors:", stats.totalDonors.toString());
    console.log();

    // Get all donors and their contributions
    const donorsInfo = await faucet1.getAllDonors();
    const donors = donorsInfo[0];
    const amounts = donorsInfo[1];

    console.log("👥 Donor Information:");
    for (let i = 0; i < donors.length; i++) {
      const donorAddr = donors[i];
      const amount = web3.utils.fromWei(amounts[i], "ether");
      const donorName =
        donorAddr === user2
          ? "User2"
          : donorAddr === user3
            ? "User3"
            : "Unknown";
      console.log(`- ${donorName} (${donorAddr}): ${amount} ETH`);
    }
    console.log();

    // Owner withdraws some funds
    console.log("💸 Owner (User1) withdrawing 0.8 ETH...");
    const withdrawTx = await faucet1.withdraw(
      web3.utils.toWei("0.8", "ether"),
      { from: user1 }
    );
    console.log("✅ Withdrawal successful. Transaction:", withdrawTx.tx);

    // Check updated balance
    const newBalance = await faucet1.getContractBalance();
    console.log(
      "💰 New contract balance:",
      web3.utils.fromWei(newBalance, "ether"),
      "ETH"
    );
    console.log();

    // Interact with second faucet
    const faucet2Address = user2Faucets[0];
    const faucet2 = await Faucet.at(faucet2Address);

    console.log(`💰 Interacting with Faucet2 (${faucet2Address}):`);
    console.log("Owner:", await faucet2.owner());

    // User1 donates to User2's faucet
    await faucet2.donate({
      from: user1,
      value: web3.utils.toWei("2", "ether"),
    });
    console.log("✅ User1 donated 2 ETH to User2's faucet");

    // User3 also donates
    await faucet2.donate({
      from: user3,
      value: web3.utils.toWei("0.7", "ether"),
    });
    console.log("✅ User3 donated 0.7 ETH to User2's faucet");

    // Check faucet2 stats
    const stats2 = await faucet2.getFundStats();
    console.log("\n📊 Faucet2 Statistics:");
    console.log("- Owner:", stats2.fundOwner);
    console.log(
      "- Contract Balance:",
      web3.utils.fromWei(stats2.contractBalance, "ether"),
      "ETH"
    );
    console.log(
      "- Total Donated:",
      web3.utils.fromWei(stats2.totalDonated, "ether"),
      "ETH"
    );
    console.log("- Total Donors:", stats2.totalDonors.toString());
    console.log();

    // Final summary
    console.log("🎉 Summary:");
    console.log(
      "- Total Faucets Created:",
      (await factory.getTotalFaucets()).toString()
    );
    console.log(
      "- Faucet1 Balance:",
      web3.utils.fromWei(await faucet1.getContractBalance(), "ether"),
      "ETH"
    );
    console.log(
      "- Faucet2 Balance:",
      web3.utils.fromWei(await faucet2.getContractBalance(), "ether"),
      "ETH"
    );

    console.log("\n✨ Interaction completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
  }

  callback();
};
