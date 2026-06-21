"use client";

import "@/app/players.css";
import { heroName, heroImg } from "@/lib/heroes";
import type { MatchDetails, MatchPlayer } from "@/lib/match";
import Link from "next/link";

const fmtDur = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function PlayerRow({ p }: { p: MatchPlayer }) {
  return (
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <td style={{ width: "32px", padding: "6px 4px" }}>
        {p.hero_id ? (
          <img
            src={heroImg(p.hero_id)}
            alt={heroName(p.hero_id)}
            title={heroName(p.hero_id)}
            style={{ width: "32px", height: "auto", display: "block", borderRadius: "3px" }}
          />
        ) : (
          <div style={{ width: "32px", height: "18px", background: "#333", borderRadius: "3px" }} />
        )}
      </td>
      <td style={{ padding: "6px", fontFamily: "var(--font-main)" }}>
        <Link href={`/player/${p.account_id}`} style={{ textDecoration: "none", color: "inherit", fontWeight: 600 }}>
          {p.name}
        </Link>
      </td>
      <td style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "14px" }}>{p.kills}</td>
      <td style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "14px", color: "var(--bad)" }}>{p.deaths}</td>
      <td style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "14px" }}>{p.assists}</td>
      <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: "14px" }}>{(p.net_worth/1000).toFixed(1)}k</td>
      <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: "14px", color: "var(--orange)" }}>{p.gpm}</td>
      <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: "14px", color: "var(--ice)" }}>{p.xpm}</td>
      <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: "14px" }}>{(p.hero_damage/1000).toFixed(1)}k</td>
    </tr>
  );
}

function TeamTable({ name, score, win, players }: { name: string; score: number; win: boolean; players: MatchPlayer[] }) {
  const isRad = name === "RADIANT";
  const color = isRad ? "var(--good)" : "var(--bad)";
  return (
    <div style={{ flex: "1 1 48%", minWidth: "400px", marginBottom: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: `2px solid ${color}`, paddingBottom: "10px", marginBottom: "10px" }}>
        <div>
          <h2 style={{ margin: 0, color, fontFamily: "var(--font-display)", letterSpacing: "0.1em", fontSize: "20px" }}>
            {win && "🏆 "} {name}
          </h2>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "24px", color }}>
          {score}
        </div>
      </div>
      
      <div style={{ background: "rgba(10,22,38,0.5)", border: "1px solid rgba(46,143,199,0.2)", borderRadius: "6px", padding: "10px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "var(--dim)", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.05em", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <th style={{ width: "32px", padding: "8px 4px" }}></th>
              <th style={{ textAlign: "left", padding: "8px 6px" }}>PLAYER</th>
              <th style={{ textAlign: "center", width: "30px" }}>K</th>
              <th style={{ textAlign: "center", width: "30px" }}>D</th>
              <th style={{ textAlign: "center", width: "30px" }}>A</th>
              <th style={{ textAlign: "right", width: "50px" }}>NET</th>
              <th style={{ textAlign: "right", width: "40px" }}>GPM</th>
              <th style={{ textAlign: "right", width: "40px" }}>XPM</th>
              <th style={{ textAlign: "right", width: "50px" }}>DMG</th>
            </tr>
          </thead>
          <tbody>
            {players.map(p => <PlayerRow key={p.account_id} p={p} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Scoreboard({ match }: { match: MatchDetails }) {
  const radiant = match.players.filter(p => p.team === "radiant");
  const dire = match.players.filter(p => p.team === "dire");

  const date = new Date(match.start_time * 1000).toLocaleString(undefined, { 
    dateStyle: "medium", timeStyle: "short" 
  });

  return (
    <div className="inner" style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: "50px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "42px", margin: "0 0 10px 0" }}>
          MATCH {match.match_id}
        </h1>
        <div style={{ fontFamily: "var(--font-mono)", color: "var(--ice)", letterSpacing: "0.1em" }}>
          {match.radiant_win ? "RADIANT" : "DIRE"} VICTORY · {fmtDur(match.duration)} · {date}
        </div>
        <div style={{ marginTop: "20px" }}>
          <a className="btn ghost" href={`https://www.dotabuff.com/matches/${match.match_id}`} target="_blank" rel="noopener">
            View on Dotabuff ↗
          </a>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center" }}>
        <TeamTable 
          name="RADIANT" 
          score={match.radiant_score} 
          win={match.radiant_win} 
          players={radiant} 
        />

        <TeamTable 
          name="DIRE" 
          score={match.dire_score} 
          win={!match.radiant_win} 
          players={dire} 
        />
      </div>
    </div>
  );
}
