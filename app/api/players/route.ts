import { NextResponse } from "next/server";
import { getLadder } from "@/lib/board";

/** Full board: all players by V3 MMR with display names + ids for profile links. */
export async function GET() {
  const players = await getLadder();
  return NextResponse.json({ players, total: players.length });
}
