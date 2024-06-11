require("dotenv").config();

module.exports = [
  `${process.env.GATEWAY_URL}/{sender}/{data}.json`,
  [process.env.SIGNER_ADDRESS],
];
