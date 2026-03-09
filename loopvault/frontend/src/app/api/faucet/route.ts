import * as StellarSdk from "@stellar/stellar-sdk";

const ADMIN_SECRET = process.env.FAUCET_ADMIN_SECRET!;
const USDC_CONTRACT = process.env.NEXT_PUBLIC_USDC_ADDRESS!;
const RPC_URL = "https://soroban-testnet.stellar.org";
const PASSPHRASE = StellarSdk.Networks.TESTNET;

/** 1,000 USDC (7 decimal places) */
const MINT_AMOUNT = 1000_0000000n;

/** In-memory rate limit: address → last claim timestamp */
const claims = new Map<string, number>();

export async function POST(req: Request) {
  if (!ADMIN_SECRET || !USDC_CONTRACT) {
    return Response.json({ error: "Faucet yapılandırılmamış" }, { status: 503 });
  }

  let userPublicKey: string;
  try {
    const body = await req.json();
    userPublicKey = body.userPublicKey;
    StellarSdk.StrKey.decodeEd25519PublicKey(userPublicKey); // validate
  } catch {
    return Response.json({ error: "Geçersiz public key" }, { status: 400 });
  }

  // Rate limit: 24 saat
  const last = claims.get(userPublicKey);
  if (last && Date.now() - last < 24 * 60 * 60 * 1000) {
    const nextAt = new Date(last + 24 * 60 * 60 * 1000).toISOString();
    return Response.json(
      { error: `24 saatte 1 kez talep edebilirsiniz. Bir sonraki: ${nextAt}` },
      { status: 429 }
    );
  }

  const server = new StellarSdk.rpc.Server(RPC_URL, { allowHttp: false });
  const adminKeypair = StellarSdk.Keypair.fromSecret(ADMIN_SECRET);
  const account = await server.getAccount(adminKeypair.publicKey());

  const contract = new StellarSdk.Contract(USDC_CONTRACT);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: "100000",
    networkPassphrase: PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "mint",
        StellarSdk.Address.fromString(userPublicKey).toScVal(),
        StellarSdk.nativeToScVal(MINT_AMOUNT, { type: "i128" })
      )
    )
    .setTimeout(30)
    .build();

  const prepared = await server.prepareTransaction(tx);
  prepared.sign(adminKeypair);
  const result = await server.sendTransaction(prepared);

  if (result.status === "ERROR") {
    let reason = "bilinmeyen hata";
    try {
      const xdr = (result as any).errorResultXdr as string | undefined;
      if (xdr) {
        reason = xdr;
      } else if ((result as any).errorResult) {
        reason = JSON.stringify((result as any).errorResult);
      }
    } catch { /* ignore */ }
    return Response.json({ error: `Mint gönderilemedi: ${reason}` }, { status: 500 });
  }

  // Poll until the transaction is finalized (SUCCESS or FAILED)
  const hash = result.hash;
  let confirmed = false;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const txStatus = await server.getTransaction(hash);
    if (txStatus.status === "SUCCESS") {
      confirmed = true;
      break;
    }
    if (txStatus.status === "FAILED") {
      // Decode the actual XDR error so we can surface the real failure reason
      let reason = "bilinmeyen hata";
      try {
        const xdr = (txStatus as any).resultXdr as string | undefined;
        if (xdr) {
          const txResult = StellarSdk.xdr.TransactionResult.fromXDR(xdr, "base64");
          const opResults = txResult.result().results?.() ?? [];
          const first = opResults[0];
          if (first) {
            // e.g. "invokeHostFunctionTrapped" → useful string
            reason = JSON.stringify(first.tr?.().toXDR("base64") ?? first.toXDR("base64"));
          }
        }
      } catch {
        reason = JSON.stringify((txStatus as any).resultXdr ?? txStatus);
      }
      return Response.json(
        { error: `Mint işlemi zincirde başarısız oldu: ${reason}` },
        { status: 500 }
      );
    }
    // status === "NOT_FOUND" → still pending, keep polling
  }

  if (!confirmed) {
    return Response.json({ error: "Mint işlemi zaman aşımına uğradı", hash }, { status: 500 });
  }

  claims.set(userPublicKey, Date.now());

  return Response.json({
    success: true,
    hash,
    explorerUrl: `https://stellar.expert/explorer/testnet/tx/${hash}`,
  });
}
