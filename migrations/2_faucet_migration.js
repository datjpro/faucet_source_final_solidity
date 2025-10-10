const Faucet = artifacts.require("Faucet");
const FaucetFactory = artifacts.require("FaucetFactory");

module.exports = function (deployer) {
  // Deploy Faucet contract first
  deployer.deploy(Faucet).then(() => {
    // Then deploy FaucetFactory
    return deployer.deploy(FaucetFactory);
  });
};
