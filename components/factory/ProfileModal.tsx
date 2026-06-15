"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import type { Me, Stats } from "./auth-types";

const monoStyle: React.CSSProperties = {
  fontFamily: "'Share Tech Mono',monospace",
  fontSize: "11px",
  color: "var(--dim)",
};

function Pip({ s }: { s: string }) {
  return (
    <span className="l10">
      {[...(s || "")].slice(-10).map((c, i) => (
        <i className={c} key={i} />
      ))}
    </span>
  );
}

function StatsBlock({ stats }: { stats: Stats | null | undefined }) {
  if (stats === undefined) {
    return (
      <div className="lw-s" style={monoStyle}>
        FETCHING...
      </div>
    );
  }
  if (stats === null) {
    return (
      <div className="lw-s" style={monoStyle}>
        STATS UNAVAILABLE — SERVER OFFLINE?
      </div>
    );
  }
  return (
    <>
      {stats.has_games ? (
        <>
          <div className="pgrid">
            <div className="pstat"><div className="v or">{stats.mmr}</div><div className="k">MMR (V3)</div></div>
            <div className="pstat"><div className="v">{stats.peak}</div><div className="k">Peak MMR</div></div>
            <div className="pstat"><div className="v">{stats.rank ? "#" + stats.rank : "—"}</div><div className="k">Rank of {stats.rank_of || "—"}</div></div>
            <div className="pstat"><div className="v good">{stats.wins}</div><div className="k">Wins</div></div>
            <div className="pstat"><div className="v bad">{stats.losses}</div><div className="k">Losses</div></div>
            <div className="pstat"><div className="v">{stats.winrate}%</div><div className="k">Win rate</div></div>
          </div>
          <div style={{ display: "flex", gap: "18px", alignItems: "center", flexWrap: "wrap", fontFamily: "'Share Tech Mono',monospace", fontSize: "11px", color: "var(--dim)" }}>
            <span>LAST 10: <Pip s={stats.last10 || ""} /></span>
            <span>
              STREAK:{" "}
              <b style={{ color: (stats.streak ?? 0) >= 0 ? "var(--good)" : "var(--bad)" }}>
                {(stats.streak ?? 0) > 0 ? "+" + stats.streak : stats.streak}
              </b>
            </span>
            {stats.calibration_left ? <span>CALIBRATION: {stats.calibration_left} LEFT</span> : null}
            {stats.dota_rank ? <span>DOTA RANK: {stats.dota_rank}</span> : null}
          </div>
        </>
      ) : (
        <div>NO INHOUSE GAMES ON RECORD YET — JOIN THE QUEUE, FEED THE MACHINE.</div>
      )}

      {stats.heroes && stats.heroes.length ? (
        <>
          <div className="phsec">Signature heroes (league)</div>
          {stats.heroes.map((x, i) => (
            <div className="sigrow" key={i}>
              <span className="sn">{["🥇", "🥈", "🥉"][i] || ""} {x.name}</span>
              <span className="sv">{x.games} games · <b>{x.wins}W</b></span>
            </div>
          ))}
        </>
      ) : null}

      {stats.predictions ? (
        <>
          <div className="phsec">Prediction bureau</div>
          <div className="pgrid">
            <div className="pstat"><div className="v or">{stats.predictions.points}</div><div className="k">Points</div></div>
            <div className="pstat"><div className="v good">{stats.predictions.correct}</div><div className="k">Correct</div></div>
            <div className="pstat"><div className="v bad">{stats.predictions.wrong}</div><div className="k">Wrong</div></div>
            <div className="pstat"><div className="v">{stats.predictions.streak}</div><div className="k">Streak</div></div>
          </div>
        </>
      ) : null}
    </>
  );
}

export function ProfileModal({
  me,
  open,
  onClose,
  setMe,
}: {
  me: Me | null;
  open: boolean;
  onClose: () => void;
  setMe: (m: Me) => void;
}) {
  const [stats, setStats] = useState<Stats | null | undefined>(undefined);
  const [linkVal, setLinkVal] = useState("");
  const [linkMsg, setLinkMsg] = useState<{ cls: string; text: string } | null>(null);
  const [linking, setLinking] = useState(false);

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // fetch /stats when opened
  useEffect(() => {
    if (!open || !me?.auth) return;
    setStats(undefined);
    fetch("/api/stats")
      .then((r) => r.json())
      .then((s: Stats) => setStats(s))
      .catch(() => setStats(null));
  }, [open, me]);

  if (!me?.auth || !me.user) return <div id="profileModal" />;

  const doLink = async () => {
    const v = linkVal.trim();
    if (!v) {
      setLinkMsg({ cls: "err", text: "ENTER A STEAM ID OR URL." });
      return;
    }
    setLinking(true);
    setLinkMsg({ cls: "", text: "RESOLVING..." });
    try {
      const r = await fetch("/api/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steam: v }),
      });
      const res = await r.json();
      if (res.ok) {
        setLinkMsg({ cls: "ok", text: `✓ LINKED — ${String(res.id_type).toUpperCase()} → ${res.steam64}` });
        const m = await fetch("/api/me");
        setMe(await m.json());
      } else {
        setLinkMsg({ cls: "err", text: "✗ " + String(res.error || "LINK FAILED.").toUpperCase() });
        setLinking(false);
      }
    } catch {
      setLinkMsg({ cls: "err", text: "✗ SERVER UNREACHABLE." });
      setLinking(false);
    }
  };

  return (
    <div
      id="profileModal"
      className={open ? "open" : ""}
      role="dialog"
      aria-modal="true"
      aria-label="Player profile"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="pcard">
        <div className="phead">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img id="pAvatar" src={me.user.avatar} alt="" />
          <div>
            <div className="pn">{me.user.name}</div>
            <div className="pt">ONLYHUMANS OPERATIVE FILE</div>
          </div>
          <button className="pclose" onClick={onClose}>
            ESC ✕
          </button>
        </div>
        <div className="pbody">
          {!me.steam?.linked ? (
            <div className="linkwarn">
              <div className="lw-t">⚠ STEAM NOT LINKED — VERIFICATION INCOMPLETE</div>
              <div className="lw-s">
                The factory can&apos;t certify you without a Steam identity. Paste any of these and we&apos;ll resolve it right here:
                <br />
                <code>steamcommunity.com/profiles/7656...</code> · <code>steamcommunity.com/id/yourname</code> · vanity name · friend ID · Steam64 ID
                <br />
                You&apos;ll need this to register for tournaments. (Also works via <code>/link</code> in Discord.)
              </div>
              <div className="linkform">
                <input
                  type="text"
                  placeholder="Steam URL / vanity / friend ID / Steam64"
                  autoComplete="off"
                  spellCheck={false}
                  value={linkVal}
                  onChange={(e) => setLinkVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") doLink();
                  }}
                />
                <button onClick={doLink} disabled={linking}>
                  LINK ▸
                </button>
              </div>
              {linkMsg ? <div className={`linkmsg ${linkMsg.cls}`}>{linkMsg.text}</div> : <div className="linkmsg" />}
            </div>
          ) : (
            <>
              <div className="phsec">Steam identity</div>
              <div className="plinks">
                <a className="plink" href={me.steam.profile_url} target="_blank" rel="noopener">Steam Community ↗</a>
                <a className="plink" href={me.steam.dotabuff_url} target="_blank" rel="noopener">Dotabuff ↗</a>
                <a className="plink" href={me.steam.opendota_url} target="_blank" rel="noopener">OpenDota ↗</a>
              </div>
              <div className="lw-s" style={{ marginTop: "8px", fontFamily: "'Share Tech Mono',monospace", fontSize: "10px", color: "var(--dim)" }}>
                STEAM64: {me.steam.steam64} · ACCOUNT ID: {me.steam.account_id}
              </div>
            </>
          )}

          <div className="phsec">Combat record — /stats</div>
          <StatsBlock stats={stats} />
        </div>
        <div className="pfoot">
          <span>DATA: GUILD DB · LIVE</span>
          <span>
            <a href={`/player/${me.user.id}`} style={{ color: "var(--ice)", marginRight: "18px" }}>
              FULL PROFILE ↗
            </a>
            <a onClick={() => signOut({ callbackUrl: "/" })} style={{ color: "var(--bad)", cursor: "pointer" }}>
              Sign out
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
