"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { LadderPlayer } from "@/lib/board";
import { Avatar } from "./Avatar";

function Pip({ s }: { s: string }) {
  return (
    <span className="l10">
      {[...(s || "")].slice(-10).map((c, i) => (
        <i className={c} key={i} />
      ))}
    </span>
  );
}

function Streak({ v }: { v: number }) {
  if (v > 0) return <span className="stk up">▲ {v}W</span>;
  if (v < 0) return <span className="stk down">▼ {-v}L</span>;
  return <span className="stk">—</span>;
}

export function LadderBoard({ players }: { players: LadderPlayer[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const f = q.toLowerCase();
    return f ? players.filter((p) => p.name.toLowerCase().includes(f)) : players;
  }, [players, q]);

  return (
    <>
      <div className="kicker">The scene, live</div>
      <h1>Ladder</h1>
      <div className="sub">
        Where the calibrated field stands today. Every operative on the factory floor — click a player to open their file.
      </div>
      <div className="toolbar">
        <input
          type="text"
          placeholder="SEARCH PLAYER..."
          autoComplete="off"
          spellCheck={false}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <span className="count">{players.length} PLAYERS RANKED</span>
      </div>
      <div className="board">
        <div className="bh">
          <span>#</span>
          <span>Player</span>
          <span style={{ textAlign: "right" }}>MMR</span>
          <span style={{ textAlign: "right" }}>W–L</span>
          <span style={{ textAlign: "right" }}>WR</span>
          <span style={{ textAlign: "right" }}>Streak</span>
          <span style={{ textAlign: "right" }}>Last 10</span>
        </div>
        <div>
          {rows.length ? (
            rows.map((p) => (
              <div
                className={`br ${p.rank <= 3 ? "r" + p.rank : ""}`}
                key={p.uid}
                onClick={() => router.push("/player/" + p.uid)}
              >
                <span className="rk">{p.rank}</span>
                <span className="pcell">
                  <span className="ava">
                    <Avatar src={p.avatar} name={p.name} />
                  </span>
                  <span>
                    <span className="nm">{p.name}</span>
                    <div className="meta">
                      {p.games ? `${p.wins}W · ${p.losses}L · ${p.wr}%` : "NO GAMES YET"}
                      {p.calibrated ? "" : " · CALIBRATING"}
                      {p.dota_rank ? " · " + p.dota_rank.toUpperCase() : ""}
                    </div>
                  </span>
                </span>
                <span className="mmr">{p.mmr.toLocaleString()}</span>
                <span className="mono2">
                  {p.wins}–{p.losses}
                </span>
                <span className="mono2">{p.wr}%</span>
                <Streak v={p.streak} />
                <span style={{ textAlign: "right" }}>
                  <Pip s={p.last10} />
                </span>
              </div>
            ))
          ) : (
            <div className="empty">NO MATCHES ON THE FLOOR</div>
          )}
        </div>
      </div>
    </>
  );
}
