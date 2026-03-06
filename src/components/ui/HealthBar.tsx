import { formatHealthFactor } from "@/lib/utils";

interface HealthBarProps {
  hf: number;
  className?: string;
}

export function HealthBar({ hf }: HealthBarProps) {
  const pct = Math.min((hf / 20_000) * 100, 100);

  const numColor =
    hf > 15_000 ? "#22c55e"
    : hf > 12_000 ? "#eab308"
    : "#ef4444";

  const statusLabel =
    hf > 15_000 ? "Güvenli"
    : hf > 12_000 ? "Dikkat"
    : "Risk";

  const statusColor =
    hf > 15_000 ? "#22c55e"
    : hf > 12_000 ? "#eab308"
    : "#ef4444";

  const statusBg =
    hf > 15_000 ? "rgba(34,197,94,.05)"
    : hf > 12_000 ? "rgba(234,179,8,.05)"
    : "rgba(239,68,68,.05)";

  const statusBorder =
    hf > 15_000 ? "rgba(34,197,94,.2)"
    : hf > 12_000 ? "rgba(234,179,8,.2)"
    : "rgba(239,68,68,.2)";

  return (
    <div>
      {/* Label row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span
          className="font-mono"
          style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".5px", textTransform: "uppercase", color: "#333" }}
        >
          Health Factor
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            className="font-mono"
            style={{
              fontSize: 10, fontWeight: 600,
              color: statusColor,
              background: statusBg,
              border: `1px solid ${statusBorder}`,
              borderRadius: 5,
              padding: "3px 8px",
            }}
          >
            {statusLabel}
          </span>
          <span
            className="font-mono"
            style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-2px", color: numColor, lineHeight: 1 }}
          >
            {hf === 100_000 ? "∞" : formatHealthFactor(hf)}
          </span>
        </div>
      </div>

      {/* Track */}
      <div
        style={{
          height: 3,
          background: "#111",
          borderRadius: 99,
          overflow: "hidden",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg,#ef4444 0%,#eab308 35%,#22c55e 65%)",
            borderRadius: 99,
            transition: "width .3s",
          }}
        />
      </div>
    </div>
  );
}
