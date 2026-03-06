<div align="center">

# ⚡ Maren

### Leveraged Yield on Stellar — Flash Loans · Blend v2 · Soroban

[![Stellar](https://img.shields.io/badge/Stellar-Testnet-7B68EE?style=for-the-badge&logo=stellar&logoColor=white)](https://stellar.org)
[![Rust](https://img.shields.io/badge/Rust-Soroban-orange?style=for-the-badge&logo=rust&logoColor=white)](https://stellar.org/soroban)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

</div>

---

## Project Description

Maren is a non-custodial DeFi protocol built on the Stellar blockchain that enables users to open **leveraged yield positions on USDC** — fully atomically, in a single transaction. Using flash loans combined with Blend v2's lending infrastructure, Maren lets users multiply their yield exposure without manual multi-step transactions or custodial risk.

A user deposits USDC, selects a leverage multiplier, and Maren handles everything: borrows a flash loan, supplies amplified collateral to Blend, borrows against it, repays the flash loan — all in one atomic Soroban transaction. If any step fails, the entire transaction reverts. Each user gets an isolated vault deployed by the factory contract, ensuring there is no shared state or cross-user risk.

---

## Vision

Maren envisions a future where yield optimization on Stellar is accessible to everyone — not just sophisticated traders. Today, leveraged DeFi strategies require deep technical knowledge and constant manual management. Maren eliminates that barrier by automating the entire process on-chain, secured by smart contracts and keeper bots. As Stellar's DeFi ecosystem grows, Maren aims to become the go-to protocol for anyone looking to maximize their on-chain yield safely, transparently, and without giving up custody of their assets. One transaction. Maximum yield. Zero compromise.

---

## Software Development Plan

### Step 1 — Core Smart Contracts (Soroban / Rust)
- `loop-vault`: main vault with `enter()`, `exit()`, `emergency_deleverage()`
- `loop-vault-receiver`: orchestrator that sequences the flash loan flow
- `loop-vault-callback`: owns the Blend v2 position; handles `flash_receive_enter/exit/deleverage()`
- Key variables: `collateral_amount`, `debt_amount`, `leverage_bps`, `health_factor`, `oracle_price`
- Pre-authorization of token transfers via `authorize_as_current_contract` for Blend v2 2-level auth

### Step 2 — Flash Lender & Infrastructure Contracts
- `loopvault-flash`: custom flash loan lender with 0.1% fee and typed error codes
- `loop-vault-factory`: deploys isolated vault + receiver + callback trios per user, counter-based salt
- `health-monitor`: keeper bot interface for reading health factors across vaults
- `fee-collector`: protocol treasury management

### Step 3 — Oracle & Risk Management
- Integration with Mock Oracle (7-decimal, $1.00 USDC/USD)
- On-chain health factor calculation: `collateral / debt × liquidation_factor`
- Emergency deleverage trigger when health factor approaches 1.00
- Exit buffer (`debt + 1 USDC`) to fully clear Blend d-token dust

### Step 4 — Frontend (Next.js 16 + React 19)
- Pages: `/enter` (open position), `/exit` (close position), `/dashboard` (live stats), `/faucet`
- Freighter wallet integration via Stellar Wallets Kit
- Real-time health factor, collateral, debt, and net APY display
- Faucet API route: server-side USDC minting for testnet users (24h rate limit)

### Step 5 — Testing & Deployment
- Unit tests for all vault math and contract logic (`cargo test --target x86_64-unknown-linux-gnu`)
- 12 on-chain end-to-end integration tests (`scripts/e2e-test.sh`)
- WASM optimization via `stellar contract optimize` before deployment
- Full deployment pipeline: `scripts/deploy.sh` → `scripts/update-env.py` → live on Stellar Testnet

---

## About Me

My name is Şahveli Karahan. I am a 20-year-old Civil Engineering student in my first year at METU (Middle East Technical University) and an active member of the METU Blockchain Community. Despite studying engineering, I have always been drawn to how decentralized technology can reshape financial systems. Maren is my first serious DeFi project — built entirely from scratch on Stellar Soroban. I believe blockchain will be as foundational to infrastructure as the structures civil engineers build, and I want to be at that intersection.

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-Sahveli01-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Sahveli01)
[![Twitter/X](https://img.shields.io/badge/X-SahveliKarahan-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/SahveliKarahan)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-sahvelikarahan-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/sahvelikarahan)

</div>

---

## Deployed Contracts (Stellar Testnet)

| Contract | Address |
|---|---|
| Loop Vault Factory | `CDFGLJ2RH5UV2HNL4NDBGCM64HRT6JTZHBCT6TESND4T6ZCCZBEI2N5J` |
| Maren Flash Lender | `CC7FU3MGQUK7VF5LHSYGMOD3PABSRLWASLZ2EJU5ONSIDQRXGP7AENEF` |
| Fee Collector | `CDYFBL4HV3Z5ND6NZ563JQ6DKMWWWITTRMXPRRSUGEDCG2E44SICHSFU` |
| Health Monitor | `CAQ4LEHOW2UET34QIHW6UPPWAG2272IR6DFHKXFKBUIZURNUCBPODFZV` |
| Mock USDC (SAC) | `CC34OIYOTY6I7UN7I5ZNU3J45EPPXZYYGEELKKUJVM3PKZACCLVZGPLR` |
| Blend v2 Pool | `CCXVUXSRPLNNFMTKK627NFNIADGCPKC5P37J4BCANLMGQTPQLF5ADRDX` |

---

## Installation

### Prerequisites

- [Rust](https://rustup.rs/) + `wasm32-unknown-unknown` target
- [Stellar CLI](https://developers.stellar.org/docs/tools/stellar-cli)
- [Node.js](https://nodejs.org/) 20+
- [Freighter Wallet](https://freighter.app/) browser extension (set to Testnet)

### 1. Clone the Repository

```bash
git clone https://github.com/Sahveli01/Maren.git
cd Maren
```

### 2. Build Smart Contracts

```bash
rustup target add wasm32-unknown-unknown

cargo build --release --target wasm32-unknown-unknown

# Optimize WASMs before deployment
for wasm in target/wasm32-unknown-unknown/release/*.wasm; do
  stellar contract optimize --wasm "$wasm"
done
```

### 3. Run Tests

```bash
# Linux / CI
cargo test -p loop-vault --lib --target x86_64-unknown-linux-gnu

# Windows
cargo test -p loop-vault --lib --target x86_64-pc-windows-gnu
```

### 4. Deploy to Testnet

```bash
# Create a Stellar identity
stellar keys generate admin --network testnet

# Deploy all contracts
bash scripts/deploy.sh

# Populate frontend environment variables
python3 scripts/update-env.py
```

### 5. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), connect your Freighter wallet on Testnet, and use the `/faucet` page to get free test USDC.

### 6. Run End-to-End Tests

```bash
bash scripts/e2e-test.sh
```

Runs 12 on-chain integration tests covering factory deployment, flash loan mechanics, vault enter/exit, and health factor monitoring.

---

<div align="center">

**Maren — Stellar Testnet · No real money involved**

*Built with Rust, Soroban, and Next.js*

</div>
