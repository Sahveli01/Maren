import Link from "next/link";
import { APYComparison } from "@/components/APYComparison";

const FEATURES = [
  {
    kicker: "// single transaction",
    title: "Atomic Flash Loop",
    body: "Borrow flash loan → deposit to Blend → borrow → repay. All inside a single Stellar transaction. If anything fails, the whole thing reverts.",
  },
  {
    kicker: "// risk management",
    title: "Health Factor Monitoring",
    body: "On-chain Health Factor is continuously tracked. Secured by Blend v2. Automatic alerts as you approach the liquidation threshold.",
  },
  {
    kicker: "// automation",
    title: "Keeper Bots",
    body: "Vault Factory, keeper bots, and emergency deleveraging mechanisms automatically protect your position.",
  },
] as const;

const PROTOCOLS = [
  { type: "Core Lending",  name: "Blend v2",        desc: "USDC collateral and borrowing protocol. The most reliable lending infrastructure on Stellar." },
  { type: "Price Feed",    name: "Reflector Oracle", desc: "7-decimal precision USDC/USD feed. Real-time Health Factor calculation." },
  { type: "Flash Loan",    name: "Maren Flash",      desc: "Custom flash lender for single atomic transactions. Leverage loop with a 0.1% fee." },
] as const;

const MAX_W = 1100;

export default function HomePage() {
  return (
    <div>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: MAX_W, margin: "0 auto", padding: "96px 0 80px", position: "relative" }}>
        {/* Faint grid */}
        <div
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)",
            backgroundSize: "80px 80px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%,black 40%,transparent 100%)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 font-mono"
            style={{ fontSize: 11, color: "#555", border: "1px solid #1e1e1e", borderRadius: 5, padding: "4px 10px", marginBottom: 36, letterSpacing: ".2px" }}
          >
            <span className="animate-blink" style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", opacity: .4 }} />
            Flash Loan · Blend v2 · Stellar Testnet
          </div>

          {/* Headline */}
          <div style={{ fontSize: "clamp(40px,6vw,80px)", fontWeight: 700, letterSpacing: "-3px", lineHeight: 1, color: "#fff", marginBottom: 6 }}>
            Leverage Yield
          </div>
          <div style={{ fontSize: "clamp(40px,6vw,80px)", fontWeight: 700, letterSpacing: "-3px", lineHeight: 1, color: "#fff", marginBottom: 28 }}>
            with Flash Loans.
          </div>

          <p style={{ maxWidth: 420, margin: "0 auto 40px", fontSize: 15, color: "#555", lineHeight: 1.65 }}>
            Put your USDC to work on Blend Protocol with automatic leverage.
            Flash loan, collateral, borrow — all in a single transaction.
          </p>

          <div className="flex items-center justify-center gap-2.5 flex-wrap">
            <Link href="/enter" className="lv-cta-primary">
              Open Position →
            </Link>
            <Link href="/dashboard" className="lv-cta-ghost">
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* ── Terminal card ──────────────────────────────────────────── */}
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div className="lv-panel" style={{ boxShadow: "0 0 0 1px #111,0 40px 80px -20px rgba(0,0,0,.8)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid #141414", background: "#0d0d0d" }}>
            <div className="flex gap-1.5">
              {[0,1,2].map(i => <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: "#222", display: "block" }} />)}
            </div>
            <span className="font-mono" style={{ fontSize: 11, color: "#333", letterSpacing: ".3px" }}>maren.stellar.testnet</span>
            <div />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ padding: "20px 22px" }}>
              <div className="font-mono" style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".8px", textTransform: "uppercase", color: "#555", marginBottom: 12 }}>
                [ Input ] User Request
              </div>
              <div style={{ marginBottom: 14 }}>
                <div className="flex items-center gap-1.5" style={{ padding: "6px 10px", background: "#0f0f0f", border: "1px solid #161616", borderRadius: 6 }}>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#333" }} />
                  <p className="font-mono" style={{ fontSize: 10, color: "#444" }}>vault.enter(1000 USDC, 2x)</p>
                </div>
              </div>
              <div className="font-mono" style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".8px", textTransform: "uppercase", color: "#444", marginBottom: 10 }}>
                [ Thinking ] Transaction Flow
              </div>
              {[
                "Borrowed 999 USDC from flash lender",
                "Deposited 1998 USDC to Blend",
                "Borrowed 1000 USDC from Blend",
                "Repaid flash loan",
                "Position saved ✓",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-1.5" style={{ padding: "6px 10px", background: "#0f0f0f", border: "1px solid #161616", borderRadius: 6, marginBottom: 5 }}>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#333" }} />
                  <p className="font-mono" style={{ fontSize: 10, color: "#444" }}>{step}</p>
                </div>
              ))}
            </div>
            <div style={{ padding: "20px 22px", borderLeft: "1px solid #141414" }}>
              <div className="font-mono" style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".8px", textTransform: "uppercase", color: "#666", marginBottom: 12 }}>
                [ Output ] Position Status
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.8px", color: "#fff", marginBottom: 6 }}>Active Position</div>
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.55, marginBottom: 16 }}>
                2x leveraged USDC yield position on Blend v2 successfully opened.
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                {[{ lbl: "Collateral", val: "1998", col: "" }, { lbl: "Net APY", val: "9.58%", col: "#22c55e" }].map(({ lbl, val, col }) => (
                  <div key={lbl} style={{ flex: 1, background: "#0f0f0f", border: "1px solid #161616", borderRadius: 8, padding: "12px 14px" }}>
                    <div className="font-mono" style={{ fontSize: 9, color: "#333", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 6 }}>{lbl}</div>
                    <div className="font-mono" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-1px", color: col || "#fff" }}>{val}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[{ lbl: "Debt", val: "1000", col: "#eab308" }, { lbl: "Health", val: "1.60", col: "#a5b4fc" }].map(({ lbl, val, col }) => (
                  <div key={lbl} style={{ flex: 1, background: "#0f0f0f", border: "1px solid #161616", borderRadius: 8, padding: "12px 14px" }}>
                    <div className="font-mono" style={{ fontSize: 9, color: "#333", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 6 }}>{lbl}</div>
                    <div className="font-mono" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-1px", color: col }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── How it works ───────────────────────────────────────────── */}
      <div style={{ maxWidth: MAX_W, margin: "0 auto", padding: "80px 0" }}>
        <div className="font-mono" style={{ fontSize: 11, color: "#444", letterSpacing: ".3px", marginBottom: 14 }}>
          // <b style={{ color: "#666" }}>how it works</b>
        </div>
        <div style={{ fontSize: "clamp(24px,3.5vw,42px)", fontWeight: 700, letterSpacing: "-1.5px", color: "#fff", marginBottom: 48, lineHeight: 1.1 }}>
          Leveraged yield<br /><span style={{ color: "#333" }}>in one transaction.</span>
        </div>
        <div className="lv-g3">
          {FEATURES.map(({ kicker, title, body }) => (
            <div key={title} className="lv-g3-card">
              <div className="font-mono" style={{ fontSize: 10, color: "#444", letterSpacing: ".4px", marginBottom: 16 }}>{kicker}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 8, letterSpacing: "-.3px" }}>{title}</div>
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.65 }}>{body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── APY Table ──────────────────────────────────────────────── */}
      <div style={{ maxWidth: MAX_W, margin: "0 auto", paddingBottom: 80 }}>
        <div className="font-mono" style={{ fontSize: 11, color: "#444", letterSpacing: ".3px", marginBottom: 14 }}>
          // <b style={{ color: "#666" }}>yield comparison</b>
        </div>
        <div style={{ fontSize: "clamp(24px,3.5vw,42px)", fontWeight: 700, letterSpacing: "-1.5px", color: "#fff", marginBottom: 32, lineHeight: 1.1 }}>
          APY <span style={{ color: "#333" }}>Table.</span>
        </div>
        <APYComparison />
      </div>

      {/* ── Protocol stack ─────────────────────────────────────────── */}
      <div style={{ maxWidth: MAX_W, margin: "0 auto", paddingBottom: 80 }}>
        <div className="font-mono" style={{ fontSize: 11, color: "#444", letterSpacing: ".3px", marginBottom: 14 }}>
          // <b style={{ color: "#666" }}>infrastructure</b>
        </div>
        <div style={{ fontSize: "clamp(24px,3.5vw,42px)", fontWeight: 700, letterSpacing: "-1.5px", color: "#fff", marginBottom: 32, lineHeight: 1.1 }}>
          Protocol <span style={{ color: "#333" }}>Stack.</span>
        </div>
        <div className="lv-g3">
          {PROTOCOLS.map(({ type, name, desc }) => (
            <div key={name} className="lv-g3-card">
              <div className="font-mono" style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".6px", textTransform: "uppercase", color: "#333", marginBottom: 10 }}>{type}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 6 }}>{name}</div>
              <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "80px 0 40px", textAlign: "center" }}>
        <div style={{ fontSize: "clamp(28px,4vw,52px)", fontWeight: 700, letterSpacing: "-2px", color: "#fff", marginBottom: 14, lineHeight: 1.05 }}>
          Ready to<br />get started?
        </div>
        <div style={{ fontSize: 14, color: "#555", marginBottom: 32 }}>
          Try it free with test USDC on Stellar Testnet.
        </div>
        <Link href="/faucet" className="lv-cta-primary">
          Get Started →
        </Link>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <div style={{ height: 1, background: "#111", maxWidth: MAX_W, margin: "0 auto" }} />
      <div style={{ maxWidth: MAX_W, margin: "0 auto", padding: "28px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="font-mono" style={{ fontSize: 11, color: "#333" }}>Maren © 2026</span>
        <span className="font-mono" style={{ fontSize: 11, color: "#333" }}>Stellar Testnet — no real money</span>
      </div>

    </div>
  );
}
