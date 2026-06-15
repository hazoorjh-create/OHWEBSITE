import { Fragment } from "react";
import type { HistEntry } from "@/lib/snapshot";
import { LiveGames } from "./LiveGames";

const fmtDur = (s: number | null) =>
  s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : null;

function Chips({ names, right, win }: { names: string[]; right: boolean; win: number }) {
  const cls = (right ? win === 2 : win === 1) ? "tw" : "tl";
  return (
    <div className={`chips ${right ? "right" : ""} ${cls}`}>
      {names.map((n, i) => (
        <span className="chip" key={i}>
          {n.trim()}
        </span>
      ))}
    </div>
  );
}

function HistRow({ m }: { m: HistEntry }) {
  const delta = Math.abs(m.win === 1 ? m.d1 || 0 : m.d2 || 0);
  const parts: React.ReactNode[] = [];
  const dur = fmtDur(m.dur);
  if (dur) parts.push(dur);
  if (m.score && !m.score.includes("None")) parts.push(m.score);
  if (delta) parts.push(`±${delta} MMR`);
  if (m.id)
    parts.push(
      <a key="db" href={`https://www.dotabuff.com/matches/${m.id}`} target="_blank" rel="noopener">
        dotabuff ↗
      </a>,
    );

  return (
    <div className="hrow">
      <div className="mh">
        <div className="hn2">#{m.n}</div>
        <div className="hd">
          {m.ts.slice(0, 10)}
          <br />
          {m.ts.slice(11)}
        </div>
      </div>
      <Chips names={m.t1} right={false} win={m.win} />
      <div className="hmid">
        <span className="respill">{m.win === 1 ? "◄ TEAM 1" : "TEAM 2 ►"}</span>
        <div className="sub">
          {parts.map((p, i) => (
            <Fragment key={i}>
              {i > 0 ? " · " : ""}
              {p}
            </Fragment>
          ))}
        </div>
      </div>
      <Chips names={m.t2} right={true} win={m.win} />
    </div>
  );
}

export function Games({ hist }: { hist: HistEntry[] }) {
  return (
    <section className="section" id="games">
      <div className="inner">
        <div className="plaque rv">
          <span className="num">03</span>
          <span className="lbl">Evaluation Floor — Live Games</span>
        </div>
        <h2 className="rv">
          The belt <span className="o">splits.</span>
        </h2>
        <div className="tag rv d1">// EACH LANE BECOMES A DOTA BATTLEFIELD</div>
        <p className="desc rv d1">
          Fresh humans roll straight onto the evaluation floor. Real matches, straight from the OnlyHumans guild ledger.
        </p>

        <LiveGames />

        <div className="rv d3" style={{ marginTop: "46px" }}>
          <div className="subhead">
            <span className="sh-l">MATCH HISTORY</span>
            <span className="sh-r">GUILD LEDGER · LAST 20</span>
          </div>
          <div id="histList">
            {hist.map((m) => (
              <HistRow key={m.n} m={m} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
