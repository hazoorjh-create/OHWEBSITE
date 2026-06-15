export function Tournaments() {
  return (
    <section className="section" id="tournaments">
      <div className="gear" style={{ width: "340px", height: "340px", top: "-80px", right: "-100px" }} />
      <div className="gear" style={{ width: "220px", height: "220px", bottom: "40px", left: "-70px" }} />
      <div className="inner">
        <div className="plaque rv">
          <span className="num">04</span>
          <span className="lbl">Selection — Tournaments</span>
        </div>
        <h2 className="rv">
          The strongest <span className="o">advance.</span>
        </h2>
        <div className="tag rv d1">// BRACKETS PROJECTED FROM ROTATING GEARS</div>
        <p className="desc rv d1">
          Teams get filtered. Some are rejected. Some move forward. The machine keeps only what survives the bracket.
        </p>
        <div className="t-row">
          <div className="t-item rv d1">
            <span className="st reg">Finished</span>
            <div>
              <div className="tn">OH SEASON 1</div>
              <div className="td">Inaugural ONLYHUMANS bracket · Champions crowned</div>
            </div>
            <div>
              <div className="prize">🏆 TEAM ENERGY</div>
              <div className="pl">Champions</div>
            </div>
            <span className="st soon">S1 ▸</span>
          </div>
          <div className="t-item rv d2">
            <span className="st soon">TBA</span>
            <div>
              <div className="tn">OH SEASON 2</div>
              <div className="td">Details drop on Discord · The machine is warming up</div>
            </div>
            <div>
              <div className="prize">—</div>
              <div className="pl">Prize pool</div>
            </div>
            <span className="st soon">Soon ▸</span>
          </div>
        </div>
        <div className="rv d3" style={{ marginTop: "26px" }}>
          <a className="btn lb" href="/register">
            Register for Tournaments ▸
          </a>
        </div>
      </div>
    </section>
  );
}
