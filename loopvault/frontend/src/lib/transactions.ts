import * as StellarSdk from "@stellar/stellar-sdk";
import { rpc, config, fromScVal } from "./stellar";

export async function buildContractCall(
  sourceAddress: string,
  contractId: string,
  method: string,
  args: StellarSdk.xdr.ScVal[]
): Promise<string> {
  const account = await rpc.getAccount(sourceAddress);
  const contract = new StellarSdk.Contract(contractId);

  let tx = new StellarSdk.TransactionBuilder(account, {
    fee: "1000000", // max 0.1 XLM
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(180)
    .build();

  const simulation = await rpc.simulateTransaction(tx);

  if (StellarSdk.rpc.Api.isSimulationError(simulation)) {
    throw new Error(`Simulation failed: ${JSON.stringify(simulation.error)}`);
  }

  tx = StellarSdk.rpc.assembleTransaction(tx, simulation).build();
  return tx.toXDR();
}

/**
 * Simulate a read-only contract call and return the native JS value.
 * No signing or submission needed.
 */
export async function simulateView(
  sourceAddress: string,
  contractId: string,
  method: string,
  args: StellarSdk.xdr.ScVal[]
): Promise<unknown> {
  const account = await rpc.getAccount(sourceAddress);
  const contract = new StellarSdk.Contract(contractId);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const sim = await rpc.simulateTransaction(tx);

  if (StellarSdk.rpc.Api.isSimulationError(sim)) {
    throw new Error(`View call failed: ${sim.error}`);
  }

  if (!StellarSdk.rpc.Api.isSimulationSuccess(sim) || !sim.result?.retval) {
    return null;
  }

  return fromScVal(sim.result.retval);
}

export async function submitSignedTx(
  signedXdr: string,
  onStatus?: (status: string) => void
): Promise<{ hash: string; result: unknown }> {
  const tx = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    config.networkPassphrase
  ) as StellarSdk.Transaction;

  const response = await rpc.sendTransaction(tx);

  if (response.status === "ERROR") {
    const err = JSON.stringify(response.errorResult);
    throw new Error(`Transaction failed: ${err}`);
  }

  onStatus?.("Onay bekleniyor...");

  for (let i = 0; i < 30; i++) {
    const result = await rpc.getTransaction(response.hash);
    if (result.status === "SUCCESS") {
      const native = result.returnValue ? fromScVal(result.returnValue) : null;
      return { hash: response.hash, result: native };
    }
    if (result.status === "FAILED") {
      throw new Error(`Transaction failed: ${JSON.stringify(result)}`);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  throw new Error("Transaction timeout");
}
