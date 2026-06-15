import { query, num, str } from "./db";
import { nameMap, allAvatars, defaultAvatar } from "./queries";
import { GUILD_ID } from "./config";

export interface LadderPlayer {
  rank: number;
  uid: string;
  name: string;
  avatar: string;
  mmr: number;
  peak: number;
  wins: number;
  losses: number;
  games: number;
  wr: number;
  streak: number;
  last10: string;
  calibrated: boolean;
  dota_rank: string | null;
}

/** Full board: all players by V3 MMR with names + ids for profile links. */
export async function getLadder(): Promise<LadderPlayer[]> {
  const [names, avatars, rows] = await Promise.all([
    nameMap(),
    allAvatars(),
    query(
      "SELECT v3.user_id, v3.current_mmr, v3.peak_mmr, v3.wins, v3.losses," +
        "       v3.current_streak, v3.last_10_games, v3.calibration_games," +
        "       m.stratz_rank " +
        "FROM player_mmr_v3 v3 " +
        "LEFT JOIN player_mmr m ON v3.user_id = m.user_id AND v3.guild_id = m.guild_id " +
        "WHERE v3.guild_id = ? ORDER BY v3.current_mmr DESC",
      [GUILD_ID],
    ),
  ]);

  return rows.map((r, i) => {
    const wins = num(r.wins);
    const losses = num(r.losses);
    const g = wins + losses;
    const uid = str(r.user_id);
    return {
      rank: i + 1,
      uid,
      name: names.get(uid) ?? `Player${uid.slice(-4)}`,
      avatar: avatars.get(uid) ?? defaultAvatar(BigInt(uid)),
      mmr: Math.round(num(r.current_mmr)),
      peak: Math.round(Math.max(num(r.peak_mmr), num(r.current_mmr))),
      wins,
      losses,
      games: g,
      wr: g ? Math.round((wins / g) * 100) : 0,
      streak: num(r.current_streak),
      last10: str(r.last_10_games),
      calibrated: num(r.calibration_games) >= 10,
      dota_rank: r.stratz_rank ? str(r.stratz_rank) : null,
    };
  });
}
