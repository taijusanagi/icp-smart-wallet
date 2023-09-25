import "./style.css";

import { createActor, app_backend } from "../../declarations/app_backend";
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";

import { ethers } from "ethers";

import { SimpleAccountAPI, HttpRpcClient } from "@account-abstraction/sdk";
const ENTRY_POINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const SIMPLE_ACCOUNT_FACTORY_ADDRESS = "0x9406Cc6185a346906296840746125a0E44976454";
const BUNDLER_URL = "https://api.stackup.sh/v1/node/c589455678a18f482e3ec75a2e226eeed6294e928c175558410543de304165c6";
const CHAIN_ID = 5;

import { Core } from "@walletconnect/core";
import { Web3Wallet } from "@walletconnect/web3wallet";

const SESSION_REQUEST_SEND_TRANSACTION = "eth_sendTransaction";
const SESSION_REQUEST_ETH_SIGN = "eth_sign";
const SESSION_REQUEST_PERSONAL_SIGN = "personal_sign";
const SESSION_REQUEST_ETH_SIGN_V4 = "eth_signTypedData_v4";
let web3wallet;
let topic;
let id;

let to;
let data;
let value;

// Loader
function showLoader() {
  document.getElementById("loader").style.display = "flex";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

function showModal() {
  document.getElementById("modal").style.display = "flex";
}

function hideModal() {
  document.getElementById("modal").style.display = "none";
}

// Auth
let isLoggedIn = false; // This should be dynamically set based on actual user login status
document.getElementById("heroSection").style.display = isLoggedIn ? "none" : "block";
document.getElementById("formSection").style.display = isLoggedIn ? "block" : "none";

// ICP
let actor = app_backend;

let principle;
let publicKey;
let computedAddress;
let walletAPI;
let accountAbstractionAddress;
let balance;

const loginButton = document.getElementById("login");
loginButton.onclick = async (e) => {
  showLoader();
  e.preventDefault();

  // create an auth client
  let authClient = await AuthClient.create();

  // start the login process and wait for it to finish
  await new Promise((resolve) => {
    authClient.login({
      identityProvider: process.env.II_URL,
      onSuccess: resolve,
    });
  });

  console.log("APP_BACKEND_CANISTER_ID", process.env.APP_BACKEND_CANISTER_ID);

  // At this point we're authenticated, and we can get the identity from the auth client:
  const identity = authClient.getIdentity();
  // Using the identity obtained from the auth client, we can create an agent to interact with the IC.
  const agent = new HttpAgent({ identity });
  // Using the interface description of our webapp, we create an actor that we use to call the service methods.
  actor = createActor(process.env.APP_BACKEND_CANISTER_ID, {
    agent,
  });

  principle = await actor.greet();
  const publicKeyRes = await actor.public_key();
  publicKey = `0x${publicKeyRes.Ok.public_key_hex}`;
  computedAddress = ethers.utils.computeAddress(publicKey);

  const owner = {
    getAddress: async () => computedAddress,
    signMessage: async (message) => {
      for (let i = 0; i < 100; i++) {
        const prefixedMessageHash = ethers.utils.hashMessage(message);
        const prefixedMessageHashBytes = ethers.utils.arrayify(prefixedMessageHash);
        const signRes = await actor.sign(prefixedMessageHashBytes);
        const signature = signRes.Ok.signature_hex;
        const splitedSignature = ethers.utils.splitSignature(Buffer.from(signature, "hex"));
        const recoveredPublicKey = ethers.utils.recoverPublicKey(prefixedMessageHashBytes, splitedSignature);
        const recoveredAddress = ethers.utils.computeAddress(recoveredPublicKey);
        if (recoveredAddress === computedAddress) {
          return `0x${signature}${splitedSignature.v.toString(16)}`;
        }
      }
      console.error("Address check failed after 100 attempts.");
    },
  };

  const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth_goerli");
  walletAPI = new SimpleAccountAPI({
    provider,
    entryPointAddress: ENTRY_POINT_ADDRESS,
    owner,
    factoryAddress: SIMPLE_ACCOUNT_FACTORY_ADDRESS,
  });
  accountAbstractionAddress = await walletAPI.getAccountAddress();
  walletAPI.accountAddress = accountAbstractionAddress;
  const bigNumberBalance = await provider.getBalance(accountAbstractionAddress);
  balance = ethers.utils.formatEther(bigNumberBalance);

  const metadata = {
    name: "ICP Smart Wallet",
    description: "Account Abstraction Wallet with Threshold ECDSA on ICP",
    url: "http://localhost:3000",
    icons: [],
  };
  const core = new Core({
    projectId: "cffe9608a02c00c7947b9afd9dacbc70",
  });
  web3wallet = await Web3Wallet.init({
    core,
    metadata,
  });
  web3wallet.on("session_proposal", async (proposal) => {
    const session = await web3wallet.approveSession({
      id: proposal.id,
      namespaces: {
        eip155: {
          chains: ["eip155:5"],
          methods: [
            SESSION_REQUEST_SEND_TRANSACTION,
            SESSION_REQUEST_ETH_SIGN,
            SESSION_REQUEST_PERSONAL_SIGN,
            SESSION_REQUEST_ETH_SIGN_V4,
          ],
          events: ["chainChanged", "accountsChanged"],
          accounts: [`eip155:5:${accountAbstractionAddress}`],
        },
      },
    });
    const isConnected = true;
    topic = session.topic;
    document.getElementById("notConnectedSection").style.display = isConnected ? "none" : "block";
    document.getElementById("connectedSection").style.display = isConnected ? "block" : "none";
  });
  web3wallet.on("session_request", async (request) => {
    if (request.params.request.method === "eth_sendTransaction") {
      id = request.id;
      to = request.params.request.params[0].to;
      data = request.params.request.params[0].data;
      value = request.params.request.params[0].value;
      document.getElementById("to").innerText = to;
      document.getElementById("data").innerText = data;
      document.getElementById("value").innerText = ethers.utils.formatEther(ethers.BigNumber.from(value)) + " ETH";
      document.getElementById("entryPoint").innerText = ENTRY_POINT_ADDRESS;
      document.getElementById("bundlerURL").innerText = BUNDLER_URL;
      showModal();
    } else {
      console.log("Not supported method", request.params.request.method);
    }
  });
  const sessions = await web3wallet.getActiveSessions();
  const isConnected = Object.keys(sessions).length > 0;
  if (isConnected) {
    topic = Object.keys(sessions)[0];
  }
  document.getElementById("notConnectedSection").style.display = isConnected ? "none" : "block";
  document.getElementById("connectedSection").style.display = isConnected ? "block" : "none";

  document.getElementById("principle").innerText = principle;
  document.getElementById("publicKey").innerText = publicKey;
  document.getElementById("computedAddress").innerText = computedAddress;
  document.getElementById("accountAbstractionAddress").innerText = accountAbstractionAddress;
  document.getElementById("balance").innerText = balance + " ETH";

  isLoggedIn = true;
  document.getElementById("heroSection").style.display = isLoggedIn ? "none" : "block";
  document.getElementById("formSection").style.display = isLoggedIn ? "block" : "none";

  hideLoader();
  return false;
};

const connectButton = document.getElementById("connect");
connectButton.onclick = async (e) => {
  await web3wallet.core.pairing.pair({
    uri: document.getElementById("url").value,
  });

  return false;
};

const disconnectButton = document.getElementById("disconnect");
disconnectButton.onclick = async (e) => {
  await web3wallet.disconnectSession({ topic });
  const isConnected = false;
  topic = "";
  document.getElementById("notConnectedSection").style.display = isConnected ? "none" : "block";
  document.getElementById("connectedSection").style.display = isConnected ? "block" : "none";
  return false;
};

const confirmButton = document.getElementById("confirm");
confirmButton.onclick = async (e) => {
  showLoader();
  try {
    const unsignedUserOp = await walletAPI.createUnsignedUserOp({
      target: to,
      data,
      value,
    });
    unsignedUserOp.preVerificationGas = 500000;
    const resolvedUnsignedUserOp = await ethers.utils.resolveProperties(unsignedUserOp);
    const signedUserOp = await walletAPI.signUserOp(resolvedUnsignedUserOp);
    const resolvedSignedUserOp = await ethers.utils.resolveProperties(signedUserOp);
    const httpRPCClient = new HttpRpcClient(BUNDLER_URL, ENTRY_POINT_ADDRESS, CHAIN_ID);
    const result = await httpRPCClient.sendUserOpToBundler(resolvedSignedUserOp);
    const response = { id, result, jsonrpc: "2.0" };
    await web3wallet.respondSessionRequest({ topic, response });
    console.log("result", result);
  } catch (e) {
    console.log(e);
  } finally {
    hideModal();
    hideLoader();
  }
};
