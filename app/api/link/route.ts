import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { getSteamId, steamInUseBy, linkSteamAccount } from "@/lib/queries";
import { resolveSteamInput } from "@/lib/steam";
import { STEAM_ID_BASE } from "@/lib/config";
import { rateOk, sameOrigin } from "@/lib/ratelimit";

/** Website version of the bot's /link — resolves and writes steam_links. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "Bad origin." }, { status: 403 });
  }

  const sess = await currentUser();
  if (!sess) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  const uid = BigInt(sess.id);
  if (!rateOk(`link:${uid}`, 3, 600)) {
    return NextResponse.json({
      ok: false,
      error: "Too many link attempts. Try again in a few minutes.",
    });
  }

  const existing = await getSteamId(uid);
  if (existing) {
    return NextResponse.json({
      ok: false,
      error:
        `You are already linked to Steam ID ${existing}. ` +
        "Use /unlink in Discord first if you need to relink.",
    });
  }

  let body: { steam?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }
  const raw = String(body.steam ?? "").slice(0, 200).trim();
  if (!raw) {
    return NextResponse.json({ ok: false, error: "Enter a Steam ID or URL." });
  }

  const { steam64: sid, idType } = await resolveSteamInput(raw);
  if (!sid) {
    return NextResponse.json({ ok: false, error: idType });
  }
  if (sid < STEAM_ID_BASE) {
    return NextResponse.json({
      ok: false,
      error: "Invalid ID detected. Please check your input.",
    });
  }

  const takenBy = await steamInUseBy(sid);
  if (takenBy && takenBy !== uid) {
    return NextResponse.json({
      ok: false,
      error: "That Steam account is already linked to another Discord user.",
    });
  }

  await linkSteamAccount(uid, sid);
  const acc = Number(sid - STEAM_ID_BASE);
  return NextResponse.json({
    ok: true,
    id_type: idType,
    steam64: String(sid),
    account_id: acc,
    profile_url: `https://steamcommunity.com/profiles/${sid}`,
    dotabuff_url: `https://www.dotabuff.com/players/${acc}`,
  });
}
