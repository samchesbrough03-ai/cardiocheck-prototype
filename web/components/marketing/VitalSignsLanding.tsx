"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const colors = {
  black: "#0A0A0A",
  white: "#FAFAFA",
  offwhite: "#F4F3F0",
  gray100: "#E8E7E4",
  gray400: "#9A9892",
  gray600: "#5C5B58",
  accent: "#1A1A1A",
  risk: {
    low: "#2D6A4F",
    medium: "#E07B39",
    high: "#C1392B",
    critical: "#7B0000",
  },
  scores: { good: "#2D6A4F", fair: "#E07B39", poor: "#C1392B" },
} as const;

const vitals = [
  { id: "cardio", name: "CardioCheck", icon: "♥", desc: "Client contracts & revenue risk", color: "#C1392B" },
  { id: "nerve", name: "NerveCheck", icon: "⚡", desc: "IP ownership & gaps", color: "#2471A3" },
  { id: "struct", name: "StructureCheck", icon: "⬡", desc: "Supplier & partner contracts", color: "#117A65" },
  { id: "immune", name: "ImmuneCheck", icon: "◎", desc: "Data privacy & GDPR", color: "#6C3483" },
  { id: "muscle", name: "MuscleCheck", icon: "◇", desc: "People & talent agreements", color: "#B7950B" },
] as const;

type NavTarget = "landing" | "assessment" | "login" | "register" | "dashboard";

function Navbar({ onNavigate }: { onNavigate: (target: NavTarget) => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? "rgba(250,249,248,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid ${colors.gray100}` : "none",
        transition: "all 0.3s ease",
        padding: "0 2.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "64px",
      }}
    >
      <button
        onClick={() => onNavigate("landing")}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            background: colors.black,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: colors.white, fontSize: 13, fontWeight: 700 }}>
            VS
          </span>
        </div>
        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: colors.black,
            letterSpacing: "-0.01em",
          }}
        >
          VitalSigns
        </span>
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <button
          onClick={() => onNavigate("assessment")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.875rem",
            color: colors.gray600,
            letterSpacing: "0.01em",
          }}
        >
          Free Assessment
        </button>
        <button
          onClick={() => onNavigate("login")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.875rem",
            color: colors.gray600,
            letterSpacing: "0.01em",
          }}
        >
          Sign in
        </button>
        <button
          onClick={() => onNavigate("assessment")}
          style={{
            background: colors.black,
            color: colors.white,
            border: "none",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.875rem",
            padding: "0.5rem 1.25rem",
            borderRadius: "4px",
            letterSpacing: "0.01em",
          }}
        >
          Get Your Score →
        </button>
      </div>
    </nav>
  );
}

function Landing({ onNavigate }: { onNavigate: (target: NavTarget) => void }) {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${colors.white}; }
        .fade-in { animation: fadeUp 0.7s ease forwards; opacity: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        .vital-card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(0,0,0,0.08) !important; }
        .vital-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .cta-btn:hover { background: #333 !important; }
        .cta-btn { transition: background 0.15s ease; }
      `}</style>

      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "8rem 2.5rem 5rem",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div className="fade-in" style={{ animationDelay: "0.1s" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: colors.offwhite,
              border: `1px solid ${colors.gray100}`,
              padding: "0.35rem 0.9rem",
              borderRadius: "100px",
              fontSize: "0.8rem",
              color: colors.gray600,
              marginBottom: "2.5rem",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                background: "#2D6A4F",
                borderRadius: "50%",
                display: "inline-block",
              }}
            />
            Legal Health Platform for UK Tech SMEs
          </div>
        </div>

        <h1
          className="fade-in"
          style={{
            animationDelay: "0.2s",
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(2.8rem, 6vw, 5.2rem)",
            fontWeight: 900,
            lineHeight: 1.05,
            color: colors.black,
            maxWidth: "820px",
            letterSpacing: "-0.03em",
            marginBottom: "1.75rem",
          }}
        >
          Know your legal risks
          <br />
          <em style={{ fontStyle: "italic", color: colors.gray400 }}>
            before a buyer does.
          </em>
        </h1>

        <p
          className="fade-in"
          style={{
            animationDelay: "0.3s",
            fontSize: "1.15rem",
            color: colors.gray600,
            maxWidth: "540px",
            lineHeight: 1.7,
            marginBottom: "3rem",
            fontWeight: 300,
          }}
        >
          VitalSigns uses AI to audit your contracts and data privacy posture —
          giving you a clear Legal Health Score and a prioritised remediation plan
          before you enter exit negotiations.
        </p>

        <div
          className="fade-in"
          style={{
            animationDelay: "0.4s",
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => onNavigate("assessment")}
            className="cta-btn"
            style={{
              background: colors.black,
              color: colors.white,
              border: "none",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "1rem",
              fontWeight: 500,
              padding: "0.9rem 2rem",
              borderRadius: "4px",
              letterSpacing: "0.01em",
            }}
          >
            Check Your Legal Health Score — Free →
          </button>
          <button
            style={{
              background: "none",
              color: colors.gray600,
              border: `1px solid ${colors.gray100}`,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "1rem",
              fontWeight: 400,
              padding: "0.9rem 2rem",
              borderRadius: "4px",
              letterSpacing: "0.01em",
            }}
          >
            See how it works
          </button>
        </div>

        <div
          className="fade-in"
          style={{
            animationDelay: "0.55s",
            marginTop: "4rem",
            paddingTop: "2rem",
            borderTop: `1px solid ${colors.gray100}`,
            display: "flex",
            gap: "3rem",
            flexWrap: "wrap",
          }}
        >
          {[
            ["£13.6bn", "lost annually by UK SMEs from legal neglect"],
            ["10 mins", "to complete your free assessment"],
            ["85%+", "AI accuracy validated by M&A lawyers"],
          ].map(([stat, desc]) => (
            <div key={stat}>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  color: colors.black,
                }}
              >
                {stat}
              </div>
              <div
                style={{
                  fontSize: "0.825rem",
                  color: colors.gray400,
                  marginTop: "2px",
                  maxWidth: "160px",
                  lineHeight: 1.5,
                }}
              >
                {desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: colors.black, padding: "6rem 2.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "5rem",
              alignItems: "center",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: colors.gray400,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "1.5rem",
                }}
              >
                The Problem
              </p>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
                  fontWeight: 700,
                  color: colors.white,
                  lineHeight: 1.2,
                  marginBottom: "1.5rem",
                  letterSpacing: "-0.02em",
                }}
              >
                Buyers find the issues your lawyer never flagged.
              </h2>
              <p
                style={{
                  color: colors.gray400,
                  lineHeight: 1.8,
                  fontSize: "1rem",
                  fontWeight: 300,
                }}
              >
                During M&A due diligence, buyers scrutinise contracts and data
                privacy with forensic detail. A single change-of-control clause
                or IP ownership gap can reprice a deal by 20% — or kill it
                entirely.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {[
                ["Change of control clauses", "Give customers termination rights on acquisition"],
                ["Unsigned IP assignments", "Means you don't legally own your own product"],
                ["GDPR non-compliance", "Triggers buyer indemnity demands and price chips"],
                ["Non-assignable contracts", "Revenue can't transfer to the acquirer"],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "6px",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    gap: "1rem",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      background: "#C1392B",
                      borderRadius: "50%",
                      marginTop: "0.4rem",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div
                      style={{
                        color: colors.white,
                        fontWeight: 500,
                        fontSize: "0.9rem",
                        marginBottom: "0.2rem",
                      }}
                    >
                      {title}
                    </div>
                    <div
                      style={{
                        color: colors.gray400,
                        fontSize: "0.825rem",
                        lineHeight: 1.5,
                      }}
                    >
                      {desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "6rem 2.5rem", background: colors.offwhite }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <p
              style={{
                fontSize: "0.75rem",
                color: colors.gray400,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "1rem",
              }}
            >
              How It Works
            </p>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
                fontWeight: 700,
                color: colors.black,
                letterSpacing: "-0.02em",
              }}
            >
              Five Vital Signs of exit-readiness
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
              gap: "1rem",
            }}
          >
            {vitals.map((vital) => (
              <div
                key={vital.id}
                className="vital-card"
                style={{
                  background: colors.white,
                  border: `1px solid ${colors.gray100}`,
                  borderRadius: "8px",
                  padding: "1.75rem 1.5rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
                  {vital.icon}
                </div>
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 500,
                    fontSize: "0.95rem",
                    color: colors.black,
                    marginBottom: "0.4rem",
                  }}
                >
                  {vital.name}
                </div>
                <div style={{ fontSize: "0.8rem", color: colors.gray400, lineHeight: 1.5 }}>
                  {vital.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "6rem 2.5rem", background: colors.white }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
                fontWeight: 700,
                color: colors.black,
                letterSpacing: "-0.02em",
              }}
            >
              From assessment to action in days
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "2rem",
            }}
          >
            {[
              [
                "01",
                "Free Health Score",
                "Complete a 15-question assessment. Get your score and risk profile instantly — no account required.",
              ],
              [
                "02",
                "Upload Documents",
                "Upload your contracts, policies and agreements to your secure client portal.",
              ],
              [
                "03",
                "AI Analysis",
                "Our CardioCheck module analyses every clause from a buyer's perspective, flagging exit risks.",
              ],
              [
                "04",
                "Human Review",
                "Our M&A lawyers validate and annotate the AI findings before you see the final report.",
              ],
              [
                "05",
                "Remediation Plan",
                "Receive a prioritised action plan — ranked by deal impact — so you know exactly what to fix first.",
              ],
            ].map(([num, title, desc]) => (
              <div key={num}>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "2.5rem",
                    fontWeight: 900,
                    color: colors.gray100,
                    marginBottom: "0.5rem",
                  }}
                >
                  {num}
                </div>
                <div
                  style={{
                    fontWeight: 500,
                    fontSize: "0.95rem",
                    color: colors.black,
                    marginBottom: "0.5rem",
                  }}
                >
                  {title}
                </div>
                <div style={{ fontSize: "0.825rem", color: colors.gray400, lineHeight: 1.6 }}>
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "6rem 2.5rem", background: colors.offwhite }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 700,
              color: colors.black,
              marginBottom: "1.25rem",
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            Find out where you stand —<br />
            before a buyer does.
          </h2>
          <p
            style={{
              color: colors.gray600,
              marginBottom: "2.5rem",
              fontSize: "1rem",
              lineHeight: 1.7,
              fontWeight: 300,
            }}
          >
            Takes 10 minutes. No account needed. You'll receive a personalised Legal Health Score
            with a breakdown of your top risk areas.
          </p>
          <button
            onClick={() => onNavigate("assessment")}
            className="cta-btn"
            style={{
              background: colors.black,
              color: colors.white,
              border: "none",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "1rem",
              fontWeight: 500,
              padding: "1rem 2.5rem",
              borderRadius: "4px",
            }}
          >
            Start Free Assessment →
          </button>
        </div>
      </section>

      <footer
        style={{
          borderTop: `1px solid ${colors.gray100}`,
          padding: "2.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: "0.95rem",
            color: colors.black,
          }}
        >
          VitalSigns
        </div>
        <div style={{ fontSize: "0.8rem", color: colors.gray400 }}>
          © 2026 VitalSigns. AI-assisted, human-verified legal health diagnostics.
        </div>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["Privacy", "Terms", "Contact"].map((label) => (
            <span
              key={label}
              style={{ fontSize: "0.8rem", color: colors.gray400, cursor: "pointer" }}
            >
              {label}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default function VitalSignsLanding() {
  const router = useRouter();
  const onNavigate = useMemo(() => {
    const mapping: Record<NavTarget, string> = {
      landing: "/",
      assessment: "/assessment",
      login: "/login",
      register: "/register",
      dashboard: "/dashboard",
    };
    return (target: NavTarget) => router.push(mapping[target]);
  }, [router]);

  return (
    <>
      <Navbar onNavigate={onNavigate} />
      <Landing onNavigate={onNavigate} />
    </>
  );
}

