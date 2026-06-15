import { NextResponse } from "next/server";
import { getLiveGames } from "@/lib/queries";

export async function GET() {
  return NextResponse.json(await getLiveGames());
}
