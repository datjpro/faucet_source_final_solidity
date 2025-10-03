module.exports = {
  contracts_build_directory: "./public/contracts",
  networks: {
    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 7546, // Your Ganache port
      network_id: "*", // Any network (default: none)
      gas: 6721975,
      gasPrice: 20000000000,
    },
  },
  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.21", // Default version for Faucet.sol
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        evmVersion: "istanbul", // Use older EVM version for compatibility
      },
    },
  },
  // VÌ cấu hình trên dễ gây nhầm lẫn, HÃY SỬ DỤNG PHIÊN BẢN CHUẨN sau:
};
