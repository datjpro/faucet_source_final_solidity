import Web3 from "web3";

export const loadContract = async (name, provider) => {
  try {
    const res = await fetch(`/contracts/${name}.json`);
    if (!res.ok) {
      throw new Error(`Contract artifact not found: ${name}.json`);
    }

    const Artifact = await res.json();
    console.log("Contract artifact loaded:", Artifact);

    const web3 = new Web3(provider);

    // Kiểm tra xem contract có được deploy trên network này không
    const networkId = await web3.eth.net.getId();
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

    const contractAddress = Artifact.networks[networkId].address;
    const contract = new web3.eth.Contract(Artifact.abi, contractAddress);
    
    console.log("Contract deployed at:", contractAddress);

    return contract;
  } catch (error) {
    console.error("Error loading contract:", error);
    throw error;
  }
};

// Load contract by address
export const loadContractAt = async (name, address, provider) => {
  try {
    const res = await fetch(`/contracts/${name}.json`);
    if (!res.ok) {
      throw new Error(`Contract artifact not found: ${name}.json`);
    }

    const Artifact = await res.json();
    const web3 = new Web3(provider);
    
    const contract = new web3.eth.Contract(Artifact.abi, address);
    console.log("Contract instance loaded at:", address);

    return contract;
  } catch (error) {
    console.error("Error loading contract at address:", error);
    throw error;
  }
};
