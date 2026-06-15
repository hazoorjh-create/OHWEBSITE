import type { LbEntry, Trend, TrendHero } from "@/lib/snapshot";

const RCLS = ["r1", "r2", "r3"];
const MEDS = ["🥇", "🥈", "🥉", "4.", "5."];

function streakLabel(streak: number) {
  if (streak > 0) return `▲ ${streak}W`;
  if (streak < 0) return `▼ ${-streak}L`;
  return "—";
}

interface Col {
  title: string;
  ic: string;
  list: TrendHero[];
  fmt: (h: TrendHero) => React.ReactNode;
}

export function Lift({
  lb,
  trend,
  generated,
  league,
}: {
  lb: LbEntry[];
  trend: Trend;
  generated: string;
  league: number;
}) {
  const cols: Col[] = [
    { title: "🔥 High Priority Picks", ic: "PICKS", list: trend.picked, fmt: (h) => <>{h.picks} picks · <b>{h.wr}%</b> WR</> },
    { title: "🚫 Most Contest Bans", ic: "BANS", list: trend.banned, fmt: (h) => <><b>{h.bans}</b> bans</> },
    { title: "🎯 Performance Leaders", ic: "WIN %", list: trend.best, fmt: (h) => <><b className="good">{h.wr}%</b> · {h.g} games</> },
    { title: "📉 Underperformers", ic: "WIN %", list: trend.worst, fmt: (h) => <><b className="bad">{h.wr}%</b> · {h.g} games</> },
  ];

  return (
    <section id="lift">
      <div id="liftStage">
        <div className="head">
          <div className="plaque">
            <span className="num">05</span>
            <span className="lbl">Ranking — The Ascent</span>
          </div>
          <h2 style={{ fontSize: "clamp(28px,4vw,48px)", color: "#fff", textTransform: "uppercase" }}>
            The belt rises <span style={{ color: "var(--orange)" }}>vertically.</span>
          </h2>
          <div className="tag" style={{ marginTop: "8px" }}>
            // THE WEAKEST DISAPPEAR — KEEP SCROLLING TO CLIMB
          </div>
          <a
            href="/players"
            className="mono"
            style={{ fontSize: "11px", letterSpacing: ".3em", color: "var(--orange)", textDecoration: "none", textTransform: "uppercase" }}
          >
            FULL BOARD →
          </a>
        </div>
        <div id="liftCable" />
        <div id="liftRows">
          {lb.slice(0, 5).map((p, i) => (
            <div className={`lb-row ${RCLS[i] || ""}`} key={i}>
              <div className="rank">#{i + 1}</div>
              <div>
                <div className="pname">{p.name}</div>
                <div className="ptag">
                  {p.wr}% WR · {p.w + p.l} games · peak {p.peak}
                </div>
              </div>
              <div className="mmr" data-mmr={p.mmr}>
                0
              </div>
              <div className={`delta ${p.streak >= 0 ? "up" : "down"}`}>{streakLabel(p.streak)}</div>
            </div>
          ))}
        </div>
        <div id="liftNote">
          ALTITUDE = MMR
          <br />
          NO OXYGEN FOR TOURISTS
        </div>
      </div>

      {/* after the ascent: meta snapshot + ladder CTA */}
      <div className="section" style={{ paddingTop: "90px" }}>
        <div className="inner">
          <div className="rv" id="telemetry">
            <div className="subhead">
              <span className="sh-l">META SNAPSHOT</span>
              <span className="sh-r">
                TRENDING · LAST {trend.games} LEAGUE GAMES · LEAGUE {league}
              </span>
            </div>
            <div className="mtwrap">
              <div className="mtable" id="mtable">
                {cols.map((c) => (
                  <div className="mth" key={c.title}>
                    <span>{c.title}</span>
                    <span className="ic">{c.ic}</span>
                  </div>
                ))}
                {[0, 1, 2, 3, 4].map((r) =>
                  cols.map((c) => {
                    const h = c.list[r];
                    return (
                      <div className="mtc" key={`${r}-${c.title}`}>
                        {h ? (
                          <>
                            <span>
                              <span className={`medal m${r}`}>{MEDS[r]}</span> <span className="hn">{h.h}</span>
                            </span>
                            <span className="hv">{c.fmt(h)}</span>
                          </>
                        ) : (
                          <span className="hv">—</span>
                        )}
                      </div>
                    );
                  }),
                )}
              </div>
            </div>
            <div className="metafoot" id="metaFoot">
              SNAPSHOT: {generated} · LEAGUE {league} · SOURCE: GUILD DB
            </div>
          </div>
          <div className="rv d1">
            <a className="ghostbtn" href="/players" style={{ marginTop: "20px", textAlign: "center", textDecoration: "none", display: "block" }}>
              OPEN THE LADDER — FULL BOARD &amp; PLAYER PROFILES ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
