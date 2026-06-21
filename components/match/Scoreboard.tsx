"use client";

import "@/app/players.css";
import { heroName, heroImg } from "@/lib/heroes";
import type { MatchDetails, MatchPlayer } from "@/lib/match";
import Link from "next/link";

const fmtDur = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function PlayerRow({ p }: { p: MatchPlayer }) {
  return (
    <tr className="br">
      <td style={{ width: "40px", padding: "4px" }}>
        {p.hero_id ? (
          <img
            src={heroImg(p.hero_id)}
            alt={heroName(p.hero_id)}
            title={heroName(p.hero_id)}
            style={{ width: "40px", height: "auto", display: "block", borderRadius: "3px" }}
          />
        ) : (
          <div style={{ width: "40px", height: "22px", background: "#333", borderRadius: "3px" }} />
        )}
      </td>
      <td className="nm">
        <Link href={`/player/${p.account_id}`} style={{ textDecoration: "none", color: "inherit" }}>
          {p.name}
        </Link>
      </td>
      <td className="mono2" style={{ textAlign: "center" }}>{p.kills}</td>
      <td className="mono2" style={{ textAlign: "center", color: "var(--bad)" }}>{p.deaths}</td>
      <td className="mono2" style={{ textAlign: "center" }}>{p.assists}</td>
      <td className="mono2" style={{ textAlign: "right" }}>{p.net_worth.toLocaleString()}</td>
      <td className="mono2" style={{ textAlign: "right", color: "var(--orange)" }}>{p.gpm}</td>
      <td className="mono2" style={{ textAlign: "right", color: "var(--ice)" }}>{p.xpm}</td>
      <td className="mono2" style={{ textAlign: "right" }}>{p.hero_damage.toLocaleString()}</td>
    </tr>
  );
}

function TeamTable({ name, score, win, players }: { name: string; score: number; win: boolean; players: MatchPlayer[] }) {
  const isRad = name === "RADIANT";
  const color = isRad ? "var(--good)" : "var(--bad)";
  return (
    <div style={{ marginBottom: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: `2px solid ${color}`, paddingBottom: "10px", marginBottom: "10px" }}>
        <div>
          <h2 style={{ margin: 0, color, fontFamily: "var(--font-display)", letterSpacing: "0.1em" }}>
            {win && "🏆 "} {name}
          </h2>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "32px", color }}>
          {score}
        </div>
      </div>
      
      <table className="board" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr className="bh">
            <th style={{ width: "40px" }}></th>
            <th style={{ textAlign: "left" }}>Player</th>
            <th style={{ textAlign: "center", width: "50px" }}>K</th>
            <th style={{ textAlign: "center", width: "50px" }}>D</th>
            <th style={{ textAlign: "center", width: "50px" }}>A</th>
            <th style={{ textAlign: "right", width: "100px" }}>NET</th>
            <th style={{ textAlign: "right", width: "60px" }}>GPM</th>
            <th style={{ textAlign: "right", width: "60px" }}>XPM</th>
            <th style={{ textAlign: "right", width: "100px" }}>DMG</th>
          </tr>
        </thead>
        <tbody>
          {players.map(p => <PlayerRow key={p.account_id} p={p} />)}
        </tbody>
      </table>
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
    <div className="inner" style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>
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
  );
}
