import contract from "@truffle/contract";

export const loadContract = async (name, provider) => {
  try {
    const res = await fetch(`/contracts/${name}.json`);
    if (!res.ok) {
      throw new Error(`Contract artifact not found: ${name}.json`);
    }

    const Artifact = await res.json();
    console.log("Contract artifact loaded:", Artifact);

    const _contract = contract(Artifact);
    _contract.setProvider(provider);

    // Kiểm tra xem contract có được deploy trên network này không
    const networkId = await _contract.web3.eth.net.getId();
    console.log("Current network ID:", networkId);
    console.log(
      "Available networks in artifact:",
      Object.keys(Artifact.networks || {})
    );

    if (!Artifact.networks || !Artifact.networks[networkId]) {
      throw new Error(
        `Contract not deployed on network ${networkId}. Available networks: ${Object.keys(Artifact.networks || {}).join(", ")}`
      );
    }

    const deployedContract = await _contract.deployed();
    console.log("Contract deployed at:", deployedContract.address);

    return deployedContract;
  } catch (error) {
    console.error("Error loading contract:", error);
    throw error;
  }
};
