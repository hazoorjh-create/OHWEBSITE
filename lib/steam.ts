import { STEAM_ID_BASE } from "./config";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120 Safari/537.36";

const isDigits = (s: string) => /^\d+$/.test(s);

async function resolveVanity(vanity: string): Promise<bigint | null> {
  for (const url of [
    `https://steamcommunity.com/id/${vanity}/?xml=1`,
    `https://steamcommunity.com/id/${vanity}/`,
  ]) {
    try {
      const resp = await fetch(url, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(10_000),
      });
      if (resp.status !== 200) continue;
      const text = await resp.text();
      const m =
        text.match(/<steamID64>(\d+)<\/steamID64>/) ||
        text.match(/"steamid"\s*:\s*"(\d+)"/);
      if (m) return BigInt(m[1]);
    } catch {
      continue;
    }
  }
  return null;
}

export interface SteamLinks {
  steam64: string;
  account_id: number;
  profile_url: string;
  dotabuff_url: string;
  opendota_url: string;
}

/** Build the public steam link object used by /api/me, /api/link, /api/player. */
export function steamLinks(steam64: bigint): SteamLinks {
  const acc = Number(steam64 - STEAM_ID_BASE);
  return {
    steam64: String(steam64),
    account_id: acc,
    profile_url: `https://steamcommunity.com/profiles/${steam64}`,
    dotabuff_url: `https://www.dotabuff.com/players/${acc}`,
    opendota_url: `https://www.opendota.com/players/${acc}`,
  };
}

export interface SteamResolution {
  steam64: bigint | null;
  idType: string;
}

/** (steam64, id_type) or (null, error). Same cases as the bot's /link. */
export async function resolveSteamInput(
  steamInput: string,
): Promise<SteamResolution> {
  const clean = steamInput.trim().split("?")[0].split("#")[0].replace(/\/+$/, "");

  if (clean.includes("steamcommunity.com/profiles/")) {
    const numeric = clean.split("steamcommunity.com/profiles/")[1].split("/")[0];
    if (isDigits(numeric)) return { steam64: BigInt(numeric), idType: "Profile URL" };
    return { steam64: null, idType: "Could not extract Steam ID from profile URL." };
  }

  let vanity: string | null = null;
  if (clean.includes("steamcommunity.com/id/")) {
    vanity = clean.split("steamcommunity.com/id/")[1].split("/")[0];
  } else if (!isDigits(clean) && !clean.includes("/") && clean) {
    vanity = clean;
  }
  if (vanity) {
    const resolved = await resolveVanity(vanity);
    if (resolved) return { steam64: resolved, idType: `Vanity URL (${vanity})` };
    return {
      steam64: null,
      idType: `Could not resolve vanity '${vanity}'. Check the name and try again.`,
    };
  }

  if (isDigits(clean)) {
    const n = BigInt(clean);
    if (n < 1_000_000_000n) {
      return { steam64: n + STEAM_ID_BASE, idType: "Friend ID (Converted)" };
    }
    return { steam64: n, idType: "Steam64 ID" };
  }

  return {
    steam64: null,
    idType:
      "Unrecognized format. Use a Steam profile URL, vanity URL, " +
      "friend ID, or Steam64 ID.",
  };
}
