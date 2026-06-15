import { LogoSvg } from "./LogoSvg";

export function Hero() {
  return (
    <section id="hero">
      <div className="sky" />
      <div className="grid" />
      <div id="facWrap">
        <svg viewBox="0 0 1100 320" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <linearGradient id="fwall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#16314c" />
              <stop offset="1" stopColor="#0a1626" />
            </linearGradient>
            <linearGradient id="fglass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8fd8f8" stopOpacity=".55" />
              <stop offset="1" stopColor="#2e8fc7" stopOpacity=".12" />
            </linearGradient>
          </defs>
          <rect x="60" y="120" width="60" height="200" fill="url(#fwall)" stroke="#1c3a57" />
          <rect x="980" y="100" width="60" height="220" fill="url(#fwall)" stroke="#1c3a57" />
          <rect x="72" y="96" width="36" height="24" fill="#13283f" stroke="#1c3a57" />
          <rect x="992" y="76" width="36" height="24" fill="#13283f" stroke="#1c3a57" />
          <rect x="140" y="170" width="820" height="150" fill="url(#fwall)" stroke="#1c3a57" />
          <polygon points="140,170 550,90 960,170" fill="#122c46" stroke="#1c3a57" />
          <rect x="170" y="200" width="760" height="44" fill="url(#fglass)" stroke="#2e8fc7" strokeOpacity=".6" />
          <g stroke="#0d2033" strokeWidth="2">
            <line x1="265" y1="200" x2="265" y2="244" />
            <line x1="360" y1="200" x2="360" y2="244" />
            <line x1="455" y1="200" x2="455" y2="244" />
            <line x1="550" y1="200" x2="550" y2="244" />
            <line x1="645" y1="200" x2="645" y2="244" />
            <line x1="740" y1="200" x2="740" y2="244" />
            <line x1="835" y1="200" x2="835" y2="244" />
          </g>
          <rect x="520" y="262" width="60" height="58" fill="#05090f" stroke="#2e8fc7" />
          <line x1="550" y1="262" x2="550" y2="320" stroke="#1c3a57" />
          <rect x="300" y="120" width="26" height="50" fill="#13283f" stroke="#1c3a57" />
          <rect x="760" y="116" width="26" height="54" fill="#13283f" stroke="#1c3a57" />
          <line x1="550" y1="90" x2="550" y2="56" stroke="#1c3a57" strokeWidth="3" />
          <circle cx="550" cy="52" r="5" fill="#ff7a2f">
            <animate attributeName="opacity" values="1;.2;1" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
      <div id="doorGlow" />
      <div className="steam" style={{ left: "27%", bottom: "240px" }} />
      <div className="steam" style={{ left: "68%", bottom: "250px", animationDelay: "2.2s" }} />
      <div id="heroTop">
        <div className="logo">
          <LogoSvg idPrefix="hero" />
        </div>
        <h1>ONLYHUMANS</h1>
        <div className="slogan">&quot;NO SHORTCUTS.&quot;</div>
        <div className="sub">◈ HUMAN MANUFACTURING FACILITY // SCROLL TO ENTER THE LINE</div>
      </div>
      <div className="cue">▼ Scroll — the belt is moving ▼</div>
    </section>
  );
}
