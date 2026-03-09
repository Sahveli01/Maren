import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "relative inline-flex items-center justify-center font-medium transition-all duration-150 " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none " +
    "active:scale-[0.98]";

  const variants: Record<string, string> = {
    primary:
      "bg-white text-black hover:bg-[#e8e8e8] border-0",
    secondary:
      "bg-[#0a0a0a] text-[#888] hover:text-[#ccc] border border-[#1e1e1e] hover:border-[#333] hover:bg-[#111]",
    danger:
      "bg-[rgba(239,68,68,0.08)] text-[#ef4444] border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.14)] hover:border-[rgba(239,68,68,0.35)]",
    ghost:
      "bg-transparent text-[#888] hover:text-[#ccc] border border-[#1e1e1e] hover:border-[#333]",
    success:
      "bg-[rgba(34,197,94,0.08)] text-[#22c55e] border border-[rgba(34,197,94,0.2)] hover:bg-[rgba(34,197,94,0.14)]",
  };

  const sizes: Record<string, string> = {
    sm: "h-8 px-3.5 text-[12px] rounded-[7px] gap-1.5",
    md: "h-[38px] px-4 text-[13px] rounded-[8px] gap-2",
    lg: "h-[42px] px-5 text-[13px] rounded-[8px] gap-2",
  };

  return (
    <button
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-current opacity-60" />
        </span>
      )}
      <span className={cn("flex items-center gap-2", loading && "opacity-0")}>
        {children}
      </span>
    </button>
  );
}
