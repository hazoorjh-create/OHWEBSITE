import { createClient, type Client, type InValue } from "@libsql/client";

/**
 * Single libSQL (Turso) client, shared across the app.
 *
 * IMPORTANT: intMode is "bigint". Discord snowflakes (user_id ~1.4e18),
 * steam64 ids (~7.6e16) and the guild id all exceed Number.MAX_SAFE_INTEGER,
 * so reading them as JS `number` would silently corrupt them. We keep integer
 * columns as bigint and convert the small ones with Number() at the edges.
 */
let _client: Client | null = null;

export function db(): Client {
  if (_client) return _client;
  const url = process.env.DB_URL;
  if (!url) throw new Error("DB_URL is not set");
  _client = createClient({
    url,
    authToken: process.env.DB_TOKEN,
    intMode: "bigint",
  });
  return _client;
}

/** Run a query and return rows as plain objects (column name -> value). */
export async function query(
  sql: string,
  args: InValue[] = [],
): Promise<Record<string, unknown>[]> {
  const res = await db().execute({ sql, args });
  return res.rows as unknown as Record<string, unknown>[];
}

/** Run a query and return the first row, or null. */
export async function queryOne(
  sql: string,
  args: InValue[] = [],
): Promise<Record<string, unknown> | null> {
  const rows = await query(sql, args);
  return rows[0] ?? null;
}

// ---- small typed coercion helpers (libSQL bigint/null -> JS) ----

export function num(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "bigint") return Number(v);
  if (typeof v === "number") return v;
  return Number(v as string);
}

/** Nullable number — preserves null/undefined instead of coercing to 0. */
export function numOrNull(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  return num(v);
}

export function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

export function bool(v: unknown): boolean {
  return num(v) !== 0;
}
