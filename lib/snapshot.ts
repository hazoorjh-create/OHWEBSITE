import { query, num, str } from "./db";
import { GUILD_ID, LEAGUE_ID } from "./config";
import { heroName } from "./heroes";
import { nameMap } from "./queries";

// ---- shapes consumed by the landing page (mirror the old ohdata.json) ----

export interface LbEntry {
  name: string;
  mmr: number;
  peak: number;
  w: number;
  l: number;
  wr: number;
  streak: number;
  last10: string;
}

export interface HistEntry {
  n: number;
  ts: string;
  win: number;
  t1: string[];
  t2: string[];
  d1: number;
  d2: number;
  id: number | null;
  dur: number | null;
  score: string | null;
}

export interface TrendHero {
  h: string;
  picks?: number;
  bans?: number;
  wr?: number;
  g?: number;
}
export interface Trend {
  games: number;
  picked: TrendHero[];
  banned: TrendHero[];
  best: TrendHero[];
  worst: TrendHero[];
}

export interface Snapshot {
  generated: string;
  league: number;
  lb: LbEntry[];
  hist: HistEntry[];
  trend: Trend;
}

interface MatchMeta {
  duration: number | null;
  start_time: number;
  score: string | null;
  picks_bans: { is_pick: boolean; hero_id: number }[];
  heroWon: Map<number, boolean>; // hero_id -> won (for pick win-rate)
}

function fmtGenerated(d: Date): string {
  const mon = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ][d.getUTCMonth()];
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCDate()} ${mon} ${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}

async function buildMatchMeta(): Promise<Map<string, MatchMeta>> {
  const rows = await query("SELECT match_id, data_json FROM match_cache");
  const meta = new Map<string, MatchMeta>();
  for (const r of rows) {
    let m: {
      match_id?: number;
      duration?: number;
      start_time?: number;
      radiant_win?: boolean;
      players?: { player_slot?: number; hero_id?: number; kills?: number }[];
      picks_bans?: { is_pick?: boolean; hero_id?: number }[];
    };
    try {
      m = JSON.parse(str(r.data_json));
    } catch {
      continue;
    }
    const mid = String(m.match_id ?? num(r.match_id));
    const radWin = Boolean(m.radiant_win);
    let radK = 0;
    let direK = 0;
    const heroWon = new Map<number, boolean>();
    for (const p of m.players ?? []) {
      const slot = p.player_slot ?? 0;
      const k = p.kills || 0;
      if (slot < 128) radK += k;
      else direK += k;
      if (p.hero_id) heroWon.set(p.hero_id, (slot < 128) === radWin);
    }
    meta.set(mid, {
      duration: m.duration || null,
      start_time: m.start_time || 0,
      score: m.players && m.players.length ? `${radK}–${direK}` : null,
      picks_bans: (m.picks_bans ?? []).map((pb) => ({
        is_pick: Boolean(pb.is_pick),
        hero_id: pb.hero_id ?? 0,
      })),
      heroWon,
    });
  }
  return meta;
}

async function buildLb(): Promise<LbEntry[]> {
  const names = await nameMap();
  const rows = await query(
    "SELECT user_id, current_mmr, peak_mmr, wins, losses, current_streak, last_10_games " +
      "FROM player_mmr_v3 WHERE guild_id = ? ORDER BY current_mmr DESC",
    [GUILD_ID],
  );
  return rows.map((r) => {
    const w = num(r.wins);
    const l = num(r.losses);
    const g = w + l;
    const uid = str(r.user_id);
    return {
      name: names.get(uid) ?? `Player${uid.slice(-4)}`,
      mmr: Math.round(num(r.current_mmr)),
      peak: Math.round(Math.max(num(r.peak_mmr), num(r.current_mmr))),
      w,
      l,
      wr: g ? Math.round((w / g) * 100) : 0,
      streak: num(r.current_streak),
      last10: str(r.last_10_games),
    };
  });
}

function buildHist(
  rows: Record<string, unknown>[],
  meta: Map<string, MatchMeta>,
): HistEntry[] {
  return rows.map((r) => {
    const dotaId = r.dota_match_id ? num(r.dota_match_id) : null;
    const mm = dotaId ? meta.get(String(dotaId)) : undefined;
    return {
      n: num(r.guild_match_num),
      ts: str(r.timestamp).slice(0, 16),
      win: num(r.winning_team),
      t1: str(r.team1_names).split(",").filter(Boolean),
      t2: str(r.team2_names).split(",").filter(Boolean),
      d1: num(r.v3_t1_change),
      d2: num(r.v3_t2_change),
      id: dotaId,
      dur: mm?.duration ?? null,
      score: mm?.score ?? null,
    };
  });
}

function buildTrend(meta: Map<string, MatchMeta>): Trend {
  // last 50 matches by start_time
  const recent = [...meta.values()]
    .sort((a, b) => b.start_time - a.start_time)
    .slice(0, 50);

  const picks = new Map<number, { picks: number; wins: number }>();
  const bans = new Map<number, number>();
  for (const m of recent) {
    for (const pb of m.picks_bans) {
      if (!pb.hero_id) continue;
      if (pb.is_pick) {
        let s = picks.get(pb.hero_id);
        if (!s) picks.set(pb.hero_id, (s = { picks: 0, wins: 0 }));
        s.picks += 1;
        if (m.heroWon.get(pb.hero_id)) s.wins += 1;
      } else {
        bans.set(pb.hero_id, (bans.get(pb.hero_id) ?? 0) + 1);
      }
    }
  }

  const pickArr = [...picks.entries()].map(([h, s]) => ({
    h: heroName(h),
    picks: s.picks,
    wr: s.picks ? Math.round((s.wins / s.picks) * 100) : 0,
    g: s.picks,
  }));

  const picked = [...pickArr]
    .sort((a, b) => b.picks - a.picks)
    .slice(0, 5)
    .map(({ h, picks, wr }) => ({ h, picks, wr }));

  const banned = [...bans.entries()]
    .map(([h, b]) => ({ h: heroName(h), bans: b }))
    .sort((a, b) => b.bans - a.bans)
    .slice(0, 5);

  const qualified = pickArr.filter((x) => x.g >= 3);
  const best = [...qualified]
    .sort((a, b) => b.wr - a.wr || b.g - a.g)
    .slice(0, 5)
    .map(({ h, wr, g }) => ({ h, wr, g }));
  const worst = [...qualified]
    .sort((a, b) => a.wr - b.wr || b.g - a.g)
    .slice(0, 5)
    .map(({ h, wr, g }) => ({ h, wr, g }));

  return { games: recent.length, picked, banned, best, worst };
}

let _cache: { built: number; snap: Snapshot } = { built: 0, snap: {} as Snapshot };
let _building: Promise<Snapshot> | null = null;

async function buildSnapshot(): Promise<Snapshot> {
  const meta = await buildMatchMeta();
  const [lb, histRows] = await Promise.all([
    buildLb(),
    query(
      "SELECT guild_match_num, timestamp, winning_team, team1_names, team2_names," +
        "       v3_t1_change, v3_t2_change, dota_match_id " +
        "FROM match_history WHERE guild_id = ? AND (cancelled IS NULL OR cancelled = 0) " +
        "ORDER BY timestamp DESC LIMIT 20",
      [GUILD_ID],
    ),
  ]);

  const snap: Snapshot = {
    generated: fmtGenerated(new Date()),
    league: LEAGUE_ID,
    lb,
    hist: buildHist(histRows, meta),
    trend: buildTrend(meta),
  };
  _cache = { built: Date.now() / 1000, snap };
  return snap;
}

export async function getSnapshot(): Promise<Snapshot> {
  const isStale = Date.now() / 1000 - _cache.built > 300;
  if (isStale && !_building) {
    _building = buildSnapshot().catch(console.error).finally(() => {
      _building = null;
    });
  }
  if (_cache.built > 0) {
    return _cache.snap;
  }
  return _building!;
}
