import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  /** "default"|"success"|"warning"|"danger" for text color on value */
  variant?: "default" | "success" | "warning" | "danger";
  /** "sc" = dashboard 4-col card | "sbox" = enter 2x2 card */
  mode?: "sc" | "sbox";
  className?: string;
}

const valueColors: Record<string, string> = {
  default:  "#fff",
  success:  "#22c55e",
  warning:  "#eab308",
  danger:   "#ef4444",
};

export function StatCard({
  label,
  value,
  subtitle,
  variant = "default",
  mode = "sc",
  className,
}: StatCardProps) {
  const valColor = valueColors[variant];

  if (mode === "sbox") {
    return (
      <div className={cn("lv-sbox", className)}>
        <div
          className="font-mono"
          style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".5px", textTransform: "uppercase", color: "#333", marginBottom: 6 }}
        >
          {label}
        </div>
        <div
          className="font-mono"
          style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-1px", color: valColor, lineHeight: 1 }}
        >
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: 11, color: "#444", marginTop: 3 }}>{subtitle}</div>
        )}
      </div>
    );
  }

  // mode === "sc" (dashboard card with ::before top line)
  return (
    <div className={cn("lv-sc", className)}>
      <div
        className="font-mono"
        style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".6px", textTransform: "uppercase", color: "#333", marginBottom: 10 }}
      >
        {label}
      </div>
      <div
        className="font-mono"
        style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1.5px", color: valColor, lineHeight: 1, marginBottom: 5 }}
      >
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: 11, color: "#333" }}>{subtitle}</div>
      )}
    </div>
  );
}
