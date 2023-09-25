# ICP Smart Wallet

Account Abstraction Wallet with Threshold ECDSA on ICP

![screen-1](./docs/screen-1.png)

## Live App

### Frontend

https://icp-smart-wallet.vercel.app/

### Backend

https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=difti-nqaaa-aaaam-abtua-cai

## Pitch Deck

https://docs.google.com/presentation/d/1wv1TmWFZgZKoA_dmFPBojh6jeQtdwUpE3RRmwsWI1Qc/edit?usp=sharing

## Video Demo

Coming Soon!

## Description

ICP Smart Wallet is a highly innovative, Account Abstraction Wallet developed to operate with Threshold ECDSA on the Internet Computer Protocol (ICP). It is designed to integrate seamlessly with on-chain wallets using Motoko-based Threshold ECDSA and Internet Identity, thereby offering users a smooth and secure experience. Moreover, the wallet incorporates EIP4331 Account Abstraction wallet infrastructure to enhance its functionality and interaction with diverse platforms.

## Benefit

ICP Smart Wallet stands out by providing a fully on-chain, networked-custody wallet within the Ethereum Account Abstraction ecosystem. The integration of advanced technologies ensures that users have a secure and streamlined experience when interacting with various dApps. The benefits of using ICP Smart Wallet include:

- Enhanced Security: The use of Threshold ECDSA and Internet Identity ensures top-notch security for user accounts and transactions.
- Universal Accessibility: Being browser-based, the wallet is accessible to a broad audience and isn’t restricted by app store licensing.
- Innovative Account Abstraction: The incorporation of EIP4331 account abstraction allows for advanced transaction capabilities and user interactions.

## Technical Detail

![technical-detail](./docs/technical-detail.png)

- ICP Smart Wallet connects through Wallet Connect V2 to interact with various dApps.
- ICP Smart Wallet utilizes Threshold ECDSA, which is implemented with Motoko for enhanced performance and security.
- ICP Smart Wallet integrates Internet Identity for secure and seamless user authentication.
- ICP Smart Wallet incorporates EIP4331 Account Abstraction, which enables the creation of Abstract Wallet Transactions.

## Roadmap

The ICP Smart Wallet aims to continuously evolve and adapt to the dynamic landscape of blockchain technology. Our roadmap reflects our vision for the future and our commitment to creating a robust and user-friendly platform. Here's a glimpse of our planned milestones:

### **1. Demo in Fully On-Chain with ICP Hackathon**

- **Objective**: Showcase the initial capabilities of the ICP Smart Wallet in a real-world setting and gather feedback from the community.

### **2. Publish Beta App**

- **Objective**: Launch a preliminary version of the ICP Smart Wallet to a limited audience for testing and further refinement.

### **3. Adding Functionality Like Multichain Support**

- **Objective**: Enhance the wallet's capabilities by supporting multiple blockchains, thus increasing interoperability and expanding the user base.

### **4. Develop More Account Abstraction Infrastructure**

- **Objective**: Elevate the ICP Smart Wallet's capabilities in the Account Abstraction realm by adding advanced infrastructures using IPC full-onchain functionality.
- **Components**:
  - **Fully-Onchain Verifying Paymaster**: Fully-onchain version of EIP4331 verifying paymaster.
  - **Bundler**: Fully-onchain version of EIP4331 bundler.

We remain committed to our community and will regularly update our roadmap based on the feedback received and the evolving needs of our users. Stay tuned for more exciting developments in the journey of the ICP Smart Wallet!

## Run

### Local

Please replace key in main.mo as follows

```
dfx_test_key  // local
test_key_1    // mainnet
```

This is instructed [here](https://discord.com/channels/748416164832608337/956466775380336680/1149386548253573122)

Then run the following commands.

```
cd app
npm install
dfx deploy
```

The above command gives locally deployed app url like this.

```
URLs:
  Frontend canister via browser
    app_frontend: http://127.0.0.1:4943/?canisterId=dlbnd-beaaa-aaaaa-qaana-cai
    internet_identity: http://127.0.0.1:4943/?canisterId=aovwi-4maaa-aaaaa-qaagq-cai
  Backend canister via Candid interface:
    app_backend: http://127.0.0.1:4943/?canisterId=ahw5u-keaaa-aaaaa-qaaha-cai&id=dccg7-xmaaa-aaaaa-qaamq-cai
    internet_identity: http://127.0.0.1:4943/?canisterId=ahw5u-keaaa-aaaaa-qaaha-cai&id=aovwi-4maaa-aaaaa-qaagq-cai
```

### Note

ICP Smart Wallet requires to connect dApp with Wallet Connect V2. This is the sample wallet connect dApp used in the demo.

https://react-app.walletconnect.com/

## Reference

ICP Smart Wallet's architecture is developed by extending the below Oisy Wallet concept.
https://github.com/dfinity/ic-eth-wallet

ICP Smart Wallet's Threshold ECDSA is developed by extending the below Motoko example contract.
https://github.com/dfinity/examples/tree/master/motoko/threshold-ecdsa
