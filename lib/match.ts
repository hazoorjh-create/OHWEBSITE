import { queryOne, str } from "./db";
import { nameMap } from "./queries";

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

  const names = await nameMap();

  const players: MatchPlayer[] = (m.players || []).map((p: any) => {
    const isRadiant = p.player_slot < 128;
    return {
      account_id: p.account_id || 0,
      name: names.get(String(p.account_id)) || "Unknown",
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
