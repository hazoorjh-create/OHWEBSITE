"""
ONLYHUMANS website server — lives in the bot_rv folder, next to queue_bot.db.

Serves onlyhumans-factory.html, handles Discord OAuth sign-in, and exposes
profile APIs backed by the same DB the bot writes (steam_links, player_mmr_v3,
prediction_points, match_cache). Mirrors the /stats and /link logic of bot_rv.

Run:      python oh_web.py
Deps:     aiohttp (already installed with discord.py)

Required environment (or .env in the same folder):
  OH_CLIENT_ID      Discord application client id
  OH_CLIENT_SECRET  Discord application client secret
  OH_REDIRECT_URI   e.g. http://localhost:8080/auth/callback   (must be added
                    in Discord Developer Portal -> OAuth2 -> Redirects)
Optional:
  OH_PORT           default 8080
  OH_DB             default queue_bot.db
  OH_GUILD          default 1474184101048356976  (OnlyHumans)
  OH_SITE           default onlyhumans-factory.html
  OH_SESSION_SECRET default: auto-generated, persisted to .oh_session_secret
"""

import asyncio
import base64
import hashlib
import hmac
import json
import os
import secrets
import sqlite3
import time
import urllib.parse
from pathlib import Path

from aiohttp import web, ClientSession

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ---------------- config ----------------
BASE_DIR = Path(__file__).parent
CLIENT_ID = os.getenv("OH_CLIENT_ID", "")
CLIENT_SECRET = os.getenv("OH_CLIENT_SECRET", "")
REDIRECT_URI = os.getenv("OH_REDIRECT_URI", "http://localhost:8080/auth/callback")
PORT = int(os.getenv("OH_PORT", "8080"))
DB_FILE = os.getenv("OH_DB", str(BASE_DIR / "queue_bot.db"))
GUILD_ID = int(os.getenv("OH_GUILD", "1474184101048356976"))
SITE_FILE = os.getenv("OH_SITE", str(BASE_DIR / "onlyhumans-factory.html"))
LEAGUE_ID = int(os.getenv("OH_LEAGUE", "19415"))
STEAM_ID_BASE = 76561197960265728
SESSION_TTL = 7 * 24 * 3600  # 1 week
SECURE_COOKIES = REDIRECT_URI.startswith("https")

_secret_file = BASE_DIR / ".oh_session_secret"
SESSION_SECRET = os.getenv("OH_SESSION_SECRET", "")
if not SESSION_SECRET:
    if _secret_file.exists():
        SESSION_SECRET = _secret_file.read_text().strip()
    else:
        SESSION_SECRET = secrets.token_hex(32)
        _secret_file.write_text(SESSION_SECRET)
        try:
            os.chmod(_secret_file, 0o600)
        except OSError:
            pass
SECRET = SESSION_SECRET.encode()

# hero names: prefer the bot's own module, fall back to a built-in map
_HEROES = {1:"Anti-Mage",2:"Axe",3:"Bane",4:"Bloodseeker",5:"Crystal Maiden",6:"Drow Ranger",7:"Earthshaker",8:"Juggernaut",9:"Mirana",10:"Morphling",11:"Shadow Fiend",12:"Phantom Lancer",13:"Puck",14:"Pudge",15:"Razor",16:"Sand King",17:"Storm Spirit",18:"Sven",19:"Tiny",20:"Vengeful Spirit",21:"Windranger",22:"Zeus",23:"Kunkka",25:"Lina",26:"Lion",27:"Shadow Shaman",28:"Slardar",29:"Tidehunter",30:"Witch Doctor",31:"Lich",32:"Riki",33:"Enigma",34:"Tinker",35:"Sniper",36:"Necrophos",37:"Warlock",38:"Beastmaster",39:"Queen of Pain",40:"Venomancer",41:"Faceless Void",42:"Wraith King",43:"Death Prophet",44:"Phantom Assassin",45:"Pugna",46:"Templar Assassin",47:"Viper",48:"Luna",49:"Dragon Knight",50:"Dazzle",51:"Clockwerk",52:"Leshrac",53:"Nature's Prophet",54:"Lifestealer",55:"Dark Seer",56:"Clinkz",57:"Omniknight",58:"Enchantress",59:"Huskar",60:"Night Stalker",61:"Broodmother",62:"Bounty Hunter",63:"Weaver",64:"Jakiro",65:"Batrider",66:"Chen",67:"Spectre",68:"Ancient Apparition",69:"Doom",70:"Ursa",71:"Spirit Breaker",72:"Gyrocopter",73:"Alchemist",74:"Invoker",75:"Silencer",76:"Outworld Destroyer",77:"Lycan",78:"Brewmaster",79:"Shadow Demon",80:"Lone Druid",81:"Chaos Knight",82:"Meepo",83:"Treant Protector",84:"Ogre Magi",85:"Undying",86:"Rubick",87:"Disruptor",88:"Nyx Assassin",89:"Naga Siren",90:"Keeper of the Light",91:"Io",92:"Visage",93:"Slark",94:"Medusa",95:"Troll Warlord",96:"Centaur Warrunner",97:"Magnus",98:"Timbersaw",99:"Bristleback",100:"Tusk",101:"Skywrath Mage",102:"Abaddon",103:"Elder Titan",104:"Legion Commander",105:"Techies",106:"Ember Spirit",107:"Earth Spirit",108:"Underlord",109:"Terrorblade",110:"Phoenix",111:"Oracle",112:"Winter Wyvern",113:"Arc Warden",114:"Monkey King",119:"Dark Willow",120:"Pangolier",121:"Grimstroke",123:"Hoodwink",126:"Void Spirit",128:"Snapfire",129:"Mars",131:"Ringmaster",135:"Dawnbreaker",136:"Marci",137:"Primal Beast",138:"Muerta",145:"Kez",155:"Largo"}
try:
    import analysedota  # noqa: E402  (same folder as the bot)
    def hero_name(hid): return analysedota.get_hero_name(hid)
except Exception:
    def hero_name(hid): return _HEROES.get(hid, f"Hero {hid}")


# ---------------- db helpers ----------------
def db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def get_steam_id(user_id: int):
    with db() as conn:
        row = conn.execute(
            "SELECT steam_id FROM steam_links WHERE user_id = ?", (user_id,)
        ).fetchone()
    return row["steam_id"] if row else None


def get_avatar(user_id: int) -> str:
    """Return player's Discord avatar URL. Falls back to deterministic default."""
    try:
        with db() as conn:
            row = conn.execute(
                "SELECT avatar_url FROM player_avatars WHERE user_id = ?", (user_id,)
            ).fetchone()
        if row and row["avatar_url"]:
            return row["avatar_url"]
    except Exception:
        pass
    return f"https://cdn.discordapp.com/embed/avatars/{(user_id >> 22) % 6}.png"


def get_v3(user_id: int):
    with db() as conn:
        return conn.execute(
            "SELECT current_mmr, peak_mmr, calibration_games, wins, losses,"
            "       current_streak, last_10_games "
            "FROM player_mmr_v3 WHERE guild_id = ? AND user_id = ?",
            (GUILD_ID, user_id),
        ).fetchone()


def get_predictions(user_id: int):
    with db() as conn:
        return conn.execute(
            "SELECT total_points, correct_predictions, wrong_predictions,"
            "       prediction_streak "
            "FROM prediction_points WHERE user_id = ?",
            (user_id,),
        ).fetchone()


def get_stratz_rank(user_id: int):
    with db() as conn:
        row = conn.execute(
            "SELECT stratz_rank FROM player_mmr WHERE guild_id = ? AND user_id = ?",
            (GUILD_ID, user_id),
        ).fetchone()
    return row["stratz_rank"] if row and row["stratz_rank"] else None


def get_rank_position(user_id: int):
    """Leaderboard position among players with games, by current_mmr."""
    with db() as conn:
        rows = conn.execute(
            "SELECT user_id FROM player_mmr_v3 "
            "WHERE guild_id = ? AND (wins + losses) > 0 ORDER BY current_mmr DESC",
            (GUILD_ID,),
        ).fetchall()
    for i, r in enumerate(rows, 1):
        if r["user_id"] == user_id:
            return i, len(rows)
    return None, len(rows)


# ---------------- player index (heroes + per-match stats from match_cache) ----------------
_pidx = {"built": 0.0, "heroes": {}, "matches": {}}


def _build_player_index():
    heroes, matches = {}, {}
    with db() as conn:
        rows = conn.execute("SELECT match_id, data_json FROM match_cache").fetchall()
    for r in rows:
        try:
            m = json.loads(r["data_json"])
        except Exception:
            continue
        rad_win = bool(m.get("radiant_win"))
        dur = m.get("duration") or 0
        ts = m.get("start_time") or 0
        mid = m.get("match_id") or r["match_id"]
        for p in m.get("players") or []:
            acc, hid = p.get("account_id"), p.get("hero_id")
            if not acc or not hid:
                continue
            won = (p.get("player_slot", 0) < 128) == rad_win
            slot = heroes.setdefault(acc, {}).setdefault(hid, [0, 0, 0, 0, 0])
            slot[0] += 1
            if won:
                slot[1] += 1
            slot[2] += p.get("kills") or 0
            slot[3] += p.get("deaths") or 0
            slot[4] += p.get("assists") or 0
            matches.setdefault(acc, {})[str(mid)] = {
                "match_id": str(mid), "hero_id": hid, "won": won,
                "k": p.get("kills") or 0, "d": p.get("deaths") or 0,
                "a": p.get("assists") or 0,
                "gpm": p.get("gold_per_min") or 0, "xpm": p.get("xp_per_min") or 0,
                "lh": p.get("last_hits") or 0, "dur": dur, "ts": ts,
            }
    _pidx.update(heroes=heroes, matches=matches, built=time.time())


def _idx():
    if time.time() - _pidx["built"] > 300:
        _build_player_index()
    return _pidx


def signature_heroes(account_id: int, top=3):
    heroes = _idx()["heroes"].get(account_id, {})
    ranked = sorted(heroes.items(), key=lambda kv: (-kv[1][0], -kv[1][1]))[:top]
    return [{"name": hero_name(h), "games": s[0], "wins": s[1]} for h, s in ranked]


def player_heroes(account_id: int):
    heroes = _idx()["heroes"].get(account_id, {})
    out = []
    for h, (g, w, k, d, a) in sorted(heroes.items(), key=lambda kv: -kv[1][0]):
        out.append({"name": hero_name(h), "img": hero_img(h), "games": g,
                    "wins": w, "losses": g - w,
                    "wr": round(w / g * 100) if g else 0,
                    "kda": f"{k/g:.1f}/{d/g:.1f}/{a/g:.1f}" if g else "-"})
    return out


def player_matches(account_id: int, limit=50):
    ms = list(_idx()["matches"].get(account_id, {}).values())
    ms.sort(key=lambda x: -x["ts"])
    for m in ms:
        m["hero"] = hero_name(m["hero_id"])
        m["img"] = hero_img(m["hero_id"])
    return ms[:limit]


# ---------------- display names (uid -> latest name from match history) ----------------
_names = {"built": 0.0, "map": {}}


def name_map():
    if time.time() - _names["built"] > 300:
        nm = {}
        with db() as conn:
            rows = conn.execute(
                "SELECT team1_ids, team2_ids, team1_names, team2_names "
                "FROM match_history WHERE guild_id = ? ORDER BY timestamp", (GUILD_ID,)
            ).fetchall()
        for r in rows:
            for ids, names in ((r[0], r[2]), (r[1], r[3])):
                if not ids or not names:
                    continue
                for i, n in zip(ids.split(","), names.split(",")):
                    if i.strip() and n.strip():
                        nm[int(i)] = n.strip()
        _names.update(map=nm, built=time.time())
    return _names["map"]


# ---------------- hero portrait urls (same mapping as bot_rv) ----------------
_HERO_IMG_FIX = {
    "natures_prophet": "furion", "lifestealer": "life_stealer",
    "wraith_king": "skeleton_king", "clockwerk": "rattletrap",
    "timbersaw": "shredder", "zeus": "zuus", "doom": "doom_bringer",
    "io": "wisp", "centaur_warrunner": "centaur", "treant_protector": "treant",
    "outworld_destroyer": "obsidian_destroyer", "shadow_fiend": "nevermore",
    "magnus": "magnataur", "underlord": "abyssal_underlord",
    "queen_of_pain": "queenofpain", "vengeful_spirit": "vengefulspirit",
    "windranger": "windrunner", "necrophos": "necrolyte",
    "wraith_king": "skeleton_king", "keeper_of_the_light": "keeper_of_the_light",
}


def hero_img(hid: int) -> str:
    short = hero_name(hid).lower().replace(" ", "_").replace("-", "").replace("'", "")
    short = _HERO_IMG_FIX.get(short, short)
    return f"https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/{short}.png"


# ---------------- rate limiting ----------------
_buckets = {}


def rate_ok(key: str, limit: int, per: float) -> bool:
    now = time.time()
    q = _buckets.setdefault(key, [])
    while q and q[0] < now - per:
        q.pop(0)
    if len(q) >= limit:
        return False
    q.append(now)
    return True


def client_ip(request) -> str:
    return request.headers.get("X-Forwarded-For", request.remote or "?").split(",")[0].strip()


# ---------------- steam link resolution (mirrors analysedota.resolve_steam_input) ----------------
import re as _re

async def _resolve_vanity(vanity: str):
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
               "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"}
    async with ClientSession(headers=headers) as http:
        for url in (f"https://steamcommunity.com/id/{vanity}/?xml=1",
                    f"https://steamcommunity.com/id/{vanity}/"):
            try:
                async with http.get(url, timeout=10) as resp:
                    if resp.status != 200:
                        continue
                    text = await resp.text()
                    m = (_re.search(r"<steamID64>(\d+)</steamID64>", text)
                         or _re.search(r'"steamid"\s*:\s*"(\d+)"', text))
                    if m:
                        return int(m.group(1))
            except Exception:
                continue
    return None


async def resolve_steam_input(steam_input: str):
    """(steam64, id_type) or (None, error). Same cases as the bot's /link."""
    try:
        import analysedota as _ad  # use the bot's resolver when available
        return await _ad.resolve_steam_input(steam_input)
    except ImportError:
        pass

    clean = steam_input.strip().split("?")[0].split("#")[0].rstrip("/")
    if "steamcommunity.com/profiles/" in clean:
        numeric = clean.split("steamcommunity.com/profiles/")[1].split("/")[0]
        if numeric.isdigit():
            return int(numeric), "Profile URL"
        return None, "Could not extract Steam ID from profile URL."

    vanity = None
    if "steamcommunity.com/id/" in clean:
        vanity = clean.split("steamcommunity.com/id/")[1].split("/")[0]
    elif not clean.isdigit() and "/" not in clean and clean:
        vanity = clean
    if vanity:
        resolved = await _resolve_vanity(vanity)
        if resolved:
            return resolved, f"Vanity URL ({vanity})"
        return None, f"Could not resolve vanity '{vanity}'. Check the name and try again."

    if clean.isdigit():
        num = int(clean)
        if num < 1000000000:
            return num + STEAM_ID_BASE, "Friend ID (Converted)"
        return num, "Steam64 ID"

    return None, ("Unrecognized format. Use a Steam profile URL, vanity URL, "
                  "friend ID, or Steam64 ID.")


def link_steam_account(user_id: int, steam64: int):
    with db() as conn:
        conn.execute(
            "INSERT INTO steam_links (user_id, steam_id, updated_at) "
            "VALUES (?, ?, datetime('now')) "
            "ON CONFLICT(user_id) DO UPDATE SET steam_id = excluded.steam_id, "
            "updated_at = excluded.updated_at",
            (user_id, steam64),
        )
        conn.commit()


def steam_in_use_by(steam64: int):
    with db() as conn:
        row = conn.execute(
            "SELECT user_id FROM steam_links WHERE steam_id = ?", (steam64,)
        ).fetchone()
    return row["user_id"] if row else None


# ---------------- session cookies ----------------
def _sign(payload: bytes) -> str:
    return hmac.new(SECRET, payload, hashlib.sha256).hexdigest()


def make_session(user: dict) -> str:
    body = json.dumps(
        {"id": user["id"], "name": user["name"], "av": user["av"],
         "exp": int(time.time()) + SESSION_TTL},
        separators=(",", ":"),
    ).encode()
    b = base64.urlsafe_b64encode(body).decode().rstrip("=")
    return f"{b}.{_sign(body)}"


def read_session(request):
    raw = request.cookies.get("oh_session")
    if not raw or "." not in raw:
        return None
    b, sig = raw.rsplit(".", 1)
    try:
        body = base64.urlsafe_b64decode(b + "=" * (-len(b) % 4))
    except Exception:
        return None
    if not hmac.compare_digest(_sign(body), sig):
        return None
    try:
        data = json.loads(body)
    except Exception:
        return None
    if data.get("exp", 0) < time.time():
        return None
    return data


# ---------------- security middleware ----------------
CSP = ("default-src 'self'; "
       "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; "
       "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
       "font-src https://fonts.gstatic.com; "
       "img-src 'self' data: https://cdn.discordapp.com https://cdn.cloudflare.steamstatic.com; "
       "connect-src 'self'; frame-ancestors 'none'; base-uri 'self'")


@web.middleware
async def security_mw(request, handler):
    # same-origin enforcement for state-changing requests (CSRF backstop)
    if request.method == "POST":
        origin = request.headers.get("Origin", "")
        if origin:
            if urllib.parse.urlparse(origin).netloc != request.headers.get("Host", ""):
                return web.json_response({"ok": False, "error": "Bad origin."}, status=403)
        if not rate_ok("post:" + client_ip(request), 20, 60):
            return web.json_response({"ok": False, "error": "Slow down."}, status=429)
    elif request.path.startswith("/api/"):
        if not rate_ok("api:" + client_ip(request), 120, 60):
            return web.json_response({"error": "Rate limited."}, status=429)
    elif request.path.startswith("/auth/"):
        if not rate_ok("auth:" + client_ip(request), 15, 60):
            return web.Response(text="Rate limited.", status=429)

    try:
        resp = await handler(request)
    except web.HTTPException:
        raise
    except Exception:
        return web.json_response({"error": "Internal error."}, status=500)

    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["X-Frame-Options"] = "DENY"
    resp.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    resp.headers["Content-Security-Policy"] = CSP
    if SECURE_COOKIES:
        resp.headers["Strict-Transport-Security"] = "max-age=31536000"
    return resp


# ---------------- routes ----------------
async def index(request):
    return web.FileResponse(SITE_FILE)


async def players_page(request):
    return web.FileResponse(BASE_DIR / "players.html")


async def register_page(request):
    return web.FileResponse(BASE_DIR / "register.html")


async def logo(request):
    p = BASE_DIR / "logo.png"
    if p.exists():
        return web.FileResponse(p)
    raise web.HTTPNotFound()


async def auth_login(request):
    if not CLIENT_ID or not CLIENT_SECRET:
        return web.Response(
            text="Discord OAuth is not configured (OH_CLIENT_ID / OH_CLIENT_SECRET).",
            status=503,
        )
    state = secrets.token_urlsafe(24)
    params = urllib.parse.urlencode({
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": "identify",
        "state": state,
        "prompt": "none",
    })
    resp = web.HTTPFound(f"https://discord.com/oauth2/authorize?{params}")
    resp.set_cookie("oh_state", state, max_age=600, httponly=True, samesite="Lax")
    return resp


async def auth_callback(request):
    code = request.query.get("code")
    state = request.query.get("state")
    if not code or not state or state != request.cookies.get("oh_state"):
        return web.HTTPFound("/?auth=failed")

    async with ClientSession() as http:
        token_resp = await http.post(
            "https://discord.com/api/oauth2/token",
            data={
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": REDIRECT_URI,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        token = await token_resp.json()
        access = token.get("access_token")
        if not access:
            return web.HTTPFound("/?auth=failed")

        user_resp = await http.get(
            "https://discord.com/api/users/@me",
            headers={"Authorization": f"Bearer {access}"},
        )
        u = await user_resp.json()

    user = {
        "id": str(u["id"]),
        "name": u.get("global_name") or u.get("username") or "Unknown",
        "av": u.get("avatar") or "",
    }
    resp = web.HTTPFound("/?auth=ok")
    resp.set_cookie(
        "oh_session", make_session(user),
        max_age=SESSION_TTL, httponly=True, samesite="Lax", secure=SECURE_COOKIES,
    )
    resp.del_cookie("oh_state")
    return resp


async def auth_logout(request):
    resp = web.HTTPFound("/")
    resp.del_cookie("oh_session")
    return resp


async def api_me(request):
    sess = read_session(request)
    if not sess:
        return web.json_response({"auth": False})

    uid = int(sess["id"])
    steam64 = get_steam_id(uid)
    steam = {"linked": False}
    if steam64:
        acc = steam64 - STEAM_ID_BASE
        steam = {
            "linked": True,
            "steam64": str(steam64),
            "account_id": acc,
            "profile_url": f"https://steamcommunity.com/profiles/{steam64}",
            "dotabuff_url": f"https://www.dotabuff.com/players/{acc}",
            "opendota_url": f"https://www.opendota.com/players/{acc}",
        }
    av = sess.get("av") or ""
    avatar_url = (
        f"https://cdn.discordapp.com/avatars/{sess['id']}/{av}.png?size=128"
        if av else
        f"https://cdn.discordapp.com/embed/avatars/{(uid >> 22) % 6}.png"
    )
    return web.json_response({
        "auth": True,
        "user": {"id": sess["id"], "name": sess["name"], "avatar": avatar_url},
        "steam": steam,
    })


async def api_stats(request):
    """Local-DB mirror of the bot's /stats command for the signed-in user."""
    sess = read_session(request)
    if not sess:
        return web.json_response({"error": "not signed in"}, status=401)

    uid = int(sess["id"])
    v3 = get_v3(uid)
    preds = get_predictions(uid)
    steam64 = get_steam_id(uid)

    out = {"name": sess["name"], "has_games": False}

    if v3:
        wins, losses = v3["wins"], v3["losses"]
        games = wins + losses
        out.update({
            "has_games": games > 0,
            "mmr": round(v3["current_mmr"]),
            "peak": round(max(v3["peak_mmr"], v3["current_mmr"])),
            "wins": wins,
            "losses": losses,
            "games": games,
            "winrate": round(wins / games * 100, 1) if games else 0,
            "streak": v3["current_streak"],
            "last10": v3["last_10_games"] or "",
            "calibration_left": max(0, 10 - v3["calibration_games"]),
        })
        pos, total = get_rank_position(uid)
        if pos:
            out["rank"] = pos
            out["rank_of"] = total

    rank = get_stratz_rank(uid)
    if rank:
        out["dota_rank"] = rank

    if preds:
        out["predictions"] = {
            "points": preds["total_points"],
            "correct": preds["correct_predictions"],
            "wrong": preds["wrong_predictions"],
            "streak": preds["prediction_streak"],
        }

    if steam64:
        out["heroes"] = signature_heroes(steam64 - STEAM_ID_BASE)

    return web.json_response(out)



async def api_link(request):
    """Website version of the bot's /link — resolves and writes steam_links."""
    sess = read_session(request)
    if not sess:
        return web.json_response({"ok": False, "error": "Not signed in."}, status=401)

    uid = int(sess["id"])
    if not rate_ok(f"link:{uid}", 3, 600):
        return web.json_response({"ok": False,
            "error": "Too many link attempts. Try again in a few minutes."})
    existing = get_steam_id(uid)
    if existing:
        return web.json_response({
            "ok": False,
            "error": f"You are already linked to Steam ID {existing}. "
                     "Use /unlink in Discord first if you need to relink.",
        })

    try:
        body = await request.json()
    except Exception:
        return web.json_response({"ok": False, "error": "Bad request."}, status=400)
    raw = str(body.get("steam", ""))[:200].strip()
    if not raw:
        return web.json_response({"ok": False, "error": "Enter a Steam ID or URL."})

    sid, id_type = await resolve_steam_input(raw)
    if not sid:
        return web.json_response({"ok": False, "error": id_type})
    if sid < STEAM_ID_BASE:
        return web.json_response({"ok": False, "error": "Invalid ID detected. Please check your input."})

    taken_by = steam_in_use_by(sid)
    if taken_by and taken_by != uid:
        return web.json_response({"ok": False,
            "error": "That Steam account is already linked to another Discord user."})

    link_steam_account(uid, sid)
    acc = sid - STEAM_ID_BASE
    return web.json_response({
        "ok": True,
        "id_type": id_type,
        "steam64": str(sid),
        "account_id": acc,
        "profile_url": f"https://steamcommunity.com/profiles/{sid}",
        "dotabuff_url": f"https://www.dotabuff.com/players/{acc}",
    })



def get_live_games():
    """Mirror of the bot's /live — reads tables fed by poll_live_games."""
    try:
        with db() as conn:
            games = conn.execute(
                "SELECT match_id, league_id, spectators, radiant_team_name,"
                "       dire_team_name, radiant_series_wins, dire_series_wins,"
                "       last_updated "
                "FROM live_league_games ORDER BY spectators DESC LIMIT 10"
            ).fetchall()
            out = []
            for g in games:
                players = conn.execute(
                    "SELECT name, team, hero_id FROM live_league_players "
                    "WHERE match_id = ?", (g["match_id"],)
                ).fetchall()
                def side(t):
                    return [{"name": p["name"] or "Unknown",
                             "hero": hero_name(p["hero_id"]) if p["hero_id"] else None}
                            for p in players if p["team"] == t][:5]
                out.append({
                    "match_id": str(g["match_id"]),
                    "spectators": g["spectators"] or 0,
                    "radiant": g["radiant_team_name"] or "Radiant",
                    "dire": g["dire_team_name"] or "Dire",
                    "rad_wins": g["radiant_series_wins"] or 0,
                    "dire_wins": g["dire_series_wins"] or 0,
                    "updated": g["last_updated"],
                    "radiant_players": side(0),
                    "dire_players": side(1),
                })
            return out
    except sqlite3.OperationalError:
        return []  # tables not created yet (bot hasn't started this version)


async def api_live(request):
    return web.json_response(get_live_games())



async def api_players(request):
    """Full board: top 100 by V3 MMR with display names + ids for profile links."""
    names = name_map()
    with db() as conn:
        rows = conn.execute(
            "SELECT v3.user_id, v3.current_mmr, v3.peak_mmr, v3.wins, v3.losses,"
            "       v3.current_streak, v3.last_10_games, v3.calibration_games,"
            "       m.stratz_rank "
            "FROM player_mmr_v3 v3 "
            "LEFT JOIN player_mmr m ON v3.user_id = m.user_id AND v3.guild_id = m.guild_id "
            "WHERE v3.guild_id = ? ORDER BY v3.current_mmr DESC", (GUILD_ID,)
        ).fetchall()
    out = []
    for i, r in enumerate(rows, 1):
        g = r["wins"] + r["losses"]
        uid = r["user_id"]
        out.append({
            "rank": i, "uid": str(uid),
            "name": names.get(uid, f"Player{str(uid)[-4:]}"),
            "avatar": get_avatar(uid),
            "mmr": round(r["current_mmr"]), "peak": round(max(r["peak_mmr"], r["current_mmr"])),
            "wins": r["wins"], "losses": r["losses"], "games": g,
            "wr": round(r["wins"] / g * 100) if g else 0,
            "streak": r["current_streak"], "last10": r["last_10_games"] or "",
            "calibrated": r["calibration_games"] >= 10,
            "dota_rank": r["stratz_rank"] or None,
        })
    return web.json_response({"players": out, "total": len(out)})


async def api_player(request):
    """Public profile: identity, stats, matches, heroes, MMR history."""
    uid_s = request.match_info["uid"]
    if not uid_s.isdigit() or len(uid_s) > 25:
        return web.json_response({"error": "Bad id."}, status=400)
    uid = int(uid_s)

    names = name_map()
    v3 = get_v3(uid)
    steam64 = get_steam_id(uid)
    if not v3 and not steam64 and uid not in names:
        return web.json_response({"error": "Player not found."}, status=404)

    out = {"uid": uid_s, "name": names.get(uid, f"Player{uid_s[-4:]}"), "avatar": get_avatar(uid)}

    if steam64:
        acc = steam64 - STEAM_ID_BASE
        out["steam"] = {
            "steam64": str(steam64), "account_id": acc,
            "profile_url": f"https://steamcommunity.com/profiles/{steam64}",
            "dotabuff_url": f"https://www.dotabuff.com/players/{acc}",
            "opendota_url": f"https://www.opendota.com/players/{acc}",
        }
        out["matches"] = player_matches(acc)
        out["heroes"] = player_heroes(acc)

    if v3:
        w, l = v3["wins"], v3["losses"]
        g = w + l
        pos, total = get_rank_position(uid)
        out["stats"] = {
            "mmr": round(v3["current_mmr"]),
            "peak": round(max(v3["peak_mmr"], v3["current_mmr"])),
            "wins": w, "losses": l, "games": g,
            "wr": round(w / g * 100, 1) if g else 0,
            "streak": v3["current_streak"], "last10": v3["last_10_games"] or "",
            "calibration_left": max(0, 10 - v3["calibration_games"]),
            "rank": pos, "rank_of": total,
        }

    rank = get_stratz_rank(uid)
    if rank:
        out["dota_rank"] = rank

    preds = get_predictions(uid)
    if preds and preds["total_points"]:
        out["predictions"] = {
            "points": preds["total_points"], "correct": preds["correct_predictions"],
            "wrong": preds["wrong_predictions"], "streak": preds["prediction_streak"],
        }

    with db() as conn:
        hist = conn.execute(
            "SELECT mmr_after, delta, timestamp FROM match_history_v3 "
            "WHERE guild_id = ? AND user_id = ? ORDER BY timestamp", (GUILD_ID, uid)
        ).fetchall()
    out["mmr_history"] = [
        {"mmr": round(h["mmr_after"]), "delta": h["delta"], "ts": h["timestamp"][:16]}
        for h in hist
    ]
    return web.json_response(out)


# ---------------- app ----------------
def make_app():
    app = web.Application(middlewares=[security_mw])
    app.add_routes([
        web.get("/players", players_page),
        web.get("/player/{uid}", players_page),
        web.get("/register", register_page),
        web.get("/api/players", api_players),
        web.get("/api/player/{uid}", api_player),
        web.get("/", index),
        web.get("/logo.png", logo),
        web.get("/auth/login", auth_login),
        web.get("/auth/callback", auth_callback),
        web.get("/auth/logout", auth_logout),
        web.get("/api/me", api_me),
        web.get("/api/stats", api_stats),
        web.post("/api/link", api_link),
        web.get("/api/live", api_live),
    ])
    return app


if __name__ == "__main__":
    print(f"[oh_web] site: {SITE_FILE}")
    print(f"[oh_web] db:   {DB_FILE}")
    print(f"[oh_web] http://localhost:{PORT}  (redirect: {REDIRECT_URI})")
    if not CLIENT_ID:
        print("[oh_web] WARNING: OH_CLIENT_ID / OH_CLIENT_SECRET not set — "
              "sign-in will return 503 until configured.")
    web.run_app(make_app(), port=PORT)
