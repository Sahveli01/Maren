import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: string;
  prefix?: string;
}

export function Input({
  label,
  error,
  suffix,
  prefix,
  className,
  ...props
}: InputProps) {
  return (
    <div>
      {label && (
        <label
          className="font-mono block"
          style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".5px", textTransform: "uppercase", color: "#444", marginBottom: 8 }}
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span
            className="absolute left-3.5 font-mono"
            style={{ fontSize: 11, color: "#444", pointerEvents: "none" }}
          >
            {prefix}
          </span>
        )}
        <input
          className={cn(
            "w-full font-mono transition-colors duration-150 outline-none",
            error
              ? "border-[rgba(239,68,68,0.5)] focus:border-[rgba(239,68,68,0.7)]"
              : "border-[#1e1e1e] focus:border-[#333]",
            prefix && "pl-9",
            suffix && "pr-[52px]",
            className
          )}
          style={{
            background: "#050505",
            border: "1px solid",
            borderRadius: 8,
            padding: "13px 52px 13px 14px",
            fontSize: 18,
            fontWeight: 500,
            color: "#fff",
          }}
          {...props}
        />
        {suffix && (
          <span
            className="absolute right-3.5 font-mono"
            style={{ fontSize: 11, fontWeight: 600, color: "#444", pointerEvents: "none" }}
          >
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p style={{ fontSize: 11, color: "#ef4444", marginTop: 6 }}>
          {error}
        </p>
      )}
    </div>
  );
}
