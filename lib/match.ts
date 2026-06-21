import { query, queryOne, str } from "./db";
import { nameMap, STEAM_ID_BASE } from "./queries";

export interface MatchPlayer {
  account_id: number;
  name: string;
  hero_id: number;
  kills: number;
  deaths: number;
  assists: number;
  gpm: number;
  xpm: number;
  net_worth: number;
  hero_damage: number;
  last_hits: number;
  denies: number;
  team: "radiant" | "dire";
}

export interface MatchDetails {
  match_id: string;
  duration: number;
  start_time: number;
  radiant_win: boolean;
  radiant_score: number;
  dire_score: number;
  players: MatchPlayer[];
}

export async function getMatchDetails(matchId: string): Promise<MatchDetails | null> {
  if (!matchId || !/^\d+$/.test(matchId)) return null;

  const row = await queryOne(
    "SELECT data_json FROM match_cache WHERE match_id = ?",
    [matchId]
  );
  if (!row) return null;

  let m: any;
  try {
    m = JSON.parse(str(row.data_json));
  } catch {
    return null;
  }

  const rawPlayers = m.players || [];
  
  // Convert Steam32 account_ids to Steam64 and lookup discord user_ids
  const steam64s = rawPlayers.map((p: any) => String(BigInt(p.account_id || 0) + STEAM_ID_BASE));
  const steamToUser = new Map<number, string>();
  
  if (steam64s.length > 0) {
    const placeholders = steam64s.map(() => "?").join(",");
    const rows = await query(`SELECT user_id, steam_id FROM steam_links WHERE steam_id IN (${placeholders})`, steam64s);
    for (const r of rows) {
      const s64 = BigInt(r.steam_id as any);
      const s32 = Number(s64 - STEAM_ID_BASE);
      steamToUser.set(s32, String(r.user_id));
    }
  }

  const names = await nameMap();

  const players: MatchPlayer[] = rawPlayers.map((p: any) => {
    const isRadiant = p.player_slot < 128;
    const acc = p.account_id || 0;
    
    const uid = steamToUser.get(acc);
    let pname = "Unknown";
    if (uid && names.has(uid)) pname = names.get(uid)!;

    return {
      account_id: acc,
      name: pname,
      hero_id: p.hero_id || 0,
      kills: p.kills || 0,
      deaths: p.deaths || 0,
      assists: p.assists || 0,
      gpm: p.gold_per_min || 0,
      xpm: p.xp_per_min || 0,
      net_worth: p.net_worth || 0,
      hero_damage: p.hero_damage || 0,
      last_hits: p.last_hits || 0,
      denies: p.denies || 0,
      team: isRadiant ? "radiant" : "dire",
    };
  });

  const radKills = players.filter(p => p.team === "radiant").reduce((sum, p) => sum + p.kills, 0);
  const direKills = players.filter(p => p.team === "dire").reduce((sum, p) => sum + p.kills, 0);

  return {
    match_id: String(m.match_id || matchId),
    duration: m.duration || 0,
    start_time: m.start_time || 0,
    radiant_win: Boolean(m.radiant_win),
    radiant_score: m.radiant_score || radKills,
    dire_score: m.dire_score || direKills,
    players
  };
}
