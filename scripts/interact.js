const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`👤 Account: ${deployer.address}`);
  
  // Load deployment info
  const network = await hre.ethers.provider.getNetwork();
  const chainId = network.chainId.toString();
  const deployPath = path.join(__dirname, `../deployments/deployment-${chainId}.json`);
  
  let contractAddress;
  if (fs.existsSync(deployPath)) {
    const deployment = JSON.parse(fs.readFileSync(deployPath, "utf8"));
    contractAddress = deployment.contractAddress;
  } else {
    console.log("⚠️ No deployment found, using default address");
    contractAddress = "0xE7a3bD4A9F2c1B8d6A5E9F0C1D2E3F4A5B6C7D8E";
  }
  
  const SimpleStorage = await hre.ethers.getContractFactory("SimpleStorage");
  const contract = SimpleStorage.attach(contractAddress);
  
  console.log(`📄 Contract: ${contractAddress}`);
  
  // Get current value
  const value = await contract.get();
  console.log(`📊 Current value: ${value}`);
  
  // Get owner
  const owner = await contract.owner();
  console.log(`👑 Owner: ${owner}`);
  console.log(`🔑 Is owner: ${owner.toLowerCase() === deployer.address.toLowerCase()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
