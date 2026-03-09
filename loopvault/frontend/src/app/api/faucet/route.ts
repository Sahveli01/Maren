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

  try {
    const server = new StellarSdk.rpc.Server(RPC_URL, { allowHttp: false });
    const adminKeypair = StellarSdk.Keypair.fromSecret(ADMIN_SECRET);

    let account: StellarSdk.Account;
    try {
      account = await server.getAccount(adminKeypair.publicKey());
    } catch (e: any) {
      return Response.json(
        { error: `Admin hesabı RPC'de bulunamadı: ${e?.message ?? e}` },
        { status: 500 }
      );
    }

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

    let prepared: StellarSdk.Transaction;
    try {
      prepared = (await server.prepareTransaction(tx)) as StellarSdk.Transaction;
    } catch (e: any) {
      return Response.json(
        { error: `Transaction simülasyonu başarısız: ${e?.message ?? JSON.stringify(e)}` },
        { status: 500 }
      );
    }

    prepared.sign(adminKeypair);
    const result = await server.sendTransaction(prepared);

    if (result.status === "ERROR") {
      const xdr = (result as any).errorResultXdr as string | undefined;
      const reason = xdr ?? JSON.stringify((result as any).errorResult ?? result);
      return Response.json({ error: `Mint gönderilemedi: ${reason}` }, { status: 500 });
    }

    // Poll for up to 8 seconds (4 × 2s) to stay within Vercel 10s timeout
    const hash = result.hash;
    let confirmed = false;
    for (let i = 0; i < 4; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const txStatus = await server.getTransaction(hash);
      if (txStatus.status === "SUCCESS") {
        confirmed = true;
        break;
      }
      if (txStatus.status === "FAILED") {
        const resultXdr = (txStatus as any).resultXdr as string | undefined;
        let reason = resultXdr ?? JSON.stringify(txStatus);
        try {
          if (resultXdr) {
            const txResult = StellarSdk.xdr.TransactionResult.fromXDR(resultXdr, "base64");
            const opResults = txResult.result().results?.() ?? [];
            const first = opResults[0];
            if (first) reason = JSON.stringify(first.tr?.().toXDR("base64") ?? first.toXDR("base64"));
          }
        } catch { /* use raw xdr */ }
        return Response.json(
          { error: `Mint zincirde başarısız: ${reason}` },
          { status: 500 }
        );
      }
      // NOT_FOUND → still pending
    }

    // Whether confirmed in window or still pending, record rate limit and return hash.
    // Stellar transactions submitted without ERROR are nearly always finalized — client can
    // verify via stellar.expert if needed.
    claims.set(userPublicKey, Date.now());

    return Response.json({
      success: true,
      hash,
      confirmed,
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${hash}`,
    });
  } catch (e: any) {
    // Catch-all: herhangi bir unhandled exception → JSON 500 döner (HTML değil)
    console.error("[faucet] unhandled error:", e);
    return Response.json(
      { error: `Sunucu hatası: ${e?.message ?? String(e)}` },
      { status: 500 }
    );
  }
}
