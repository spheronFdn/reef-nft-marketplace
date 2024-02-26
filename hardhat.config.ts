require("dotenv").config();
require("@reef-chain/hardhat-reef");

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
//

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.13",
  defaultNetwork: "reef_testnet",
  networks: {
    reef: {
      url: "ws://127.0.0.1:9944",
    },
    reef_testnet: {
      url: "wss://rpc-testnet.reefscan.com/ws",
      scanUrl: "https://api-testnet.reefscan.info", // Localhost verification testing: http://localhost:3000
      seeds: {
        testnet_account: process.env.MNEMONIC_TESTNET || "",
      },
    },
    reef_mainnet: {
      url: "wss://rpc.reefscan.info/ws",
      scanUrl: "https://api.reefscan.info",
      seeds: {
        mainnet_account: process.env.MNEMONIC_MAINNET || "",
      },
    },
  },
};
