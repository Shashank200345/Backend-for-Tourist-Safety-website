const hre = require("hardhat");
const path = require("path");

async function main() {
  console.log("🚀 Deploying TouristIdentity contract...\n");

  // Get the contract factory
  const TouristIdentity = await hre.ethers.getContractFactory("TouristIdentity");

  // Deploy the contract
  console.log("⏳ Deploying...");
  const touristIdentity = await TouristIdentity.deploy();

  // Wait for deployment to complete
  await touristIdentity.waitForDeployment();

  const contractAddress = await touristIdentity.getAddress();
  const owner = await touristIdentity.owner();
  const network = hre.network.name;

  console.log("\n✅ Contract deployed successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Contract Address:", contractAddress);
  console.log("Owner Address:", owner);
  console.log("Network:", network);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Verify contract (for testnets/mainnet)
  if (network !== "localhost" && network !== "hardhat") {
    console.log("⏳ Waiting for block confirmations...");
    await touristIdentity.deploymentTransaction().wait(5);

    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan/Polygonscan");
    } catch (error) {
      console.log("⚠️  Verification failed:", error.message);
      console.log("   You can verify manually later using:");
      console.log(`   npx hardhat verify --network ${network} ${contractAddress}`);
    }
  }

  console.log("\n📝 Next steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Update CONTRACT_ADDRESS in your backend .env file:");
  console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
  console.log("3. If using localhost, copy a private key from Hardhat node output");
  console.log("4. Restart your backend server\n");

  // Save deployment info to file for easy reference
  const fs = require("fs");
  const deploymentInfo = {
    contractAddress,
    owner,
    network,
    timestamp: new Date().toISOString(),
  };
  
  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("💾 Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

  // Auto-update backend .env file
  try {
    const backendEnvPath = path.join(__dirname, "../../.env");
    if (fs.existsSync(backendEnvPath)) {
      let envContent = fs.readFileSync(backendEnvPath, "utf8");
      
      // Update CONTRACT_ADDRESS
      if (envContent.includes("CONTRACT_ADDRESS=")) {
        envContent = envContent.replace(
          /CONTRACT_ADDRESS=.*/g,
          `CONTRACT_ADDRESS=${contractAddress}`
        );
      } else {
        envContent += `\nCONTRACT_ADDRESS=${contractAddress}\n`;
      }

      // Update BLOCKCHAIN_NETWORK
      if (envContent.includes("BLOCKCHAIN_NETWORK=")) {
        envContent = envContent.replace(
          /BLOCKCHAIN_NETWORK=.*/g,
          `BLOCKCHAIN_NETWORK=${network}`
        );
      } else {
        envContent += `BLOCKCHAIN_NETWORK=${network}\n`;
      }

      // For localhost, ensure RPC URL and private key are set
      if (network === "localhost") {
        if (!envContent.includes("BLOCKCHAIN_RPC_URL=")) {
          envContent += `BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545\n`;
        }
        if (!envContent.includes("PRIVATE_KEY=")) {
          envContent += `PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80\n`;
        }
      }

      fs.writeFileSync(backendEnvPath, envContent);
      console.log("✅ Backend .env automatically updated!");
    } else {
      console.log("⚠️  Backend .env not found, skipping auto-update");
    }
  } catch (error) {
    console.log("⚠️  Could not auto-update .env:", error.message);
  }

