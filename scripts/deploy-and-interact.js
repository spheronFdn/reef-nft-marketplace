const hre = require("hardhat");

async function main() {
  // define your testnet_account in hardhat.config.js
  const testnetAccount = await hre.reef.getSignerByName("testnet_account");
  console.log("here");
  await testnetAccount.claimDefaultAccount();
  const NFTMarket = await hre.reef.getContractFactory(
    "Marketplace",
    testnetAccount
  );
  const nftMarketPlace = await NFTMarket.deploy();
  const marketPlaceAddress = nftMarketPlace.address;
  console.log("Marketplace deployed");

  const NFTContract = await hre.reef.getContractFactory(
    "CinemaNFT",
    testnetAccount
  );
  const nftContract = await NFTContract.deploy(marketPlaceAddress);
  const contractAddress = nftContract.address;
  console.log("NFT Contract deployed");

  console.log({
    nftMarketPlace: marketPlaceAddress,
    nftContract: contractAddress,
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
