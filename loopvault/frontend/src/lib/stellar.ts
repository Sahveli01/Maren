import * as StellarSdk from "@stellar/stellar-sdk";

export const NETWORK = (process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet") as "testnet";

export const STELLAR_CONFIG = {
  testnet: {
    horizonUrl: "https://horizon-testnet.stellar.org",
    rpcUrl: "https://soroban-testnet.stellar.org",
    networkPassphrase: StellarSdk.Networks.TESTNET,
    friendbotUrl: "https://friendbot.stellar.org",
  },
} as const;

export const config = STELLAR_CONFIG[NETWORK];

export const rpc = new StellarSdk.rpc.Server(config.rpcUrl, {
  allowHttp: false,
});

export const horizon = new StellarSdk.Horizon.Server(config.horizonUrl);

// Mock USDC deployed by LoopVault admin — classic Stellar asset wrapped by SAC
// Admin: GDWEQP2WFAIJMWBZUUISEZ5UR5ZFII7HLFWACQRGJTX7NWI2SUZEKQP6 (deployed 2026-03-06)
export const BLEND_USDC_ISSUER = "GDWEQP2WFAIJMWBZUUISEZ5UR5ZFII7HLFWACQRGJTX7NWI2SUZEKQP6";
export const BLEND_USDC_ASSET = new StellarSdk.Asset("USDC", BLEND_USDC_ISSUER);

// Deployed contract addresses — .env.local'dan
export const CONTRACTS = {
  factory: process.env.NEXT_PUBLIC_FACTORY_ADDRESS ?? "",
  flashLender: process.env.NEXT_PUBLIC_FLASH_LENDER_ADDRESS ?? "",
  feeCollector: process.env.NEXT_PUBLIC_FEE_COLLECTOR_ADDRESS ?? "",
  healthMonitor: process.env.NEXT_PUBLIC_HEALTH_MONITOR_ADDRESS ?? "",
} as const;

export const TOKENS = {
  usdc: process.env.NEXT_PUBLIC_USDC_ADDRESS ?? "",
} as const;

export const EXTERNAL = {
  blendPool: process.env.NEXT_PUBLIC_BLEND_POOL_ADDRESS ?? "",
  reflectorOracle: "CCYOZJCOPG34LLQQ7N24YXBM7LL62R7ONMZ3G6WZAAYPB5OYKOMJRN63",
} as const;

// ScVal helpers
export const toI128 = (amount: bigint): StellarSdk.xdr.ScVal =>
  StellarSdk.nativeToScVal(amount, { type: "i128" });

export const toU32 = (val: number): StellarSdk.xdr.ScVal =>
  StellarSdk.nativeToScVal(val, { type: "u32" });

export const toAddress = (addr: string): StellarSdk.xdr.ScVal =>
  StellarSdk.Address.fromString(addr).toScVal();

export const fromScVal = (val: StellarSdk.xdr.ScVal): unknown =>
  StellarSdk.scValToNative(val);

export const toBytes32 = (hexHash: string): StellarSdk.xdr.ScVal =>
  StellarSdk.xdr.ScVal.scvBytes(Buffer.from(hexHash, "hex"));

// USDC formatting (7 decimal — Stellar SAC standard)
export const formatUsdc = (amount: bigint): string =>
  (Number(amount) / 10_000_000).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
