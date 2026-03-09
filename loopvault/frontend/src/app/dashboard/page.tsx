"use client";

import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { HealthBar } from "@/components/ui/HealthBar";
import { useWallet, useWalletStore } from "@/hooks/useWallet";
import {
  useVaultAddress,
  usePosition,
  useHealthFactor,
  useExitPosition,
  useVaultVersion,
  useUpgradeVault,
} from "@/hooks/useVault";
import { formatHealthFactor } from "@/lib/utils";
import { TrendingDown, ExternalLink } from "lucide-react";
import Link from "next/link";

const EXPLORER_BASE = "https://stellar.expert/explorer/testnet/contract";

export default function DashboardPage() {
  const { isConnected, connect }                           = useWallet();
  const { vaultAddress }                                   = useWalletStore();
  const { data: resolvedVault, isLoading: vaultLoading }   = useVaultAddress();
  const { data: position,      isLoading: positionLoading } = usePosition();
  const { data: hf,            isLoading: hfLoading }       = useHealthFactor();
  const exitPosition  = useExitPosition();
  const { data: vaultVersion } = useVaultVersion();
  const upgradeVault  = useUpgradeVault();

  const activeVault  = resolvedVault ?? vaultAddress;
  const hasPosition  = position != null && Number(position.collateral_amount) > 0;
  const needsUpgrade = vaultVersion != null && vaultVersion < 3;

  const handleExit = async () => {
    if (!position) return;
    const minReturn = BigInt(
      Math.floor(Number(position.collateral_amount - position.debt_amount) * 0.98)
    );
    await exitPosition.mutateAsync(minReturn);
  };

  /* ── Not connected ─────────────────────────────────────────── */
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center animate-fade-in" style={{ minHeight: "60vh", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 12, display: "grid", placeItems: "center", fontSize: 22, marginBottom: 18 }}>◇</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", letterSpacing: "-.3px", marginBottom: 6 }}>Dashboard</div>
        <div style={{ fontSize: 13, color: "#444", maxWidth: 280, marginBottom: 24, lineHeight: 1.6 }}>Connect your wallet to view your position.</div>
        <Button onClick={connect} size="lg">Connect Wallet</Button>
      </div>
    );
  }

  /* ── Vault loading ─────────────────────────────────────────── */
  if (vaultLoading) {
    return (
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 0 80px" }}>
        <Skeleton className="h-7 w-36 mb-8" />
        <div className="lv-grid4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="lv-sc">
              <Skeleton className="h-2.5 w-14 mb-3" />
              <Skeleton className="h-7 w-20 mb-2" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── No vault ──────────────────────────────────────────────── */
  if (!activeVault) {
    return (
      <div className="flex flex-col items-center justify-center animate-fade-in" style={{ minHeight: "60vh", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 12, display: "grid", placeItems: "center", fontSize: 22, marginBottom: 18 }}>⬡</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", letterSpacing: "-.3px", marginBottom: 6 }}>No Vault</div>
        <div style={{ fontSize: 13, color: "#444", maxWidth: 280, marginBottom: 24, lineHeight: 1.6 }}>
          You haven&apos;t created a vault yet. Open your first position to auto-deploy it.
        </div>
        <Link href="/enter"><Button size="lg">Open First Position</Button></Link>
      </div>
    );
  }

  /* ── Main dashboard ────────────────────────────────────────── */
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 0 80px" }} className="animate-slide-up">

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-.8px", color: "#fff", marginBottom: 4 }}>Dashboard</div>
          <a
            href={`${EXPLORER_BASE}/${activeVault}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono flex items-center gap-2 transition-colors hover:text-[#aaa]"
            style={{ fontSize: 11, color: "#444" }}
          >
            {activeVault.slice(0, 10)}…{activeVault.slice(-6)}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <Link href="/enter"><Button variant="secondary" size="sm">New Position</Button></Link>
      </div>

      {/* Upgrade banner */}
      {needsUpgrade && (
        <div className="lv-panel" style={{ marginBottom: 16, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 3 }}>Vault Update Available</p>
            <p style={{ fontSize: 11, color: "#555" }}>Exit bug fixed. Upgrade your vault to close positions correctly.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => upgradeVault.mutate()} loading={upgradeVault.isPending}>
            Upgrade
          </Button>
        </div>
      )}

      {/* 4-col stats */}
      <div className="lv-grid4" style={{ marginBottom: 16 }}>
        {positionLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="lv-sc">
              <Skeleton className="h-2.5 w-14 mb-3" />
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          ))
        ) : hasPosition && position ? (
          <>
            <StatCard mode="sc" label="Total Collateral" value={(Number(position.collateral_amount) / 10_000_000).toFixed(2)} subtitle="USDC locked in Blend" />
            <StatCard mode="sc" label="Effective Debt"   value={(Number(position.debt_amount) / 10_000_000).toFixed(2)}       subtitle="Outstanding repayment" variant="warning" />
            <StatCard mode="sc" label="Net Position"     value={((Number(position.collateral_amount) - Number(position.debt_amount)) / 10_000_000).toFixed(2)} subtitle="Estimated net value" variant="success" />
            <StatCard mode="sc" label="Leverage"         value={`${(position.leverage_bps / 10_000).toFixed(1)}x`}            subtitle={`${position.leverage_bps.toLocaleString()} bps`} />
          </>
        ) : (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "48px 24px" }}>
            <p style={{ fontSize: 13, color: "#333", marginBottom: 8 }}>No active position.</p>
            <Link href="/enter" style={{ fontSize: 13, color: "#666" }} className="hover:text-[#aaa] transition-colors">
              Open a position →
            </Link>
          </div>
        )}
      </div>

      {/* Health card */}
      {hasPosition && (
        <div className="lv-panel lv-panel-green" style={{ padding: "26px 24px", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 22 }}>Health Status</div>
          {hfLoading ? <Skeleton className="h-12 w-full" /> : <HealthBar hf={hf ?? 100_000} />}
          {hf != null && hf < 12_000 && (
            <div className="font-mono flex items-center gap-2" style={{ marginTop: 12, padding: "10px 14px", background: "rgba(234,179,8,.05)", border: "1px solid rgba(234,179,8,.15)", borderRadius: 8, fontSize: 10, color: "#eab308" }}>
              <span>△</span> HF {formatHealthFactor(hf ?? 0)} — Liquidation risk increasing.
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {hasPosition && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button
            onClick={handleExit}
            disabled={exitPosition.isPending}
            className="flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ height: 42, background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 8, color: "#ef4444", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
            onMouseEnter={e => { if (!exitPosition.isPending) { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(239,68,68,.14)"; el.style.borderColor = "rgba(239,68,68,.35)"; } }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(239,68,68,.08)"; el.style.borderColor = "rgba(239,68,68,.2)"; }}
          >
            {exitPosition.isPending ? <span style={{ fontSize: 11 }}>Processing...</span> : <><TrendingDown className="w-4 h-4" /> Close Position</>}
          </button>

          <Link href="/enter">
            <button
              className="w-full flex items-center justify-center gap-2 transition-all duration-150"
              style={{ height: 42, background: "#0a0a0a", border: "1px solid #1e1e1e", borderRadius: 8, color: "#888", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#333"; el.style.color = "#ccc"; el.style.background = "#111"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#1e1e1e"; el.style.color = "#888"; el.style.background = "#0a0a0a"; }}
            >
              + New Position
            </button>
          </Link>
        </div>
      )}

    </div>
  );
}
