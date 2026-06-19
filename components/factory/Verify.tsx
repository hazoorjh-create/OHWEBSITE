import { LogoSvg } from "./LogoSvg";

const DISCORD_PATH =
  "M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z";

export function Verify() {
  return (
    <section id="verify">
      <div id="verifyStage">
        <div className="vinner">
          <div id="vTitle">
            <div id="vLogo" style={{ width: "min(150px,34vw)", margin: "0 auto 10px", opacity: 0, filter: "drop-shadow(0 8px 30px rgba(46,143,199,.5))" }}>
              <img src="/logo_v2.png" alt="ONLYHUMANS Verified" style={{ width: "100%", height: "auto", display: "block" }} />
            </div>
            <div className="plaque" style={{ marginBottom: "14px" }}>
              <span className="num">07</span>
              <span className="lbl">Final Chamber — Verification</span>
            </div>
            <h2 style={{ fontSize: "clamp(30px,4.4vw,52px)", color: "#fff", textTransform: "uppercase" }}>
              Humanity <span style={{ color: "var(--orange)" }}>Verified</span>
            </h2>
          </div>
          <div id="gate">
            <svg id="vShield" viewBox="0 0 56 76">
              <path d="M28 0 L56 10 L54 38 C53 56 42 66 28 72 C14 66 3 56 2 38 L0 10 Z" fill="#3f9bd4" stroke="#0d2033" strokeWidth="4" />
              <path d="M14 34 L24 46 L43 22" fill="none" stroke="#06121f" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="frame" />
            <div className="doors">
              <div className="door l" />
              <div className="door r" />
            </div>
            <div className="glow" />
            <div id="vBeam" />
            <div id="vHuman">
              <svg width="70" height="112" viewBox="0 0 74 120">
                <g fill="#eaf6ff" stroke="#2e8fc7" strokeWidth="2">
                  <circle cx="37" cy="16" r="13" />
                  <path d="M26 32 H48 L52 72 H22 Z" />
                  <line x1="25" y1="40" x2="10" y2="62" strokeWidth="6" />
                  <line x1="49" y1="40" x2="64" y2="62" strokeWidth="6" />
                  <line x1="30" y1="72" x2="26" y2="112" strokeWidth="7" />
                  <line x1="44" y1="72" x2="48" y2="112" strokeWidth="7" />
                </g>
              </svg>
            </div>
          </div>
          <div id="verdict" className="mono" />
          <div>
            <span id="vStamp">★ CERTIFIED HUMAN ★</span>
          </div>
          <div className="final-ctas">
            <a className="btn discord" href="https://discord.gg/md6Pkv4867" target="_blank" rel="noopener">
              <svg width="22" height="17" viewBox="0 0 127 96" fill="#fff">
                <path d={DISCORD_PATH} />
              </svg>
              Join the Discord
            </a>
            <a className="btn lb" href="#lift">
              Leaderboard
            </a>
          </div>
        </div>
        <div id="vfooter">ONLYHUMANS © 2026 — NO SHORTCUTS — NO BOTS — NO EXCUSES</div>
      </div>
    </section>
  );
}
