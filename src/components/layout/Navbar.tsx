"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/",          label: "Home" },
  { href: "/enter",     label: "Open Position" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/faucet",    label: "Faucet" },
];

export function Navbar() {
  const { address, isConnected, connect, disconnect } = useWallet();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between"
        style={{
          height: 52,
          padding: "0 24px",
          borderBottom: "1px solid #1a1a1a",
          background: "rgba(0,0,0,.92)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
            style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-.3px", color: "#fff" }}
          >
            <div
              className="font-mono"
              style={{
                width: 24, height: 24,
                background: "#fff",
                borderRadius: 5,
                display: "grid", placeItems: "center",
                fontSize: 9, fontWeight: 700,
                color: "#000", letterSpacing: "-.5px",
              }}
            >
              MN
            </div>
            Maren
          </Link>
          <span
            className="font-mono"
            style={{
              fontSize: 9, fontWeight: 500,
              color: "#666",
              border: "1px solid #222",
              borderRadius: 4,
              padding: "2px 6px",
              letterSpacing: ".3px",
              textTransform: "uppercase",
            }}
          >
            Testnet
          </span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center transition-colors duration-150",
                  active ? "text-white" : "text-[#888] hover:text-[#ccc]"
                )}
                style={{
                  position: "relative",
                  padding: "0 14px",
                  height: 52,
                  fontSize: 13,
                  borderBottom: active ? "2px solid #fff" : "2px solid transparent",
                  marginBottom: -1,
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Wallet button */}
        <div className="hidden md:flex items-center gap-2">
          {isConnected ? (
            <button
              onClick={disconnect}
              className="flex items-center gap-1.5 cursor-pointer transition-all duration-150"
              style={{
                height: 32, padding: "0 14px",
                fontSize: 13, fontWeight: 500,
                color: "#fff",
                background: "#111",
                border: "1px solid #333",
                borderRadius: 7,
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#555"; el.style.background = "#161616"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#333"; el.style.background = "#111"; }}
            >
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 5px #22c55e", flexShrink: 0 }} />
              <span className="font-mono" style={{ fontSize: 11, color: "#aaa" }}>
                {address!.slice(0, 6)}•••{address!.slice(-4)}
              </span>
            </button>
          ) : (
            <button
              onClick={connect}
              className="flex items-center gap-1.5 cursor-pointer transition-all duration-150"
              style={{
                height: 32, padding: "0 14px",
                fontSize: 13, fontWeight: 500,
                color: "#fff",
                background: "#111",
                border: "1px solid #333",
                borderRadius: 7,
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#555"; el.style.background = "#161616"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#333"; el.style.background = "#111"; }}
            >
              Connect Wallet
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden cursor-pointer"
          style={{ color: "#555", padding: 4 }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="fixed md:hidden left-0 right-0 z-[98] animate-fade-in"
          style={{ top: 88, background: "#000", borderBottom: "1px solid #1a1a1a" }}
        >
          <div style={{ padding: "12px 24px" }}>
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn("flex items-center py-3 transition-colors", pathname === href ? "text-white" : "text-[#666]")}
                style={{ fontSize: 14, borderBottom: "1px solid #111" }}
              >
                {label}
              </Link>
            ))}
            <div style={{ paddingTop: 12 }}>
              {isConnected ? (
                <button onClick={() => { disconnect(); setMobileOpen(false); }} className="text-[#555] text-sm cursor-pointer">
                  {address!.slice(0, 8)}...{address!.slice(-4)} — Disconnect
                </button>
              ) : (
                <button onClick={() => { connect(); setMobileOpen(false); }} className="w-full text-center py-2.5 text-sm font-semibold text-black bg-white rounded-lg cursor-pointer">
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
