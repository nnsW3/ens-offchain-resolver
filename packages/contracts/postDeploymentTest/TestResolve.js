const { ethers } = require("hardhat");
const { dnsName } = require("../utils");
const {
  abi,
} = require("../artifacts/contracts/OffchainResolver.sol/OffchainResolver.json");
const {
  abi: officialResolverAbi,
} = require("@ensdomains/ens-contracts/artifacts/contracts/resolvers/Resolver.sol/Resolver.json");

const provider = new ethers.providers.AlchemyProvider(
  "mainnet",
  process.env.ETH_ALCHEMY_KEY
);

const main = async () => {
  // need to update the address of the resolver contract
  const resolver = new ethers.Contract(
    "0xDE70A11f68bc27C5cf10782810e268F673Dd71EC",
    abi,
    provider
  );

  // Step 1: Resolve the address of the resolver for the domain "martinet.zircut.com"

  const Resolver = new ethers.utils.Interface(officialResolverAbi);
  const callData = Resolver.encodeFunctionData("addr(bytes32)", [
    ethers.utils.namehash("martinet.zircut.com"),
  ]);
  const name = dnsName("martinet.zircut.com");
  await resolver.resolve(name, callData);

  // Step 3: Retrieve the result data from the look up serive, and call the resolveWithProof function
  // result is the data retrieved from the look up service
  const result =
    "0x00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000066673ed100000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000009e26861dce32610e34bd4db390494c32d5c805a10000000000000000000000000000000000000000000000000000000000000040d546fe0506fc126c377e625212a72087cc91226b376597b5921dabd88b0cbc479f87604b211534f6efe0a1cc5fd65d868429b6e897cabbed753d772332463a1f";
  // extraData is the extra data that is passed to the resolveWithProof function
  const extraData =
    "0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000de70a11f68bc27c5cf10782810e268f673dd71ec00000000000000000000000000000000000000000000000000000000000000e49061b923000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000015086d617274696e6574067a697263757403636f6d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000243b3b57deb137e0f85e8cca12f12c0262f470bcd280c973131d828626c9522757da3d7fd40000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
  const resultData = await resolver.resolveWithProof(result, extraData);
  console.log("result data:", resultData);
};

main();
