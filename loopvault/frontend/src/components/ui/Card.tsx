import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** "default" = plain panel | "lined" = dark gradient top line | "health" = green gradient top line */
  variant?: "default" | "lined" | "health";
}

export function Card({ children, className, variant = "default" }: CardProps) {
  return (
    <div
      className={cn(
        "lv-panel",
        variant === "lined" && "lv-panel-line",
        variant === "health" && "lv-panel-green",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(className)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "13px 18px",
        borderBottom: "1px solid #111",
      }}
    >
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(className)} style={{ padding: "18px 18px" }}>
      {children}
    </div>
  );
}
