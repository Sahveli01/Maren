"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as StellarSdk from "@stellar/stellar-sdk";
import { horizon, BLEND_USDC_ASSET, BLEND_USDC_ISSUER, config, toAddress } from "@/lib/stellar";
import { simulateView } from "@/lib/transactions";
import { mintMockUSDC, MintAuthError } from "@/lib/faucet";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

function useFaucetInfo() {
  const { address } = useWallet();
  return useQuery({
    queryKey: ["faucetInfo", address],
    enabled: !!address,
    refetchInterval: 15_000,
    queryFn: async () => {
      const account = await horizon.loadAccount(address!);
      const usdcEntry = account.balances.find(
        (b: StellarSdk.Horizon.HorizonApi.BalanceLine): b is StellarSdk.Horizon.HorizonApi.BalanceLine<"credit_alphanum4"> =>
          b.asset_type === "credit_alphanum4" &&
          (b as StellarSdk.Horizon.HorizonApi.BalanceLine<"credit_alphanum4">).asset_code === "USDC" &&
          (b as StellarSdk.Horizon.HorizonApi.BalanceLine<"credit_alphanum4">).asset_issuer === BLEND_USDC_ISSUER
      );
      const xlmEntry = account.balances.find((b: StellarSdk.Horizon.HorizonApi.BalanceLine) => b.asset_type === "native");
      return {
        hasTrustline: !!usdcEntry,
        usdcBalance: usdcEntry?.balance ?? "0",
        xlmBalance: xlmEntry ? parseFloat(xlmEntry.balance) : 0,
      };
    },
  });
}

function useSacBalance() {
  const { address } = useWallet();
  const sacContract = process.env.NEXT_PUBLIC_USDC_ADDRESS ?? "";
  return useQuery({
    queryKey: ["sacBalance", address, sacContract],
    enabled: !!address && !!sacContract,
    refetchInterval: 15_000,
    queryFn: async () => {
      const result = await simulateView(address!, sacContract, "balance", [toAddress(address!)]);
      return result != null ? (result as bigint) : 0n;
    },
  });
}

function useAddTrustline() {
  const { address, signTransaction } = useWallet();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Wallet not connected");
      const account = await horizon.loadAccount(address);
      const xlmEntry = account.balances.find((b: StellarSdk.Horizon.HorizonApi.BalanceLine) => b.asset_type === "native");
      const xlmBalance = xlmEntry ? parseFloat(xlmEntry.balance) : 0;
      if (xlmBalance < 1.5) throw new Error(`Insufficient XLM: need at least 1.5 XLM (current: ${xlmBalance.toFixed(2)})`);
      const tx = new StellarSdk.TransactionBuilder(account, { fee: "1000", networkPassphrase: config.networkPassphrase })
        .addOperation(StellarSdk.Operation.changeTrust({ asset: BLEND_USDC_ASSET, limit: "1000000000" }))
        .setTimeout(180)
        .build();
      const signedXdr = await signTransaction(tx.toXDR());
      const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, config.networkPassphrase) as StellarSdk.Transaction;
      const response = await horizon.submitTransaction(signedTx);
      if (!response.successful) throw new Error("Trustline transaction failed");
      return response;
    },
    onSuccess: () => { toast.success("Trustline added!"); qc.invalidateQueries({ queryKey: ["faucetInfo", address] }); qc.invalidateQueries({ queryKey: ["sacBalance"] }); },
    onError: (e: Error) => toast.error(e.message ?? "Failed to add trustline"),
  });
}

function useMintUSDC() {
  const { address, signTransaction } = useWallet();
  const [statusText, setStatusText] = useState("");
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Wallet not connected");
      return mintMockUSDC(address, signTransaction, setStatusText);
    },
    onSuccess: () => {
      setStatusText("");
      toast.success("1,000 test USDC minted!");
      qc.invalidateQueries({ queryKey: ["faucetInfo", address] });
      qc.invalidateQueries({ queryKey: ["sacBalance"] });
    },
    onError: (e: Error) => {
      setStatusText("");
      if (e instanceof MintAuthError) return;
      toast.error(e.message ?? "Mint failed");
    },
  });
  return { ...mutation, statusText };
}

export default function FaucetPage() {
  const { address, isConnected, connect } = useWallet();
  const { data: info, isLoading: infoLoading } = useFaucetInfo();
  const { data: sacBalance } = useSacBalance();
  const addTrustline = useAddTrustline();
  const mintUsdc = useMintUSDC();

  const usdcDisplay =
    sacBalance != null
      ? (Number(sacBalance) / 10_000_000).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })
      : info?.usdcBalance
      ? parseFloat(info.usdcBalance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })
      : "0.00";

  return (
    <div style={{ maxWidth: 540, margin: "0 auto", padding: "40px 0 80px" }} className="animate-slide-up">

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="flex items-center gap-2.5" style={{ marginBottom: 4 }}>
          <span className="font-mono" style={{ fontSize: 11, color: "#555" }}>// faucet</span>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.6px", color: "#fff" }}>Test USDC Faucet</span>
        </div>
        <p style={{ fontSize: 13, color: "#555", marginLeft: 60 }}>
          Test USDC is required to open positions on Testnet.
        </p>
      </div>

      {/* Not connected */}
      {!isConnected && (
        <div className="lv-panel lv-panel-line" style={{ marginBottom: 12 }}>
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 18 }}>◈</div>
            <div style={{ fontSize: 14, color: "#444", marginBottom: 24 }}>Connect your wallet to see your trustline status.</div>
            <Button onClick={connect} size="lg">Connect Wallet</Button>
          </div>
        </div>
      )}

      {/* Trustline & balance card */}
      {isConnected && (
        <div className="lv-panel lv-panel-line" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 18px", borderBottom: "1px solid #111" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Trustline &amp; Balance</span>
          </div>
          <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>

            {infoLoading ? (
              <><Skeleton className="h-14 rounded-lg" /><Skeleton className="h-14 rounded-lg" /></>
            ) : (
              <>
                <div className="flex items-center justify-between" style={{ padding: "12px 14px", background: "#050505", border: `1px solid ${info?.hasTrustline ? "rgba(34,197,94,.2)" : "#111"}`, borderRadius: 8, ...(info?.hasTrustline ? { background: "rgba(34,197,94,.03)" } : {}) }}>
                  <div>
                    <div className="font-mono" style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".5px", textTransform: "uppercase", color: "#333", marginBottom: 3 }}>USDC Trustline</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: info?.hasTrustline ? "#22c55e" : "#aaa" }}>{info?.hasTrustline ? "Active" : "Missing — needs to be added"}</div>
                  </div>
                  {info?.hasTrustline && <div style={{ width: 20, height: 20, background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.25)", borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 10, color: "#22c55e" }}>✓</div>}
                </div>

                <div className="flex items-center justify-between" style={{ padding: "12px 14px", background: "#050505", border: "1px solid #111", borderRadius: 8 }}>
                  <div>
                    <div className="font-mono" style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".5px", textTransform: "uppercase", color: "#333", marginBottom: 3 }}>USDC Balance</div>
                    <div className="font-mono" style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-1px", color: "#fff" }}>{info?.hasTrustline ? usdcDisplay : "—"}</div>
                    <div className="font-mono" style={{ fontSize: 11, color: "#444" }}>USDC</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="font-mono" style={{ fontSize: 9, color: "#333", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 3 }}>XLM</div>
                    <div className="font-mono" style={{ fontSize: 13, color: "#aaa" }}>{info?.xlmBalance?.toFixed(2) ?? "—"}</div>
                  </div>
                </div>
              </>
            )}

            {!infoLoading && info && info.xlmBalance < 1 && (
              <div className="font-mono flex items-start gap-2" style={{ fontSize: 10, color: "#555", lineHeight: 1.55, marginTop: 4 }}>
                <span style={{ flexShrink: 0, marginTop: 1 }}>△</span>
                <span>
                  Low XLM balance. XLM is needed for transaction fees.{" "}
                  <a href={`https://friendbot.stellar.org/?addr=${address ?? ""}`} target="_blank" rel="noopener noreferrer" style={{ color: "#666", textDecoration: "underline" }}>
                    Get from Friendbot
                  </a>
                </span>
              </div>
            )}

            {!infoLoading && !info?.hasTrustline && (
              <div style={{ marginTop: 4 }}>
                <Button fullWidth size="lg" onClick={() => addTrustline.mutate()} loading={addTrustline.isPending}>Add USDC Trustline</Button>
                <p className="font-mono" style={{ fontSize: 10, color: "#333", textAlign: "center", marginTop: 8, lineHeight: 1.5 }}>
                  ℹ Adding a trustline requires 0.5 XLM reserve. Approve in Freighter.
                </p>
              </div>
            )}

            {!infoLoading && info?.hasTrustline && (
              <div style={{ marginTop: 4 }}>
                {mintUsdc.isSuccess && mintUsdc.data ? (
                  <div>
                    <div style={{ padding: "12px 14px", background: "rgba(34,197,94,.05)", border: "1px solid rgba(34,197,94,.15)", borderRadius: 8, marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#22c55e", marginBottom: 4 }}>1,000 USDC minted!</div>
                      <a href={`https://stellar.expert/explorer/testnet/tx/${mintUsdc.data}`} target="_blank" rel="noopener noreferrer" className="font-mono flex items-center gap-1 transition-colors hover:text-[#888]" style={{ fontSize: 10, color: "#555" }}>
                        {mintUsdc.data.slice(0, 24)}...<ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <Button fullWidth variant="secondary" size="sm" onClick={() => mintUsdc.reset()}>Mint Again</Button>
                  </div>
                ) : mintUsdc.error instanceof MintAuthError ? (
                  <div style={{ padding: "12px 14px", background: "rgba(234,179,8,.05)", border: "1px solid rgba(234,179,8,.15)", borderRadius: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#eab308", marginBottom: 4 }}>Admin permission required</div>
                    <div style={{ fontSize: 11, color: "#555" }}>This contract&apos;s mint function is restricted. Request test USDC from Blend Discord.</div>
                  </div>
                ) : (
                  <div>
                    <Button fullWidth size="lg" onClick={() => mintUsdc.mutate()} loading={mintUsdc.isPending}>
                      {mintUsdc.isPending ? (mintUsdc.statusText || "Processing...") : "Get 1,000 Test USDC"}
                    </Button>
                    <p className="font-mono" style={{ fontSize: 10, color: "#333", textAlign: "center", marginTop: 8, lineHeight: 1.5 }}>
                      ℹ Blend testnet Mock USDC. Requires a small amount of XLM for gas.
                    </p>
                  </div>
                )}
              </div>
            )}

            {address && (
              <div className="font-mono" style={{ fontSize: 10, color: "#333", textAlign: "center", padding: 10, background: "#050505", border: "1px solid #111", borderRadius: 7, wordBreak: "break-all", marginTop: 4 }}>
                {address}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Steps card */}
      <div className="lv-panel">
        <div style={{ padding: "13px 18px", borderBottom: "1px solid #111", fontSize: 13, fontWeight: 600, color: "#fff" }}>How do I get started?</div>
        <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { n: "1", title: "Connect your Freighter wallet",    desc: "Click 'Connect Wallet' in the top right corner." },
            { n: "2", title: "Add USDC Trustline",               desc: "Use the button above — confirm in Freighter." },
            { n: "3", title: "Get test USDC",                    desc: "Click 'Get 1,000 Test USDC', confirm the transaction in Freighter." },
            { n: "4", title: "Open a position",                  desc: "Go to Open Position and create a leveraged yield position." },
          ].map(({ n, title, desc }) => (
            <div key={n} className="flex items-start" style={{ gap: 13 }}>
              <div className="font-mono flex-shrink-0" style={{ width: 22, height: 22, background: "#0f0f0f", border: "1px solid #1e1e1e", borderRadius: 5, display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, color: "#444", marginTop: 1 }}>
                {n}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#ccc", marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 12, color: "#444", lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
