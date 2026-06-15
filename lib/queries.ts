import { query, queryOne, num, str } from "./db";
import { GUILD_ID, STEAM_ID_BASE } from "./config";

// ---------------- steam links ----------------

export async function getSteamId(userId: bigint): Promise<bigint | null> {
  const row = await queryOne(
    "SELECT steam_id FROM steam_links WHERE user_id = ?",
    [userId],
  );
  if (!row || row.steam_id === null) return null;
  return BigInt(row.steam_id as bigint);
}

export async function steamInUseBy(steam64: bigint): Promise<bigint | null> {
  const row = await queryOne(
    "SELECT user_id FROM steam_links WHERE steam_id = ?",
    [steam64],
  );
  if (!row) return null;
  return BigInt(row.user_id as bigint);
}

export async function linkSteamAccount(
  userId: bigint,
  steam64: bigint,
): Promise<void> {
  await query(
    "INSERT INTO steam_links (user_id, steam_id, updated_at) " +
      "VALUES (?, ?, datetime('now')) " +
      "ON CONFLICT(user_id) DO UPDATE SET steam_id = excluded.steam_id, " +
      "updated_at = excluded.updated_at",
    [userId, steam64],
  );
}

// ---------------- avatars ----------------

/** Default deterministic Discord avatar for a uid (no DB). */
export function defaultAvatar(userId: bigint): string {
  return `https://cdn.discordapp.com/embed/avatars/${(userId >> 22n) % 6n}.png`;
}

/** All custom avatars in one query (uid string -> url). Used for the ladder. */
export async function allAvatars(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const rows = await query("SELECT user_id, avatar_url FROM player_avatars");
    for (const r of rows) {
      if (r.avatar_url) map.set(str(r.user_id), str(r.avatar_url));
    }
  } catch {
    /* table may not exist */
  }
  return map;
}

export async function getAvatar(userId: bigint): Promise<string> {
  try {
    const row = await queryOne(
      "SELECT avatar_url FROM player_avatars WHERE user_id = ?",
      [userId],
    );
    if (row && row.avatar_url) return str(row.avatar_url);
  } catch {
    /* table may not exist on older DBs */
  }
  return defaultAvatar(userId);
}

// ---------------- v3 mmr ----------------

export interface V3Row {
  current_mmr: number;
  peak_mmr: number;
  calibration_games: number;
  wins: number;
  losses: number;
  current_streak: number;
  last_10_games: string;
}

export async function getV3(userId: bigint): Promise<V3Row | null> {
  const row = await queryOne(
    "SELECT current_mmr, peak_mmr, calibration_games, wins, losses," +
      "       current_streak, last_10_games " +
      "FROM player_mmr_v3 WHERE guild_id = ? AND user_id = ?",
    [GUILD_ID, userId],
  );
  if (!row) return null;
  return {
    current_mmr: num(row.current_mmr),
    peak_mmr: num(row.peak_mmr),
    calibration_games: num(row.calibration_games),
    wins: num(row.wins),
    losses: num(row.losses),
    current_streak: num(row.current_streak),
    last_10_games: str(row.last_10_games),
  };
}

// ---------------- predictions ----------------

export interface PredRow {
  total_points: number;
  correct_predictions: number;
  wrong_predictions: number;
  prediction_streak: number;
}

export async function getPredictions(userId: bigint): Promise<PredRow | null> {
  const row = await queryOne(
    "SELECT total_points, correct_predictions, wrong_predictions," +
      "       prediction_streak " +
      "FROM prediction_points WHERE user_id = ?",
    [userId],
  );
  if (!row) return null;
  return {
    total_points: num(row.total_points),
    correct_predictions: num(row.correct_predictions),
    wrong_predictions: num(row.wrong_predictions),
    prediction_streak: num(row.prediction_streak),
  };
}

// ---------------- stratz rank ----------------

export async function getStratzRank(userId: bigint): Promise<string | null> {
  const row = await queryOne(
    "SELECT stratz_rank FROM player_mmr WHERE guild_id = ? AND user_id = ?",
    [GUILD_ID, userId],
  );
  if (row && row.stratz_rank) return str(row.stratz_rank);
  return null;
}

// ---------------- leaderboard position ----------------

export async function getRankPosition(
  userId: bigint,
): Promise<[number | null, number]> {
  const rows = await query(
    "SELECT user_id FROM player_mmr_v3 " +
      "WHERE guild_id = ? AND (wins + losses) > 0 ORDER BY current_mmr DESC",
    [GUILD_ID],
  );
  for (let i = 0; i < rows.length; i++) {
    if (BigInt(rows[i].user_id as bigint) === userId) {
      return [i + 1, rows.length];
    }
  }
  return [null, rows.length];
}

// ---------------- display names (uid -> latest name from match history) ----------------

let _nameCache: { built: number; map: Map<string, string> } = {
  built: 0,
  map: new Map(),
};

export async function nameMap(): Promise<Map<string, string>> {
  if (Date.now() / 1000 - _nameCache.built <= 300) return _nameCache.map;
  const rows = await query(
    "SELECT team1_ids, team2_ids, team1_names, team2_names " +
      "FROM match_history WHERE guild_id = ? ORDER BY timestamp",
    [GUILD_ID],
  );
  const nm = new Map<string, string>();
  for (const r of rows) {
    const pairs: [unknown, unknown][] = [
      [r.team1_ids, r.team1_names],
      [r.team2_ids, r.team2_names],
    ];
    for (const [idsRaw, namesRaw] of pairs) {
      if (!idsRaw || !namesRaw) continue;
      const ids = str(idsRaw).split(",");
      const names = str(namesRaw).split(",");
      const n = Math.min(ids.length, names.length);
      for (let i = 0; i < n; i++) {
        const id = ids[i].trim();
        const nme = names[i].trim();
        if (id && nme) nm.set(id, nme);
      }
    }
  }
  _nameCache = { built: Date.now() / 1000, map: nm };
  return nm;
}

// ---------------- live games (mirror of bot's /live) ----------------

export interface LivePlayer {
  name: string;
  hero: string | null;
}
export interface LiveGame {
  match_id: string;
  spectators: number;
  radiant: string;
  dire: string;
  rad_wins: number;
  dire_wins: number;
  updated: string;
  radiant_players: LivePlayer[];
  dire_players: LivePlayer[];
}

export async function getLiveGames(): Promise<LiveGame[]> {
  const { heroName } = await import("./heroes");
  try {
    const games = await query(
      "SELECT match_id, league_id, spectators, radiant_team_name," +
        "       dire_team_name, radiant_series_wins, dire_series_wins," +
        "       last_updated " +
        "FROM live_league_games ORDER BY spectators DESC LIMIT 10",
    );
    const out: LiveGame[] = [];
    for (const g of games) {
      const players = await query(
        "SELECT name, team, hero_id FROM live_league_players WHERE match_id = ?",
        [g.match_id as bigint],
      );
      const side = (t: number): LivePlayer[] =>
        players
          .filter((p) => num(p.team) === t)
          .map((p) => ({
            name: str(p.name) || "Unknown",
            hero: p.hero_id ? heroName(num(p.hero_id)) : null,
          }))
          .slice(0, 5);
      out.push({
        match_id: str(g.match_id),
        spectators: num(g.spectators),
        radiant: str(g.radiant_team_name) || "Radiant",
        dire: str(g.dire_team_name) || "Dire",
        rad_wins: num(g.radiant_series_wins),
        dire_wins: num(g.dire_series_wins),
        updated: str(g.last_updated),
        radiant_players: side(0),
        dire_players: side(1),
      });
    }
    return out;
  } catch {
    return []; // tables not created yet
  }
}

// re-export for convenience
export { STEAM_ID_BASE, GUILD_ID };
