import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

/**
 * Auth.js (NextAuth v5) — Discord OAuth, `identify` scope only (matches oh_web.py).
 * JWT session strategy: no session DB. The Discord snowflake `id` is the key used
 * for every DB lookup. Sign-in is disabled until AUTH_DISCORD_ID/SECRET are set.
 */
declare module "next-auth" {
  interface Session {
    discord: { id: string; name: string; avatar: string | null };
  }
}

interface DiscordProfile {
  id: string;
  username?: string;
  global_name?: string | null;
  avatar?: string | null;
}

interface DiscordToken {
  discordId?: string;
  discordName?: string;
  discordAvatar?: string | null;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Discord({
      clientId: process.env.AUTH_DISCORD_ID,
      clientSecret: process.env.AUTH_DISCORD_SECRET,
      authorization: { params: { scope: "identify", prompt: "none" } },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, profile }) {
      if (profile) {
        const p = profile as unknown as DiscordProfile;
        const t = token as DiscordToken;
        t.discordId = p.id;
        t.discordName = p.global_name || p.username || "Unknown";
        t.discordAvatar = p.avatar ?? null;
      }
      return token;
    },
    session({ session, token }) {
      const t = token as DiscordToken;
      session.discord = {
        id: t.discordId ?? "",
        name: t.discordName ?? "Unknown",
        avatar: t.discordAvatar ?? null,
      };
      return session;
    },
  },
});
