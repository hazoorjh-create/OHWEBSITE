import { query, num, str } from "./db";
import { heroName, heroImg } from "./heroes";

/** Per-hero aggregate: [games, wins, kills, deaths, assists]. */
type HeroStat = [number, number, number, number, number];

export interface MatchLine {
  match_id: string;
  hero_id: number;
  won: boolean;
  k: number;
  d: number;
  a: number;
  gpm: number;
  xpm: number;
  lh: number;
  dur: number;
  ts: number;
  hero?: string;
  img?: string;
}

interface Index {
  built: number;
  heroes: Map<number, Map<number, HeroStat>>;
  matches: Map<number, Map<string, MatchLine>>;
}

let _idx: Index = { built: 0, heroes: new Map(), matches: new Map() };
let _building: Promise<Index> | null = null;

interface RawPlayer {
  account_id?: number;
  hero_id?: number;
  player_slot?: number;
  kills?: number;
  deaths?: number;
  assists?: number;
  gold_per_min?: number;
  xp_per_min?: number;
  last_hits?: number;
}
interface RawMatch {
  match_id?: number;
  radiant_win?: boolean;
  duration?: number;
  start_time?: number;
  players?: RawPlayer[];
}

async function build(): Promise<Index> {
  const heroes = new Map<number, Map<number, HeroStat>>();
  const matches = new Map<number, Map<string, MatchLine>>();
  const rows = await query("SELECT match_id, data_json FROM match_cache");

  for (const r of rows) {
    let m: RawMatch;
    try {
      m = JSON.parse(str(r.data_json));
    } catch {
      continue;
    }
    const radWin = Boolean(m.radiant_win);
    const dur = m.duration || 0;
    const ts = m.start_time || 0;
    const mid = String(m.match_id ?? num(r.match_id));

    for (const p of m.players ?? []) {
      const acc = p.account_id;
      const hid = p.hero_id;
      if (!acc || !hid) continue;
      const won = ((p.player_slot ?? 0) < 128) === radWin;

      let hm = heroes.get(acc);
      if (!hm) heroes.set(acc, (hm = new Map()));
      let slot = hm.get(hid);
      if (!slot) hm.set(hid, (slot = [0, 0, 0, 0, 0]));
      slot[0] += 1;
      if (won) slot[1] += 1;
      slot[2] += p.kills || 0;
      slot[3] += p.deaths || 0;
      slot[4] += p.assists || 0;

      let mm = matches.get(acc);
      if (!mm) matches.set(acc, (mm = new Map()));
      mm.set(mid, {
        match_id: mid,
        hero_id: hid,
        won,
        k: p.kills || 0,
        d: p.deaths || 0,
        a: p.assists || 0,
        gpm: p.gold_per_min || 0,
        xpm: p.xp_per_min || 0,
        lh: p.last_hits || 0,
        dur,
        ts,
      });
    }
  }
  _idx = { built: Date.now() / 1000, heroes, matches };
  return _idx;
}

async function getIndex(): Promise<Index> {
  const isStale = Date.now() / 1000 - _idx.built > 300;
  if (isStale && !_building) {
    _building = build().catch(console.error).finally(() => {
      _building = null;
    });
  }
  if (_idx.built > 0) {
    return _idx;
  }
  return _building!;
}

export async function signatureHeroes(
  accountId: number,
  top = 3,
): Promise<{ name: string; games: number; wins: number }[]> {
  const heroes = (await getIndex()).heroes.get(accountId);
  if (!heroes) return [];
  const ranked = [...heroes.entries()]
    .sort((a, b) => b[1][0] - a[1][0] || b[1][1] - a[1][1])
    .slice(0, top);
  return ranked.map(([h, s]) => ({ name: heroName(h), games: s[0], wins: s[1] }));
}

export async function playerHeroes(accountId: number): Promise<
  {
    name: string;
    img: string;
    games: number;
    wins: number;
    losses: number;
    wr: number;
    kda: string;
  }[]
> {
  const heroes = (await getIndex()).heroes.get(accountId);
  if (!heroes) return [];
  return [...heroes.entries()]
    .sort((a, b) => b[1][0] - a[1][0])
    .map(([h, [g, w, k, d, a]]) => ({
      name: heroName(h),
      img: heroImg(h),
      games: g,
      wins: w,
      losses: g - w,
      wr: g ? Math.round((w / g) * 100) : 0,
      kda: g ? `${(k / g).toFixed(1)}/${(d / g).toFixed(1)}/${(a / g).toFixed(1)}` : "-",
    }));
}

export async function playerMatches(
  accountId: number,
  limit = 50,
): Promise<MatchLine[]> {
  const mm = (await getIndex()).matches.get(accountId);
  if (!mm) return [];
  const ms = [...mm.values()].sort((a, b) => b.ts - a.ts);
  return ms.slice(0, limit).map((m) => ({
    ...m,
    hero: heroName(m.hero_id),
    img: heroImg(m.hero_id),
  }));
}
