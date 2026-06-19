import Link from "next/link";

const CHAMPS = [
  "Swiftblad3", ".JoJo", "Swaggy Brisingr", "Dr_Nemesis_X",
  "Phantom", "energy", "SSM555", "fonke monke",
];

const CHAMPS_IDS: Record<string, string> = {
  ".JoJo": "210418511468560384",
  "Swaggy Brisingr": "434008650684694548",
  "Phantom": "353894983914356736",
  "energy": "1332232206806159380"
};

export function Hall() {
  return (
    <section className="section" id="hall">
      <div className="inner">
        <div className="plaque rv">
          <span className="num">06</span>
          <span className="lbl">Archive — Hall of Legends</span>
        </div>
        <h2 className="rv">
          Hall of <span className="o">Legends</span>
        </h2>
        <div className="tag rv d1">// DISPLAYED LIKE F1 CARS IN A MUSEUM</div>
        <div className="glass-row" style={{ gridTemplateColumns: "minmax(260px,640px)", justifyContent: "center" }}>
          <div className="case rv">
            <div className="season">OH Season 1 — Tournament Champions</div>
            <svg className="trophy" viewBox="0 0 72 72">
              <path d="M18 10 H54 V26 C54 38 46 44 36 46 C26 44 18 38 18 26 Z" fill="#ffb347" stroke="#7a4a12" strokeWidth="3" />
              <path d="M18 14 H8 V22 C8 30 13 33 19 34 M54 14 H64 V22 C64 30 59 33 53 34" fill="none" stroke="#7a4a12" strokeWidth="3" />
              <rect x="30" y="46" width="12" height="10" fill="#7a4a12" />
              <rect x="22" y="56" width="28" height="8" fill="#5a3208" />
            </svg>
            <div className="champ">TEAM ENERGY</div>
            <div className="feat">The first squad to walk out of the factory with the trophy.</div>
            <div className="chips" style={{ justifyContent: "center", marginTop: "16px" }}>
              {CHAMPS.map((c) => {
                const id = CHAMPS_IDS[c];
                return id ? (
                  <Link href={`/player/${id}`} key={c} style={{ textDecoration: "none" }}>
                    <span className="chip hoverable">
                      {c}
                    </span>
                  </Link>
                ) : (
                  <span className="chip" key={c}>
                    {c}
                  </span>
                );
              })}
            </div>
            <div className="plinth" />
          </div>
        </div>
      </div>
    </section>
  );
}
