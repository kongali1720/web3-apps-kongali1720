const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying SimpleStorage contract...");
  
  const SimpleStorage = await hre.ethers.getContractFactory("SimpleStorage");
  const simpleStorage = await SimpleStorage.deploy();
  
  await simpleStorage.waitForDeployment();
  
  const address = await simpleStorage.getAddress();
  console.log(`✅ SimpleStorage deployed to: ${address}`);
  
  // Save contract address to file
  const deployPath = path.join(__dirname, "../deployments");
  
  if (!fs.existsSync(deployPath)) {
    fs.mkdirSync(deployPath, { recursive: true });
  }
  
  const network = await hre.ethers.provider.getNetwork();
  const chainId = network.chainId.toString();
  
  const deploymentInfo = {
    contractAddress: address,
    chainId: chainId,
    deployedAt: new Date().toISOString(),
    network: hre.network.name
  };
  
  fs.writeFileSync(
    path.join(deployPath, `deployment-${chainId}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`📝 Deployment info saved to deployments/deployment-${chainId}.json`);
  console.log(`📝 Contract Address: ${address}`);
  
  // Verify on Etherscan (hanya untuk testnet/mainnet)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("⏳ Waiting for block confirmations...");
    await simpleStorage.deploymentTransaction().wait(5);
    
    console.log("🔍 Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified!");
    } catch (e) {
      console.log("⚠️ Verification skipped:", e.message);
    }
  }
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
