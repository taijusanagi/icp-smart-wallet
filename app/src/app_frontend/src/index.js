import "./style.css";

import { createActor, app_backend } from "../../declarations/app_backend";
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";

let actor = app_backend;

const pubkeyButton = document.getElementById("pubkey");
pubkeyButton.onclick = async (e) => {
  e.preventDefault();

  pubkeyButton.setAttribute("disabled", true);

  // Interact with backend actor, calling the greet method
  const pubkey = await actor.public_key();
  console.log(pubkey);
  pubkeyButton.removeAttribute("disabled");

  document.getElementById("greeting").innerText = pubkey.Ok.public_key_hex;

  return false;
};

const greetButton = document.getElementById("greet");
greetButton.onclick = async (e) => {
  e.preventDefault();

  greetButton.setAttribute("disabled", true);

  // Interact with backend actor, calling the greet method
  const greeting = await actor.greet();

  greetButton.removeAttribute("disabled");

  document.getElementById("greeting").innerText = greeting;

  return false;
};

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

  return false;
};
