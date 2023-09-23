import "./style.css";

import { createActor, app_backend } from "../../declarations/app_backend";
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";

import { ethers } from "ethers";

import { SimpleAccountAPI, HttpRpcClient } from "@account-abstraction/sdk";
export const ENTRY_POINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
export const SIMPLE_ACCOUNT_FACTORY_ADDRESS = "0x9406Cc6185a346906296840746125a0E44976454";

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

// Auth
let isLoggedIn = false; // This should be dynamically set based on actual user login status
document.getElementById("heroSection").style.display = isLoggedIn ? "none" : "block";
document.getElementById("formSection").style.display = isLoggedIn ? "block" : "none";

// ICP
let actor = app_backend;

let principle;
let publicKey;
let computedAddress;
let accountAbstractionAddress;

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
        const signRes = await actor.sign(message);
        const signature = signRes.Ok.signature_hex;
        const splitedSignature = ethers.utils.splitSignature(Buffer.from(signature, "hex"));
        const recoveredPublicKey = ethers.utils.recoverPublicKey(messageHashBytes, splitedSignature);
        const recoveredAddress = ethers.utils.computeAddress(recoveredPublicKey);
        if (recoveredAddress === computedAddress) {
          console.log("Address check is true.");
          return splitedSignature;
        }
        if (i < 99) {
          console.log("Retrying...", i + 1);
        }
      }
      console.error("Address check failed after 100 attempts.");
    },
  };

  // debug
  // const message = "message";
  // const messageHash = ethers.utils.hashMessage(message);
  // console.log("messageHash", messageHash);
  // const messageHashBytes = ethers.utils.arrayify(messageHash);
  // console.log("messageHashBytes", messageHashBytes);
  // await owner.signMessage(messageHashBytes);

  const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth_goerli");
  const walletAPI = new SimpleAccountAPI({
    provider,
    entryPointAddress: ENTRY_POINT_ADDRESS,
    owner,
    factoryAddress: SIMPLE_ACCOUNT_FACTORY_ADDRESS,
  });

  accountAbstractionAddress = await walletAPI.getAccountAddress();

  document.getElementById("principle").innerText = principle;
  document.getElementById("publicKey").innerText = publicKey;
  document.getElementById("computedAddress").innerText = computedAddress;
  document.getElementById("accountAbstractionAddress").innerText = accountAbstractionAddress;

  isLoggedIn = true;
  document.getElementById("heroSection").style.display = isLoggedIn ? "none" : "block";
  document.getElementById("formSection").style.display = isLoggedIn ? "block" : "none";

  hideLoader();
  return false;
};

const sendButton = document.getElementById("send");
sendButton.onclick = async (e) => {
  showModal();
  return false;
};
