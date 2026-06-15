"use client";

import { useEffect, useState } from "react";
import type { LiveGame } from "@/lib/queries";

function Roster({ players }: { players: { name: string; hero: string | null }[] }) {
  return (
    <>
      {players.map((p, i) => (
        <div key={i}>
          <b>{p.name}</b>
          {p.hero ? <span className="hero"> — {p.hero}</span> : null}
        </div>
      ))}
    </>
  );
}

/** Live games feed — mirrors the original liveFeed(): polls /api/live every 60s. */
export function LiveGames() {
  const [games, setGames] = useState<LiveGame[] | null>(null);

  useEffect(() => {
    let alive = true;
    async function poll() {
      try {
        const r = await fetch("/api/live");
        if (!r.ok) return; // server down — leave idle panel
        const data: LiveGame[] = await r.json();
        if (alive) setGames(data);
      } catch {
        /* leave idle */
      }
    }
    poll();
    const id = setInterval(poll, 60000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const stamp =
    games && games.length ? (
      <span className="live-dot">
        <i />
        LIVE · {games.length} GAME{games.length > 1 ? "S" : ""}
      </span>
    ) : (
      "FEED STANDBY"
    );

  return (
    <div className="rv d2">
      <div className="subhead">
        <span className="sh-l">LIVE GAMES</span>
        <span className="sh-r" id="liveStamp">
          {stamp}
        </span>
      </div>
      <div className="lanes">
        <div className="lane" />
        <div className="lane" />
        <div className="lane" />
      </div>
      <div id="liveCards">
        {games && games.length ? (
          <div className="cards">
            {games.map((g) => (
              <div className="card" key={g.match_id}>
                <div className="top">
                  <span className="live-dot">
                    <i />
                    LIVE
                  </span>
                  <span>
                    👁 {g.spectators} · SERIES {g.rad_wins}–{g.dire_wins}
                  </span>
                </div>
                <div className="body">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "14px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: "140px" }}>
                      <div style={{ color: "var(--ice)", marginBottom: "6px" }}>{g.radiant}</div>
                      <div className="lc-roster">
                        <Roster players={g.radiant_players} />
                      </div>
                    </div>
                    <div className="vs" style={{ alignSelf: "center" }}>
                      VS
                    </div>
                    <div style={{ flex: 1, minWidth: "140px", textAlign: "right" }}>
                      <div style={{ color: "var(--orange)", marginBottom: "6px" }}>{g.dire}</div>
                      <div className="lc-roster">
                        <Roster players={g.dire_players} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="meta">
                  <span>MATCH {g.match_id}</span>
                  <span>
                    <a
                      href={`https://www.dotabuff.com/matches/${g.match_id}`}
                      target="_blank"
                      rel="noopener"
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      DOTABUFF ↗
                    </a>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="live-idle">
            <div className="radar">
              <i />
            </div>
            <div>
              <div className="li-t">NO LIVE GAMES ON THE BELT</div>
              <div className="li-s">
                This bay is reserved for the live feed — matches appear here the moment a lobby goes live.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
