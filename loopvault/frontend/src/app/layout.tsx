import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maren — Amplified Yield on Stellar",
  description: "Flash loan powered leveraged yield positions — Stellar/Soroban",
  keywords: ["Stellar", "DeFi", "Yield", "Blend Protocol", "Soroban"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-vault-bg text-vault-text font-sans min-h-screen">
        <Providers>
          {/* Fixed testnet banner (below nav at top:52px) */}
          <div
            className="fixed left-0 right-0 z-[99] text-center border-b border-[#1a1a1a] bg-black font-mono"
            style={{ top: 52, padding: "6px 0", fontSize: 11, color: "#555", letterSpacing: ".1px" }}
          >
            <b style={{ color: "#888", fontWeight: 500 }}>Stellar Testnet</b> — no real money involved
          </div>

          <Navbar />

          {/* 52px nav + ~24px banner = 88px total offset */}
          <main style={{ paddingTop: 88 }} className="px-6">
            {children}
          </main>

          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#0a0a0a",
                border: "1px solid #1a1a1a",
                color: "#ededed",
                fontSize: "13px",
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
