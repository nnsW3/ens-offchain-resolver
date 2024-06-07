require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
require("dotenv").config();
require("@nomicfoundation/hardhat-verify");

const gatewayurl = `${process.env.GATEWAY_URL}/{sender}/{data}.json`;

let devgatewayurl = "http://localhost:8080/{sender}/{data}.json";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

module.exports = {
  solidity: "0.8.10",
  networks: {
    hardhat: {
      throwOnCallFailures: false,
      gatewayurl: devgatewayurl,
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.SEPOLIA_ALCHEMY_KEY}`,
      accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
      gatewayurl,
    },
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ETH_ALCHEMY_KEY}`,
      accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
      gatewayurl,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    signer: {
      default: process.env.SIGNER_ADDRESS,
    },
    deployer: {
      default: process.env.DEPLOYER_ADDRESS || 0,
    },
  },
};
