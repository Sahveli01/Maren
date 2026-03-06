"use client";

import { calcNetAPY, formatBps } from "@/lib/utils";

interface APYComparisonProps {
  supplyApyBps?: number;
  borrowApyBps?: number;
}

const ROWS = [
  { rank: "01", label: "Blend Direct",  leverageBps: 10_000, dotColor: "#444", risk: "Low",      riskType: "lo" as const },
  { rank: "02", label: "Maren 2x",      leverageBps: 20_000, dotColor: "#666", risk: "Medium",   riskType: "md" as const },
  { rank: "03", label: "Maren 3x",      leverageBps: 30_000, dotColor: "#888", risk: "High",     riskType: "hi" as const },
  { rank: "04", label: "Maren 4x",      leverageBps: 40_000, dotColor: "#aaa", risk: "Critical", riskType: "hi" as const },
] as const;

const RISK_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  lo: { color: "#22c55e", bg: "rgba(34,197,94,.08)",  border: "rgba(34,197,94,.15)" },
  md: { color: "#eab308", bg: "rgba(234,179,8,.08)",  border: "rgba(234,179,8,.15)" },
  hi: { color: "#ef4444", bg: "rgba(239,68,68,.08)",  border: "rgba(239,68,68,.15)" },
};

export function APYComparison({
  supplyApyBps = 750,
  borrowApyBps = 500,
}: APYComparisonProps) {
  const rows = ROWS.map((r) => {
    const apy =
      r.leverageBps === 10_000
        ? supplyApyBps - 50
        : calcNetAPY(supplyApyBps, borrowApyBps, r.leverageBps);
    return { ...r, apy };
  });

  return (
    <div className="lv-apy-table">
      <div className="lv-apy-thead">
        <div className="lv-apy-th">#</div>
        <div className="lv-apy-th" style={{ marginLeft: 28 }}>Strategy</div>
        <div className="lv-apy-th" style={{ marginLeft: "auto" }}>APY</div>
      </div>
      {rows.map((r) => {
        const rs = RISK_STYLES[r.riskType];
        return (
          <div key={r.label} className="lv-apy-row">
            <span className="font-mono flex-shrink-0" style={{ fontSize: 10, color: "#333", width: 18 }}>{r.rank}</span>
            <span className="flex-shrink-0" style={{ width: 6, height: 6, borderRadius: "50%", background: r.dotColor, marginRight: 12 }} />
            <span className="flex-1" style={{ fontSize: 13, fontWeight: 500, color: "#ccc" }}>{r.label}</span>
            <span className="font-mono flex-shrink-0" style={{ fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 4, marginRight: 16, color: rs.color, background: rs.bg, border: `1px solid ${rs.border}` }}>
              {r.risk} risk
            </span>
            <span className="font-mono" style={{ fontSize: 13, fontWeight: 600, marginLeft: "auto", color: r.apy > 0 ? "#22c55e" : "#ef4444" }}>
              {formatBps(r.apy)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
