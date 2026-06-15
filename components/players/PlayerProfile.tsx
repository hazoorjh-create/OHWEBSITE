"use client";

import { useState } from "react";
import type { ProfileData } from "@/lib/profile";
import { Avatar } from "./Avatar";

const fdur = (s: number) => (s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : "—");
const fdate = (ts: number) =>
  ts ? new Date(ts * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

function Pip({ s }: { s: string }) {
  return (
    <span className="l10">
      {[...(s || "")].slice(-10).map((c, i) => (
        <i className={c} key={i} />
      ))}
    </span>
  );
}

type Tab = "overview" | "matches" | "heroes" | "mmr";

function Overview({ p }: { p: ProfileData }) {
  const s = p.stats;
  if (!s) return <div className="empty">NO INHOUSE RECORD YET — JOIN THE QUEUE, FEED THE MACHINE</div>;
  return (
    <>
      <div className="grid">
        <div className="stat"><div className="k">MMR</div><div className="v ice">{s.mmr.toLocaleString()}</div></div>
        <div className="stat"><div className="k">Peak MMR</div><div className="v">{s.peak.toLocaleString()}</div></div>
        <div className="stat"><div className="k">Wins</div><div className="v good">{s.wins}</div></div>
        <div className="stat"><div className="k">Losses</div><div className="v bad">{s.losses}</div></div>
        <div className="stat"><div className="k">Win rate</div><div className="v">{s.wr}%</div></div>
        <div className="stat"><div className="k">Total matches</div><div className="v">{s.games}</div></div>
        <div className="stat"><div className="k">Streak</div><div className={`v ${s.streak >= 0 ? "good" : "bad"}`}>{s.streak > 0 ? "+" + s.streak : s.streak}</div></div>
        <div className="stat"><div className="k">Ladder rank</div><div className="v or">{s.rank ? "#" + s.rank : "—"} <sub>of {s.rank_of}</sub></div></div>
      </div>
      <div style={{ marginTop: "18px", fontFamily: "'Chakra Petch',sans-serif", fontWeight: 600, fontSize: "14px", color: "var(--dim)" }}>
        LAST 10: <Pip s={s.last10} />
      </div>
      {p.predictions ? (
        <div className="grid" style={{ marginTop: "18px" }}>
          <div className="stat"><div className="k">Prediction points</div><div className="v or">{p.predictions.points}</div></div>
          <div className="stat"><div className="k">Correct</div><div className="v good">{p.predictions.correct}</div></div>
          <div className="stat"><div className="k">Wrong</div><div className="v bad">{p.predictions.wrong}</div></div>
          <div className="stat"><div className="k">Prediction streak</div><div className="v">{p.predictions.streak}</div></div>
        </div>
      ) : null}
    </>
  );
}

function Matches({ p }: { p: ProfileData }) {
  if (!p.matches || !p.matches.length) {
    return <div className="empty">{p.steam ? "NO LEAGUE MATCHES IN THE ARCHIVE YET" : "STEAM NOT LINKED — NO MATCH DATA"}</div>;
  }
  return (
    <div className="tbl">
      <div className="tr m head">
        <span>Hero</span>
        <span>Result</span>
        <span style={{ textAlign: "right" }}>KDA</span>
        <span style={{ textAlign: "right" }}>GPM/XPM</span>
        <span style={{ textAlign: "right" }}>Duration</span>
        <span style={{ textAlign: "right" }}>Date</span>
        <span />
      </div>
      {p.matches.map((m) => (
        <div className="tr m" key={m.match_id}>
          <span className="hcell">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.img} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
            <span>{m.hero}</span>
          </span>
          <span>
            <span className={`pill ${m.won ? "w" : "l"}`}>{m.won ? "WIN" : "LOSS"}</span>
          </span>
          <span className="num">{m.k}/{m.d}/{m.a}</span>
          <span className="num">{m.gpm}/{m.xpm}</span>
          <span className="dimnum">{fdur(m.dur)}</span>
          <span className="dimnum">{fdate(m.ts)}</span>
          <a className="db" href={`https://www.dotabuff.com/matches/${m.match_id}`} target="_blank" rel="noopener">
            ↗
          </a>
        </div>
      ))}
    </div>
  );
}

function Heroes({ p }: { p: ProfileData }) {
  if (!p.heroes || !p.heroes.length) {
    return <div className="empty">{p.steam ? "NO HERO DATA YET" : "STEAM NOT LINKED — NO HERO DATA"}</div>;
  }
  return (
    <div className="tbl">
      <div className="tr h head">
        <span>Hero</span>
        <span style={{ textAlign: "right" }}>Games</span>
        <span style={{ textAlign: "right" }}>W–L</span>
        <span style={{ textAlign: "right" }}>Avg KDA</span>
        <span style={{ textAlign: "right" }}>Win%</span>
      </div>
      {p.heroes.map((h, i) => (
        <div className="tr h" key={i}>
          <span className="hcell">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={h.img} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
            <span>{h.name}</span>
          </span>
          <span className="num">{h.games}</span>
          <span className="dimnum">{h.wins}–{h.losses}</span>
          <span className="dimnum">{h.kda}</span>
          <span className="num" style={{ color: h.wr >= 50 ? "var(--good)" : "var(--bad)" }}>{h.wr}%</span>
        </div>
      ))}
    </div>
  );
}

function MmrChart({ p }: { p: ProfileData }) {
  const hist = p.mmr_history || [];
  if (hist.length < 2) return <div className="empty">NOT ENOUGH GAMES FOR A CHART YET</div>;
  const W = 900, H = 260, PAD = 34;
  const vals = hist.map((h) => h.mmr);
  const lo = Math.min(...vals) - 20;
  const hi = Math.max(...vals) + 20;
  const x = (i: number) => PAD + (i * (W - PAD * 2)) / (hist.length - 1);
  const y = (v: number) => H - PAD - ((v - lo) * (H - PAD * 2)) / (hi - lo || 1);
  const pts = hist.map((h, i) => `${x(i).toFixed(1)},${y(h.mmr).toFixed(1)}`).join(" ");
  const area = `${PAD},${H - PAD} ${pts} ${x(hist.length - 1).toFixed(1)},${H - PAD}`;
  const last = hist[hist.length - 1];

  return (
    <div id="chartBox">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="MMR over time">
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
          const v = Math.round(lo + (hi - lo) * f);
          const yy = y(v).toFixed(1);
          return (
            <g key={i}>
              <line x1={PAD} y1={yy} x2={W - PAD} y2={yy} stroke="rgba(28,58,87,.5)" />
              <text x={PAD - 8} y={yy} textAnchor="end" dominantBaseline="middle" fill="#5d7990" fontSize="10" fontFamily="Share Tech Mono">
                {v}
              </text>
            </g>
          );
        })}
        <polygon points={area} fill="rgba(46,143,199,.12)" />
        <polyline points={pts} fill="none" stroke="#8fd8f8" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx={x(hist.length - 1).toFixed(1)} cy={y(last.mmr).toFixed(1)} r="5" fill="#ff7a2f" />
        <text x={x(hist.length - 1).toFixed(1)} y={(y(last.mmr) - 12).toFixed(1)} textAnchor="end" fill="#cfeeff" fontSize="12" fontFamily="Russo One">
          {last.mmr}
        </text>
      </svg>
      <div className="deltas">
        {hist
          .slice(-15)
          .reverse()
          .map((h, i) => (
            <span className={`delta ${h.delta >= 0 ? "up" : "down"}`} key={i}>
              {h.delta >= 0 ? "+" : ""}
              {h.delta} · {h.ts.slice(5, 10)}
            </span>
          ))}
      </div>
    </div>
  );
}

export function PlayerProfile({ p }: { p: ProfileData }) {
  const [tab, setTab] = useState<Tab>("overview");
  const s = p.stats;

  const badges: React.ReactNode[] = [];
  if (p.dota_rank) badges.push(<span className="badge rank" key="dr">{p.dota_rank}</span>);
  if (s)
    badges.push(
      s.calibration_left ? (
        <span className="badge uncal" key="cal">Calibrating · {s.calibration_left} left</span>
      ) : (
        <span className="badge cal" key="cal">Calibrated</span>
      ),
    );
  if (s && s.rank) badges.push(<span className="badge uncal" key="rk">Ladder #{s.rank} / {s.rank_of}</span>);
  if (p.steam) {
    badges.push(<a className="badge btn" key="sp" href={p.steam.profile_url} target="_blank" rel="noopener">Steam Profile ↗</a>);
    badges.push(<a className="badge btn" key="db" href={p.steam.dotabuff_url} target="_blank" rel="noopener">Dotabuff ↗</a>);
    badges.push(<a className="badge btn" key="od" href={p.steam.opendota_url} target="_blank" rel="noopener">OpenDota ↗</a>);
  } else {
    badges.push(<span className="badge uncal" key="ns">Steam not linked</span>);
  }

  const tabs: [Tab, string][] = [
    ["overview", "Overview"],
    ["matches", "Matches"],
    ["heroes", "Heroes"],
    ["mmr", "MMR History"],
  ];

  return (
    <>
      <a className="backlink" href="/players">
        ← All players
      </a>
      <div className="phead">
        <div className="bigava">
          <Avatar src={p.avatar} name={p.name} />
        </div>
        <div>
          <div className="kicker">Operative file{p.steam ? " · ID " + p.steam.account_id : ""}</div>
          <h1>{p.name}</h1>
        </div>
      </div>
      <div className="badges">{badges}</div>
      <div className="tabs">
        {tabs.map(([key, label]) => (
          <span key={key} className={`tab ${tab === key ? "on" : ""}`} onClick={() => setTab(key)}>
            {label}
          </span>
        ))}
      </div>
      <div>
        {tab === "overview" && <Overview p={p} />}
        {tab === "matches" && <Matches p={p} />}
        {tab === "heroes" && <Heroes p={p} />}
        {tab === "mmr" && <MmrChart p={p} />}
      </div>
    </>
  );
}
