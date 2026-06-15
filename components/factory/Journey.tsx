export function Journey() {
  return (
    <section id="journey">
      <div id="stage">
        <div id="wallFar" />
        <div id="world" aria-hidden="true">
          {/* lamps along the line */}
          <div className="lamp" style={{ left: "30vw" }} />
          <div className="lamp" style={{ left: "75vw" }} />
          <div className="lamp" style={{ left: "120vw" }} />
          <div className="lamp" style={{ left: "175vw" }} />
          <div className="lamp" style={{ left: "480vw" }} />
          <div className="lamp" style={{ left: "540vw" }} />
          <div className="lamp" style={{ left: "610vw" }} />
          <div className="lamp" style={{ left: "690vw" }} />

          {/* ZONE: INTAKE */}
          <div className="bigsign" style={{ left: "26vw" }}>INSTINCT</div>
          <div className="zone-plate" style={{ left: "30vw" }}>
            <span className="num">01</span>
            <span className="lbl">Intake — Everyone starts here</span>
          </div>
          <div className="crate" data-l="RAW INSTINCT" style={{ left: "55vw" }} />
          <div className="crate" data-l="EXCUSES" style={{ left: "62vw", bottom: "170px" }} />
          <div className="crate" data-l="BAD HABITS" style={{ left: "64vw" }} />

          {/* companion animals */}
          <div className="beast" style={{ left: "88vw" }}>
            <svg width="90" height="52" viewBox="0 0 90 52">
              <g fill="#0e1c2c" stroke="#2a4a68" strokeWidth="2">
                <ellipse cx="48" cy="36" rx="30" ry="14" />
                <circle cx="16" cy="34" r="12" />
                <path d="M8 26 L4 14 L14 22 Z" />
                <path d="M24 26 L28 14 L18 22 Z" />
                <path d="M76 34 Q88 28 86 20" fill="none" strokeWidth="4" />
              </g>
              <path d="M11 34 q3 3 8 0" stroke="#8fd8f8" fill="none" strokeWidth="2" />
            </svg>
            <div className="shadow" />
            <span className="zzz" style={{ left: 0, top: "-18px" }}>z</span>
            <span className="zzz" style={{ left: "12px", top: "-28px", animationDelay: ".7s" }}>Z</span>
          </div>
          <div className="beast wob" style={{ left: "112vw" }}>
            <svg width="74" height="80" viewBox="0 0 74 80">
              <g fill="#0e1c2c" stroke="#2a4a68" strokeWidth="2">
                <circle cx="37" cy="22" r="14" />
                <circle cx="24" cy="20" r="6" />
                <circle cx="50" cy="20" r="6" />
                <ellipse cx="37" cy="54" rx="17" ry="20" />
                <path d="M20 48 Q6 40 8 28" fill="none" strokeWidth="5" />
                <path d="M54 48 Q70 42 68 30" fill="none" strokeWidth="5" />
              </g>
              <circle cx="32" cy="20" r="2.5" fill="#8fd8f8" />
              <circle cx="42" cy="20" r="2.5" fill="#8fd8f8" />
            </svg>
            <div className="shadow" />
          </div>
          <div className="beast" style={{ left: "146vw" }}>
            <svg width="96" height="74" viewBox="0 0 96 74">
              <g fill="#0e1c2c" stroke="#2a4a68" strokeWidth="2">
                <ellipse cx="50" cy="48" rx="30" ry="16" />
                <rect x="26" y="56" width="6" height="16" />
                <rect x="42" y="58" width="6" height="14" />
                <rect x="60" y="58" width="6" height="14" />
                <rect x="72" y="56" width="6" height="16" />
                <path d="M76 44 Q90 36 88 22" />
                <circle cx="86" cy="18" r="10" />
                <path d="M80 10 L76 -2 L84 6 Z" />
                <path d="M92 10 L96 -2 L88 6 Z" />
              </g>
              <circle cx="89" cy="16" r="2.5" fill="#ff7a2f" />
            </svg>
            <div className="shadow" />
          </div>
          <div className="beast wob" style={{ left: "182vw", animationDuration: "1.6s" }}>
            <svg width="56" height="60" viewBox="0 0 56 60">
              <g fill="#0e1c2c" stroke="#2a4a68" strokeWidth="2">
                <ellipse cx="28" cy="38" rx="14" ry="18" />
                <circle cx="28" cy="16" r="9" />
                <path d="M35 14 L50 17 L35 21 Z" fill="#ff7a2f" stroke="#7a3b12" />
                <path d="M16 34 Q4 40 8 50" fill="none" strokeWidth="3" />
                <line x1="24" y1="56" x2="24" y2="60" strokeWidth="3" />
                <line x1="32" y1="56" x2="32" y2="60" strokeWidth="3" />
              </g>
              <circle cx="31" cy="14" r="2" fill="#8fd8f8" />
            </svg>
            <div className="shadow" />
          </div>

          {/* ZONE: MACHINE EXTERIOR */}
          <div id="machineExt">
            <div className="title">DISCIPLINE ENGINE</div>
            <div className="subtitle">// NO MAGIC — ONLY REPS //</div>
            <div className="mouth" />
            <div className="mouth exit" />
            <div className="stack" style={{ left: "18%" }} />
            <div className="stack" style={{ left: "48%", height: "130px", top: "-120px" }} />
            <div className="stack" style={{ left: "76%" }} />
            <div className="warnlight" style={{ left: "10%" }} />
            <div className="warnlight" style={{ left: "90%", animationDelay: ".8s" }} />
            <div className="vent" style={{ top: "30%", left: "38%" }} />
            <div className="vent" style={{ top: "46%", left: "55%" }} />
            <div className="stripes" />
          </div>
          <div className="bigsign" style={{ left: "250vw", color: "rgba(255,122,47,.13)" }}>DISCIPLINE</div>

          {/* ZONE: OUTPUT */}
          <div className="bigsign" style={{ left: "475vw" }}>OUTPUT</div>
          <div className="zone-plate" style={{ left: "480vw" }}>
            <span className="num">02</span>
            <span className="lbl">Output — Only humans leave</span>
          </div>
          <div className="beast" style={{ left: "560vw" }}>
            <svg width="60" height="104" viewBox="0 0 60 104">
              <g fill="#16314c" stroke="#3f7ca8" strokeWidth="2">
                <circle cx="30" cy="13" r="11" />
                <path d="M21 26 H39 L43 62 H17 Z" />
                <line x1="20" y1="32" x2="9" y2="54" strokeWidth="5" />
                <line x1="40" y1="32" x2="51" y2="54" strokeWidth="5" />
                <line x1="24" y1="62" x2="19" y2="98" strokeWidth="6" />
                <line x1="36" y1="62" x2="41" y2="98" strokeWidth="6" />
              </g>
            </svg>
            <div className="shadow" />
          </div>
          <div className="beast" style={{ left: "600vw" }}>
            <svg width="60" height="104" viewBox="0 0 60 104">
              <g fill="#16314c" stroke="#3f7ca8" strokeWidth="2">
                <circle cx="30" cy="13" r="11" />
                <path d="M21 26 H39 L43 62 H17 Z" />
                <line x1="20" y1="32" x2="14" y2="56" strokeWidth="5" />
                <line x1="40" y1="32" x2="49" y2="50" strokeWidth="5" />
                <line x1="24" y1="62" x2="16" y2="98" strokeWidth="6" />
                <line x1="36" y1="62" x2="44" y2="96" strokeWidth="6" />
              </g>
            </svg>
            <div className="shadow" />
          </div>
          {/* end wall */}
          <div className="zone-plate" style={{ left: "700vw", top: "36%" }}>
            <span className="num">◈</span>
            <span className="lbl">Proceed to evaluation floor ▼</span>
          </div>
        </div>

        {/* machine interior overlay */}
        <div id="interior" aria-hidden="true">
          <div className="ribs" />
          <div className="piston" style={{ left: "16%" }} />
          <div className="piston" style={{ left: "38%" }} />
          <div className="piston" style={{ left: "60%" }} />
          <div className="piston" style={{ left: "82%" }} />
          <div className="gauge">
            <div className="pct" id="asmPct">0%</div>
            <div className="glabel">Assembly progress</div>
          </div>
          <div className="readout" id="readout">
            BOOT SEQUENCE...
            <br />
            SUBJECT: CANIS-0451
          </div>
        </div>
        <div id="scanline" />

        {/* the hero character */}
        <div id="charLayer" aria-hidden="true">
          <div className="shadow" />
          {/* DOG */}
          <div className="form on" id="fDog">
            <svg width="150" height="110" viewBox="0 0 150 110">
              <g className="leg"><rect x="48" y="72" width="9" height="34" rx="4" fill="#0e1c2c" stroke="#2a4a68" strokeWidth="2" /></g>
              <g className="leg b"><rect x="64" y="72" width="9" height="34" rx="4" fill="#0e1c2c" stroke="#2a4a68" strokeWidth="2" /></g>
              <g className="leg b"><rect x="96" y="72" width="9" height="34" rx="4" fill="#0e1c2c" stroke="#2a4a68" strokeWidth="2" /></g>
              <g className="leg"><rect x="112" y="72" width="9" height="34" rx="4" fill="#0e1c2c" stroke="#2a4a68" strokeWidth="2" /></g>
              <g className="tail"><path d="M128 60 Q146 50 144 34" fill="none" stroke="#2a4a68" strokeWidth="6" strokeLinecap="round" /></g>
              <ellipse cx="86" cy="62" rx="46" ry="22" fill="#0e1c2c" stroke="#2a4a68" strokeWidth="2.5" />
              <circle cx="34" cy="46" r="18" fill="#0e1c2c" stroke="#2a4a68" strokeWidth="2.5" />
              <path d="M22 34 L16 16 L32 28 Z" fill="#0e1c2c" stroke="#2a4a68" strokeWidth="2" />
              <path d="M44 32 L52 16 L34 26 Z" fill="#0e1c2c" stroke="#2a4a68" strokeWidth="2" />
              <ellipse cx="20" cy="50" rx="9" ry="6" fill="#0e1c2c" stroke="#2a4a68" strokeWidth="2" />
              <circle cx="13" cy="49" r="3" fill="#8fd8f8" />
              <circle cx="30" cy="44" r="3" fill="#8fd8f8" />
              <path d="M18 56 q5 4 11 1" stroke="#8fd8f8" fill="none" strokeWidth="2" />
            </svg>
          </div>
          {/* WIREFRAME / ASSEMBLY */}
          <div className="form" id="fWire" style={{ transform: "translateX(-50%)" }}>
            <svg width="120" height="150" viewBox="0 0 120 150">
              <g fill="none" stroke="#8fd8f8" strokeWidth="2" opacity=".95">
                <circle cx="60" cy="22" r="16" strokeDasharray="6 5" />
                <path d="M44 44 H76 L82 96 H38 Z" strokeDasharray="7 5" />
                <line x1="43" y1="52" x2="22" y2="84" strokeDasharray="6 5" />
                <line x1="77" y1="52" x2="98" y2="84" strokeDasharray="6 5" />
                <line x1="48" y1="96" x2="42" y2="144" strokeDasharray="6 5" />
                <line x1="72" y1="96" x2="78" y2="144" strokeDasharray="6 5" />
              </g>
              <g className="bolt"><circle cx="60" cy="22" r="4" fill="#ff7a2f" /></g>
              <circle cx="44" cy="48" r="3.5" fill="#ff7a2f" />
              <circle cx="76" cy="48" r="3.5" fill="#ff7a2f" />
              <circle cx="48" cy="96" r="3.5" fill="#ff7a2f" />
              <circle cx="72" cy="96" r="3.5" fill="#ff7a2f" />
              <rect x="50" y="58" width="20" height="14" fill="rgba(143,216,248,.18)" stroke="#8fd8f8" />
            </svg>
          </div>
          {/* HUMAN */}
          <div className="form" id="fHuman">
            <svg width="110" height="150" viewBox="0 0 110 150">
              <g className="arm"><line x1="38" y1="56" x2="24" y2="92" stroke="#3f7ca8" strokeWidth="8" strokeLinecap="round" /></g>
              <g className="arm b"><line x1="72" y1="56" x2="86" y2="92" stroke="#3f7ca8" strokeWidth="8" strokeLinecap="round" /></g>
              <g className="legH"><line x1="46" y1="100" x2="38" y2="146" stroke="#3f7ca8" strokeWidth="9" strokeLinecap="round" /></g>
              <g className="legH b"><line x1="64" y1="100" x2="72" y2="146" stroke="#3f7ca8" strokeWidth="9" strokeLinecap="round" /></g>
              <circle cx="55" cy="22" r="15" fill="#eaf6ff" stroke="#2e8fc7" strokeWidth="2.5" />
              <path d="M40 40 H70 L76 102 H34 Z" fill="#eaf6ff" stroke="#2e8fc7" strokeWidth="2.5" />
              <path d="M47 52 L55 62 L66 46" fill="none" stroke="#2e8fc7" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* sparks */}
        <div className="spark" style={{ left: "46%", bottom: "200px" }} />
        <div className="spark o" style={{ left: "52%", bottom: "240px" }} />
        <div className="spark" style={{ left: "56%", bottom: "180px" }} />
        <div className="spark o" style={{ left: "44%", bottom: "260px" }} />
        <div className="spark" style={{ left: "50%", bottom: "300px" }} />
        <div className="spark o" style={{ left: "58%", bottom: "220px" }} />

        {/* treatment props */}
        <div id="shockFx">
          <svg width="220" height="170" viewBox="0 0 220 170">
            <g fill="none" stroke="#8fd8f8" strokeWidth="3" strokeLinejoin="round">
              <path d="M30 10 L48 52 L34 54 L58 100" />
              <path d="M190 16 L168 60 L182 62 L156 104" />
              <path d="M110 0 L104 34 L118 36 L106 72" />
            </g>
            <g fill="none" stroke="#ff7a2f" strokeWidth="2" opacity=".8">
              <path d="M64 26 L76 56 L66 58 L82 88" />
              <path d="M150 22 L140 50 L150 52 L138 82" />
            </g>
          </svg>
        </div>
        <div id="shameSign">
          <div className="chains"><i /><i /></div>
          <div className="board">
            <div className="bt">REPLAY: 0 / 14 / 2</div>
            <div className="bs">Mid lane. Everyone saw it. Twice.</div>
          </div>
        </div>
        <span className="haha" style={{ left: "38%", bottom: "300px" }}>HA HA</span>
        <span className="haha" style={{ left: "60%", bottom: "340px" }}>LOL</span>
        <span className="haha" style={{ left: "55%", bottom: "260px" }}>REPORTED</span>
        <div id="board">
          <div className="bh">LECTURE 101 — BASICS</div>
          <ul>
            <li>Wards exist. Buy them.</li>
            <li>The map has a second half.</li>
            <li className="no">Chasing kills into fog.</li>
            <li className="no">Blaming the support.</li>
            <li>Pulling. Stacking. Patience.</li>
          </ul>
        </div>
        <div id="qcStamp">★ CERTIFIED HUMAN ★</div>

        {/* captions */}
        <div className="cap" id="cap1">
          <div className="k">// Chamber 01 — Instinct</div>
          <div className="t">Everyone starts <span className="o">here.</span></div>
        </div>
        <div className="cap" id="cap2">
          <div className="k">// Chamber 02 — Discipline</div>
          <div className="t">The machine doesn&apos;t change you.<br /><span className="o">Your reps do.</span></div>
        </div>
        <div className="cap right" id="cap3">
          <div className="k">// Chamber 03 — Output</div>
          <div className="t">Not superheroes. Not gods.<br /><span className="o">Humans.</span></div>
        </div>

        <div id="beltStrip"><div className="edge" /><div className="rollers" /></div>
      </div>
    </section>
  );
}
