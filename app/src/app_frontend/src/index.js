import "./style.css";

import { createActor, app_backend } from "../../declarations/app_backend";
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";

import { ethers } from "ethers";
const crypto = require("crypto");

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
let pubkey;

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
  const pubkeyRes = await actor.public_key();
  pubkey = pubkeyRes.Ok.public_key_hex;
  console.log("pubkey", pubkey);
  // const publicKey = new Uint8Array(Buffer.from(pubkey, "hex"));

  document.getElementById("principle").innerText = principle;
  document.getElementById("pubkey").innerText = pubkey;
  document.getElementById("address").innerText = ethers.utils.computeAddress(`0x${pubkey}`);

  // Signature test for debug
  const message = "message";
  const signRes = await actor.sign(message);
  const signature = signRes.Ok.signature_hex;
  console.log("signature", signature);
  const splitedSignature = ethers.utils.splitSignature(Buffer.from(signature, "hex"));
  console.log("splitedSignature", splitedSignature);
  const recoveredPublicKey = ethers.utils.recoverPublicKey(
    crypto.createHash("sha256").update(message, "utf-8").digest(),
    splitedSignature
  );
  console.log("recoveredPublicKey", recoveredPublicKey);
  const recoveredAddress = ethers.utils.computeAddress(recoveredPublicKey);
  console.log("recoveredAddress", recoveredAddress);

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
