import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBps(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`;
}

export function formatHealthFactor(hf: number): string {
  return (hf / 10000).toFixed(2);
}

export function getHealthColor(hf: number): string {
  if (hf > 15000) return "text-vault-success";
  if (hf > 12000) return "text-vault-warning";
  if (hf > 11000) return "text-vault-danger";
  return "text-vault-critical";
}

export function getHealthLabel(hf: number): string {
  if (hf === 100000) return "No Position";
  if (hf > 15000) return "Healthy";
  if (hf > 12000) return "Warning";
  if (hf > 11000) return "Danger";
  return "Critical";
}

export function calcNetAPY(
  supplyApy: number, // basis points (800 = 8%)
  borrowApy: number,
  leverageBps: number // 20000 = 2x
): number {
  const L = leverageBps / 10000;
  const s = supplyApy / 10000;
  const b = borrowApy / 10000;
  const mgmt = 0.005; // 0.5%
  return Math.round((L * s - (L - 1) * b - mgmt) * 10000);
}
