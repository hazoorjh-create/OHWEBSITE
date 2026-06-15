import { query, num, str } from "./db";
import { GUILD_ID, STEAM_ID_BASE } from "./config";
import {
  getV3,
  getSteamId,
  getStratzRank,
  getPredictions,
  getRankPosition,
  getAvatar,
  nameMap,
} from "./queries";
import { steamLinks } from "./steam";
import { playerMatches, playerHeroes, type MatchLine } from "./player-index";

const round1 = (x: number) => Math.round(x * 10) / 10;

export interface ProfileData {
  uid: string;
  name: string;
  avatar: string;
  steam?: ReturnType<typeof steamLinks>;
  matches?: MatchLine[];
  heroes?: Awaited<ReturnType<typeof playerHeroes>>;
  stats?: {
    mmr: number;
    peak: number;
    wins: number;
    losses: number;
    games: number;
    wr: number;
    streak: number;
    last10: string;
    calibration_left: number;
    rank: number | null;
    rank_of: number;
  };
  dota_rank?: string;
  predictions?: {
    points: number;
    correct: number;
    wrong: number;
    streak: number;
  };
  mmr_history: { mmr: number; delta: number; ts: string }[];
}

export type ProfileResult =
  | { status: "ok"; data: ProfileData }
  | { status: "bad" }
  | { status: "notfound" };

/** Public profile assembly — identity, stats, matches, heroes, MMR history. */
export async function buildProfile(uidStr: string): Promise<ProfileResult> {
  if (!/^\d+$/.test(uidStr) || uidStr.length > 25) return { status: "bad" };
  const uid = BigInt(uidStr);

  const [names, v3, steam64] = await Promise.all([
    nameMap(),
    getV3(uid),
    getSteamId(uid),
  ]);
  if (!v3 && !steam64 && !names.has(uidStr)) return { status: "notfound" };

  const out: ProfileData = {
    uid: uidStr,
    name: names.get(uidStr) ?? `Player${uidStr.slice(-4)}`,
    avatar: await getAvatar(uid),
    mmr_history: [],
  };

  if (steam64) {
    const acc = Number(steam64 - STEAM_ID_BASE);
    out.steam = steamLinks(steam64);
    [out.matches, out.heroes] = await Promise.all([
      playerMatches(acc),
      playerHeroes(acc),
    ]);
  }

  if (v3) {
    const w = v3.wins;
    const l = v3.losses;
    const g = w + l;
    const [pos, total] = await getRankPosition(uid);
    out.stats = {
      mmr: Math.round(v3.current_mmr),
      peak: Math.round(Math.max(v3.peak_mmr, v3.current_mmr)),
      wins: w,
      losses: l,
      games: g,
      wr: g ? round1((w / g) * 100) : 0,
      streak: v3.current_streak,
      last10: v3.last_10_games || "",
      calibration_left: Math.max(0, 10 - v3.calibration_games),
      rank: pos,
      rank_of: total,
    };
  }

  const rank = await getStratzRank(uid);
  if (rank) out.dota_rank = rank;

  const preds = await getPredictions(uid);
  if (preds && preds.total_points) {
    out.predictions = {
      points: preds.total_points,
      correct: preds.correct_predictions,
      wrong: preds.wrong_predictions,
      streak: preds.prediction_streak,
    };
  }

  const hist = await query(
    "SELECT mmr_after, delta, timestamp FROM match_history_v3 " +
      "WHERE guild_id = ? AND user_id = ? ORDER BY timestamp",
    [GUILD_ID, uid],
  );
  out.mmr_history = hist.map((h) => ({
    mmr: Math.round(num(h.mmr_after)),
    delta: num(h.delta),
    ts: str(h.timestamp).slice(0, 16),
  }));

  return { status: "ok", data: out };
}
