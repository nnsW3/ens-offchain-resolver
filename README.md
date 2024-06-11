# ENS Offchain Resolver

![CI](https://github.com/ensdomains/offchain-resolver/actions/workflows/main.yml/badge.svg)

This repository contains smart contracts and a node.js gateway server that together allow hosting ENS names offchain using [EIP 3668](https://eips.ethereum.org/EIPS/eip-3668) and [ENSIP 10](https://docs.ens.domains/ens-improvement-proposals/ensip-10-wildcard-resolution).

## Overview

ENS resolution requests to the resolver implemented in this repository are responded to with a directive to query a gateway server for the answer. The gateway server generates and signs a response, which is sent back to the original resolver for decoding and verification. Full details of this request flow can be found in EIP 3668.

All of this happens transparently in supported clients (such as ethers.js with the ethers-ccip-read-provider plugin, or future versions of ethers.js which will have this functionality built-in).

## [Gateway Server](packages/gateway)

The gateway server implements CCIP Read (EIP 3668), and answers requests by looking up the names in a backing store. By default this is a JSON file, but the backend is pluggable and alternate backends can be provided by implementing a simple interface. Once a record is retrieved, it is signed using a user-provided key to assert its validity, and both record and signature are returned to the caller so they can be provided to the contract that initiated the request.

## [Contracts](packages/contracts)

The smart contract provides a resolver stub that implement CCIP Read (EIP 3668) and ENS wildcard resolution (ENSIP 10). When queried for a name, it directs the client to query the gateway server. When called back with the gateway server response, the resolver verifies the signature was produced by an authorised signer, and returns the response to the client.

## Trying it Out (Local)

Start by generating an Ethereum private key; this will be used as a signing key for any messages signed by your gateway service. You can use a variety of tools for this; for instance, this Python snippet will generate one for you:

```
python3 -c "import os; import binascii; print('0x%s' % binascii.hexlify(os.urandom(32)).decode('utf-8'))"
```

First, install dependencies and build all packages:

```bash
yarn && yarn build
```

[Follow here](https://github.com/ensdomains/offchain-resolver/blob/main/packages/gateway/README.md) to run the gateway locally. ( Skip this step if using a deployed gateway )
<br/><br/>

Take a look at the data in `test.eth.json` under `packages/gateway/`; it specifies addresses for the name `martinet.zircut.com` and the wildcard `*.zircut.com`.

Next, edit `packages/contracts/hardhat.config.js`; replacing the address on `line 65` with the private key you generated above. Be sure to add the `privatekey://` prefix.

Then, in a new terminal, build and run a test node with an ENS registry and the offchain resolver deployed:

```bash
# If local gateway will be used for testing
yarn start:node

# If deployed app will be used as gateway set the environment variable for the contracts to use
export REMOTE_GATEWAY=https://{{app-sub-domain}}.herokuapp.com
yarn start:node
```

You will see output similar to the following:

```
Compilation finished successfully
deploying "ENSRegistry" (tx: 0x8b353610592763c0abd8b06305e9e82c1b14afeecac99b1ce1ee54f5271baa2c)...: deployed at 0x5FbDB2315678afecb367f032d93F642f64180aa3 with 1084532 gas
deploying "OffchainResolver" (tx: 0xdb3142c2c4d214b58378a5261859a7f104908a38b4b9911bb75f8f21aa28e896)...: deployed at 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 with 1533637 gas
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:9545/

Accounts
========

WARNING: These accounts, and their private keys, are publicly known.
Any funds sent to them on Mainnet or any other live network WILL BE LOST.

Account #0: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

(truncated for brevity)
```

Take note of the address to which the ENSRegistry was deployed (0x5FbDB...).

Finally, in a third terminal, run the example client to demonstrate resolving a name:

```
yarn start:client --registry 0x5FbDB2315678afecb367f032d93F642f64180aa3 test.eth
yarn start:client --registry 0x5FbDB2315678afecb367f032d93F642f64180aa3 foo.test.eth
```

You should see outputs similar to the following:

```
$ yarn start:client --registry 0x5FbDB2315678afecb367f032d93F642f64180aa3 test.eth
yarn run v1.22.17
$ node packages/client/dist/index.js --registry 0x5FbDB2315678afecb367f032d93F642f64180aa3 test.eth
resolver address 0x8464135c8F25Da09e49BC8782676a84730C318bC
eth address 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
content null
email test@example.com
Done in 0.28s.
```

Check these addresses against the chosen gateway test db json file and you will see that they match.

## Deploying to Production

### Parts to Deploy

- Generate a private key for the flow and secure it appropriately.
- Deploy the gateway and take note of the Gateway URL.
  - Ensure the DATA and PRIVATE_KEY environment variables are set as described in the [Gateway README](packages/gateway/README.md).
- Set the Gateway URL in [hardhat.config.js](packages/contracts/hardhat.config.js).
- Deploy/Verify the [resolver smart contract](packages/contracts).
  - Ensure all the environment variables are set as described in the [Contracts README](packages/contracts/README.md).
  ```
  # Deploy Contract
  npx hardhat deploy --network <network>

  # Verify contract
  npx hardhat verify --constructor-args ./arguments.js --network <network> <deployed contract address>
  ```

- Update the resolver in the ENS profile page for the root domain to point to the deployed contract.

## Testing in the Wild

Once all the parts are deployed and the resolver contract is associated to the ENS profile, your [ENS Domain](https://app.ens.domains/) should be able to resolve with your address.

### Manual Testing

Another way we can test the workflow is to leverage the [test script](packages/contracts/postDeploymentTest/TestResolve.js). This script is basically a very simple client that 
knows how to interact with contract and gateway using the CCIP Read Protocol. You can use this script to try and debug specific aspects of the process. A sample input is as follows:

```
node TestResolve.js martinet.zircut.com
```