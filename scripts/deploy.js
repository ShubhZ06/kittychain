const hre = require("hardhat");

async function main() {
  console.log("Deploying KittyParty to Monad Testnet...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "MON");

  const KittyParty = await hre.ethers.getContractFactory("KittyParty");
  const kittyParty = await KittyParty.deploy();

  await kittyParty.waitForDeployment();

  const address = await kittyParty.getAddress();
  console.log("✅ KittyParty deployed to:", address);
  console.log("🔗 Explorer: https://testnet.monadexplorer.com/address/" + address);

  // Save ABI + address for frontend
  const fs = require("fs");
  const artifact = await hre.artifacts.readArtifact("KittyParty");

  const deploymentInfo = {
    address,
    abi: artifact.abi,
    network: "monad-testnet",
    chainId: 10143,
    deployedAt: new Date().toISOString(),
  };

  fs.mkdirSync("./src/contracts", { recursive: true });
  fs.writeFileSync(
    "./src/contracts/KittyParty.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("📄 ABI + address saved to src/contracts/KittyParty.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
