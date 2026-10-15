# 🪙 KittyChain — Decentralized Kitty Party on Monad

> A trustless, on-chain rotating savings club (ROSCA) for ladies — built on **Monad Testnet**.

---

## 🌸 What is KittyChain?

Traditional kitty parties have a trust problem — someone holds all the money. **KittyChain** puts the smart contract in charge:

- Members pool a fixed amount of **MON** every round
- The smart contract holds the funds securely
- Each round, one member receives the full pot (rotating order)
- **No middleman. No trust needed. Fully transparent.**

---

## 🏗️ Project Structure

```
project 1/
├── contracts/
│   └── KittyParty.sol        ← Smart contract
├── scripts/
│   └── deploy.js             ← Deployment script
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Providers.tsx     ← Wagmi + React Query
│   │   ├── GroupCard.tsx
│   │   ├── GroupDetail.tsx
│   │   └── CreateGroupModal.tsx
│   ├── lib/
│   │   ├── wagmi.ts          ← Chain config + MetaMask connector
│   │   └── contract.ts       ← ABI + contract address
│   ├── pages/
│   │   ├── _app.tsx
│   │   └── index.tsx
│   └── styles/
│       └── globals.css
├── hardhat.config.js
├── next.config.js
├── tsconfig.json
├── .env                      ← Add your PRIVATE_KEY here
└── package.json
```

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Install Hardhat (dev deps)
```bash
npm install --save-dev hardhat@^2.22.0 @nomicfoundation/hardhat-toolbox@^5.0.0 dotenv
```

### 3. Set your private key
Edit `.env`:
```
PRIVATE_KEY=your_wallet_private_key_here
```

### 4. Compile contracts
```bash
npm run compile
```

### 5. Get Monad testnet MON
- Add Monad Testnet to MetaMask: **Chain ID 10143**, RPC: `https://testnet-rpc.monad.xyz`
- Faucet: https://faucet.monad.xyz

### 6. Deploy to Monad Testnet
```bash
npm run deploy:monad
```
This auto-saves the contract address + ABI to `src/contracts/KittyParty.json`

### 7. Update contract address in frontend
After deployment, copy the address from terminal into `src/lib/contract.ts` → `KITTY_PARTY_ADDRESS`

### 8. Run the frontend
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 🔗 Monad Testnet Details

| Field | Value |
|---|---|
| Network Name | Monad Testnet |
| Chain ID | 10143 |
| RPC URL | https://testnet-rpc.monad.xyz |
| Currency | MON |
| Explorer | https://testnet.monadexplorer.com |

---

## 📋 Smart Contract Functions

| Function | Description |
|---|---|
| `createGroup(name, members[], amount, duration)` | Create a new kitty group |
| `contribute(groupId)` | Pay your contribution for the current round |
| `triggerPayout(groupId)` | Release the pot to the current round's winner |
| `getGroupInfo(groupId)` | Get all group details |
| `getMemberContributionStatus(groupId, round)` | Who has paid this round |
| `getCurrentRecipient(groupId)` | Who wins this round's pot |

---

## 🛠️ Tech Stack

- **Smart Contract**: Solidity 0.8.20, Hardhat 2, OpenZeppelin patterns
- **Frontend**: Next.js 14, TypeScript
- **Web3**: Wagmi v2, Viem v2
- **Wallet**: MetaMask
- **Network**: Monad Testnet (Chain ID: 10143)
