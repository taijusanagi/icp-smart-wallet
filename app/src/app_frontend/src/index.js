import "./style.css";

import { createActor, app_backend } from "../../declarations/app_backend";
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";

let actor = app_backend;

let isLoggedIn = false; // This should be dynamically set based on actual user login status
document.getElementById("heroSection").style.display = isLoggedIn ? "none" : "block";
document.getElementById("formSection").style.display = isLoggedIn ? "block" : "none";

let principle;
let pubkey;

const loginButton = document.getElementById("login");
loginButton.onclick = async (e) => {
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
  pubkey = await actor.public_key();

  document.getElementById("principle").innerText = principle;
  document.getElementById("pubkey").innerText = pubkey.Ok.public_key_hex;

  isLoggedIn = true;
  document.getElementById("heroSection").style.display = isLoggedIn ? "none" : "block";
  document.getElementById("formSection").style.display = isLoggedIn ? "block" : "none";

  return false;
};
