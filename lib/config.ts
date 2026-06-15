/** App-wide constants mirroring oh_web.py. */

export const GUILD_ID: bigint = BigInt(
  process.env.OH_GUILD ?? "1474184101048356976",
);
export const LEAGUE_ID = Number(process.env.OH_LEAGUE ?? "19415");

/** Steam64 <-> account_id offset. */
export const STEAM_ID_BASE = 76561197960265728n;
