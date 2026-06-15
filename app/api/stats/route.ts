import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import {
  getV3,
  getPredictions,
  getSteamId,
  getStratzRank,
  getRankPosition,
} from "@/lib/queries";
import { signatureHeroes } from "@/lib/player-index";
import { STEAM_ID_BASE } from "@/lib/config";

const round1 = (x: number) => Math.round(x * 10) / 10;

/** Local-DB mirror of the bot's /stats for the signed-in user. */
export async function GET() {
  const sess = await currentUser();
  if (!sess) {
    return NextResponse.json({ error: "not signed in" }, { status: 401 });
  }

  const uid = BigInt(sess.id);
  const [v3, preds, steam64] = await Promise.all([
    getV3(uid),
    getPredictions(uid),
    getSteamId(uid),
  ]);

  const out: Record<string, unknown> = { name: sess.name, has_games: false };

  if (v3) {
    const { wins, losses } = v3;
    const games = wins + losses;
    Object.assign(out, {
      has_games: games > 0,
      mmr: Math.round(v3.current_mmr),
      peak: Math.round(Math.max(v3.peak_mmr, v3.current_mmr)),
      wins,
      losses,
      games,
      winrate: games ? round1((wins / games) * 100) : 0,
      streak: v3.current_streak,
      last10: v3.last_10_games || "",
      calibration_left: Math.max(0, 10 - v3.calibration_games),
    });
    const [pos, total] = await getRankPosition(uid);
    if (pos) {
      out.rank = pos;
      out.rank_of = total;
    }
  }

  const rank = await getStratzRank(uid);
  if (rank) out.dota_rank = rank;

  if (preds) {
    out.predictions = {
      points: preds.total_points,
      correct: preds.correct_predictions,
      wrong: preds.wrong_predictions,
      streak: preds.prediction_streak,
    };
  }

  if (steam64) {
    out.heroes = await signatureHeroes(Number(steam64 - STEAM_ID_BASE));
  }

  return NextResponse.json(out);
}
