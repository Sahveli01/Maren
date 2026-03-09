# Maren — Frontend

Next.js 16 web interface for the Maren leveraged yield protocol on Stellar.

For full protocol documentation see the [root README](../README.md).

---

## Stack

- **Framework**: Next.js 16 (App Router), React 19
- **Styling**: Tailwind CSS v4 (config in `globals.css` via `@theme {}` — no `tailwind.config.ts`)
- **Language**: TypeScript
- **Wallet**: Freighter via Stellar Wallets Kit
- **Network**: Stellar Testnet

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page — protocol overview and APY comparison |
| `/enter` | Open a new leveraged position |
| `/exit` | Close an existing position |
| `/dashboard` | Position stats — collateral, debt, health factor, net APY |
| `/faucet` | Get 1,000 test USDC (24h rate limit) |

---

## Project Structure

```
src/
├── app/                  # Next.js App Router pages + API routes
│   └── api/faucet/       # Server-side faucet endpoint (mints USDC via admin key)
├── components/           # UI components (APYComparison, PositionCard, etc.)
├── hooks/
│   ├── useVault.ts       # Vault address resolution + position data
│   ├── useBlend.ts       # Blend pool rates
│   └── useWallet.ts      # Freighter connection state
└── lib/
    ├── stellar.ts         # SDK config, contract addresses, ScVal helpers
    ├── transactions.ts    # buildContractCall, submitSignedTx
    ├── utils.ts           # cn, formatBps, formatHealthFactor, calcNetAPY
    └── faucet.ts          # Client-side faucet API wrapper
```

---

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy and populate the env file:

```bash
cp .env.local.example .env.local
```

Or run the deploy script from the repo root, then:

```bash
python3 ../scripts/update-env.py
```

Required variables:

```env
NEXT_PUBLIC_LOOP_VAULT_FACTORY=C...
NEXT_PUBLIC_FLASH_LENDER=C...
NEXT_PUBLIC_USDC_SAC=C...
NEXT_PUBLIC_BLEND_POOL=C...
NEXT_PUBLIC_NETWORK=testnet
FAUCET_ADMIN_SECRET=S...        # Server-side only — never expose publicly
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Connect Freighter wallet on Testnet.

---

## Notes

- USDC uses **7 decimals** on Stellar: `1 USDC = 10_000_000` (raw units).
- Tailwind v4 themes are defined in `src/app/globals.css` under `@theme {}`.
- Vault addresses are resolved from the factory on-chain and cached in Zustand + localStorage. If the factory returns `null`, the cached address is cleared automatically.
