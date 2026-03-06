"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/StatCard";
import { StatCardSkeleton } from "@/components/ui/Skeleton";
import { HealthBar } from "@/components/ui/HealthBar";
import { calcNetAPY, formatBps } from "@/lib/utils";
import { useWallet } from "@/hooks/useWallet";
import { useVaultAddress, useDeployVault, useEnterPosition } from "@/hooks/useVault";
import { useBlendAPY } from "@/hooks/useBlendAPY";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const SLIPPAGE_OPTIONS = [50, 100, 200];
const LEVERAGE_MIN = 11_000;
const LEVERAGE_MAX = 50_000;

export default function EnterPage() {
  const { isConnected, connect } = useWallet();
  const { data: vaultAddress, isLoading: vaultLoading } = useVaultAddress();
  const deployVault   = useDeployVault();
  const enterPosition = useEnterPosition();
  const { data: blendAPY, isLoading: apyLoading } = useBlendAPY();

  const [principalStr, setPrincipalStr] = useState("1000");
  const [leverageBps, setLeverageBps]   = useState(20_000);
  const [slippageBps, setSlippageBps]   = useState(100);

  const principal = useMemo(() => {
    const n = parseFloat(principalStr);
    return isNaN(n) ? 0n : BigInt(Math.floor(n * 10_000_000));
  }, [principalStr]);

  const leverage       = leverageBps / 10_000;
  const principalUsdc  = Number(principal) / 10_000_000;
  const isValidPrincipal = principalUsdc >= 100;

  const totalCollateral = useMemo(
    () => (Number(principal) / 10_000_000) * leverage,
    [principal, leverage]
  );
  const effectiveDebt = totalCollateral - principalUsdc;

  const netApyBps = useMemo(() => {
    if (!blendAPY) return null;
    return calcNetAPY(blendAPY.supplyApyBps, blendAPY.borrowApyBps, leverageBps);
  }, [blendAPY, leverageBps]);

  const estimatedHF = useMemo(() => {
    if (effectiveDebt === 0) return 100_000;
    return Math.floor((totalCollateral * 0.8) / effectiveDebt) * 10_000;
  }, [totalCollateral, effectiveDebt]);

  const rangePct = Math.round(((leverageBps - LEVERAGE_MIN) / (LEVERAGE_MAX - LEVERAGE_MIN)) * 100);

  const handleLeverageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setLeverageBps(val);
    e.target.style.setProperty("--range-pct", `${Math.round(((val - LEVERAGE_MIN) / (LEVERAGE_MAX - LEVERAGE_MIN)) * 100)}%`);
  }, []);

  const handleEnter = async () => {
    if (!isValidPrincipal || !vaultAddress) return;
    const minCollateral = BigInt(
      Math.floor(totalCollateral * 10_000_000 * (1 - slippageBps / 10_000))
    );
    await enterPosition.mutateAsync({ principal, leverageBps, minCollateral });
  };

  return (
    <div style={{ maxWidth: 580, margin: "0 auto", padding: "40px 0 80px" }} className="animate-slide-up">

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="flex items-center gap-2.5" style={{ marginBottom: 4 }}>
          <span className="font-mono" style={{ fontSize: 11, color: "#555" }}>// position</span>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.6px", color: "#fff" }}>Open Position</span>
        </div>
        <p style={{ fontSize: 13, color: "#555", marginLeft: 60 }}>
          Single-transaction leveraged USDC yield position via flash loan.
        </p>
      </div>

      {/* Live pills */}
      <div className="flex gap-2" style={{ marginBottom: 24 }}>
        {blendAPY && (
          <>
            <div className="font-mono flex items-center gap-1.5" style={{ fontSize: 10, fontWeight: 500, padding: "4px 10px", borderRadius: 5, color: "#22c55e", border: "1px solid rgba(34,197,94,.2)", background: "rgba(34,197,94,.05)" }}>
              <span style={{ fontSize: 6 }}>●</span>
              Supply {formatBps(blendAPY.supplyApyBps)}
            </div>
            <div className="font-mono flex items-center gap-1.5" style={{ fontSize: 10, fontWeight: 500, padding: "4px 10px", borderRadius: 5, color: "#888", border: "1px solid #1e1e1e", background: "#0a0a0a" }}>
              <span style={{ fontSize: 6 }}>●</span>
              Borrow {formatBps(blendAPY.borrowApyBps)}
            </div>
          </>
        )}
        {apyLoading && (
          <div className="font-mono" style={{ fontSize: 10, padding: "4px 10px", borderRadius: 5, color: "#444", border: "1px solid #1a1a1a", background: "#0a0a0a" }}>
            Loading rates...
          </div>
        )}
      </div>

      {/* Main panel */}
      <div className="lv-panel lv-panel-line" style={{ marginBottom: 12 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: "1px solid #111" }}>
          <span className="font-mono" style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".5px", textTransform: "uppercase", color: "#444" }}>
            Parameters
          </span>
          <div className="font-mono flex items-center gap-1.5" style={{ fontSize: 10, color: "#333" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 4px #22c55e" }} />
            Live
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 18px", display: "flex", flexDirection: "column", gap: 18 }}>

          <Input
            label="Principal Amount"
            type="number"
            min="100"
            step="100"
            value={principalStr}
            onChange={(e) => setPrincipalStr(e.target.value)}
            suffix="USDC"
            placeholder="1000"
            error={principalStr && !isValidPrincipal ? "Minimum 100 USDC" : undefined}
          />

          {/* Leverage */}
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <label className="font-mono" style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".5px", textTransform: "uppercase", color: "#444" }}>
                Leverage
              </label>
              <span className="font-mono" style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                {leverage.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min={LEVERAGE_MIN}
              max={LEVERAGE_MAX}
              step={1_000}
              value={leverageBps}
              onChange={handleLeverageChange}
              style={{ "--range-pct": `${rangePct}%` } as React.CSSProperties}
            />
            <div className="flex justify-between" style={{ marginTop: 10 }}>
              {["1x", "2x", "3x", "4x", "5x"].map(t => (
                <span key={t} className="font-mono" style={{ fontSize: 10, color: "#333" }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Slippage */}
          <div>
            <p className="font-mono" style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".5px", textTransform: "uppercase", color: "#444", marginBottom: 10 }}>
              Slippage Tolerance
            </p>
            <div className="flex gap-1.5">
              {SLIPPAGE_OPTIONS.map((bps) => (
                <button
                  key={bps}
                  onClick={() => setSlippageBps(bps)}
                  className={cn("flex-1 font-mono cursor-pointer transition-all duration-150", slippageBps === bps ? "text-white" : "text-[#444] hover:text-[#888] hover:border-[#2a2a2a]")}
                  style={{
                    padding: 8,
                    background: slippageBps === bps ? "#111" : "#050505",
                    border: `1px solid ${slippageBps === bps ? "#333" : "#1a1a1a"}`,
                    borderRadius: 7,
                    fontSize: 12, fontWeight: 500,
                    textAlign: "center",
                  }}
                >
                  {bps / 100}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats 2×2 */}
        <div className="lv-stats2" style={{ borderTop: "1px solid #111" }}>
          <StatCard mode="sbox" label="Total Collateral" value={totalCollateral.toFixed(0)} subtitle="USDC to deposit" />
          <StatCard mode="sbox" label="Effective Debt"   value={effectiveDebt.toFixed(0)}   subtitle="Flash loan repayment" variant="warning" />
          {apyLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              mode="sbox"
              label="Estimated Net APY"
              value={netApyBps != null ? formatBps(netApyBps) : "—"}
              subtitle={blendAPY ? `at ${leverage.toFixed(1)}x leverage` : "Rate unavailable"}
              variant={netApyBps != null ? (netApyBps > 0 ? "success" : "danger") : "default"}
            />
          )}
          <StatCard mode="sbox" label="Entry Leverage" value={`${leverage.toFixed(1)}x`} subtitle={`${leverageBps.toLocaleString()} bps`} />
        </div>

        {/* Health factor preview */}
        {isValidPrincipal && (
          <div style={{ padding: "15px 18px", borderTop: "1px solid #111" }}>
            <HealthBar hf={estimatedHF} />
            {estimatedHF < 12_000 && (
              <div className="font-mono flex items-center gap-1.5" style={{ fontSize: 10, color: "#555", marginTop: 8 }}>
                <span style={{ fontSize: 9, color: "#444" }}>△</span>
                High leverage risk — close to liquidation threshold.
              </div>
            )}
          </div>
        )}

        {/* Submit */}
        <div style={{ padding: "14px 18px", borderTop: "1px solid #111" }}>
          {!isConnected ? (
            <Button fullWidth onClick={connect} size="lg">Connect Wallet</Button>
          ) : vaultLoading ? (
            <Button fullWidth size="lg" disabled loading>Checking Vault...</Button>
          ) : !vaultAddress ? (
            <Button fullWidth size="lg" variant="secondary" onClick={() => deployVault.mutateAsync()} loading={deployVault.isPending}>
              Create Vault (First Time)
            </Button>
          ) : (
            <Button fullWidth size="lg" onClick={handleEnter} loading={enterPosition.isPending} disabled={!isValidPrincipal}>
              <TrendingUp className="w-4 h-4" />
              Open {leverage.toFixed(1)}x Position — ${principalUsdc.toFixed(0)} USDC
            </Button>
          )}
          <p className="font-mono" style={{ fontSize: 10, color: "#333", textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>
            Requires interaction with Blend Protocol and Maren Flash.
            Stellar Testnet — test tokens only.
          </p>
        </div>
      </div>

    </div>
  );
}
