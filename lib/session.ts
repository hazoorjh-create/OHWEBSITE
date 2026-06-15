import { auth } from "@/auth";

export interface SessionUser {
  id: string;
  name: string;
  avatar: string | null; // raw Discord avatar hash
}

/** Current signed-in Discord user, or null. Mirrors oh_web.py read_session(). */
export async function currentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.discord?.id) return null;
  return session.discord;
}

/** Build the Discord avatar URL exactly as oh_web.py api_me does. */
export function discordAvatarUrl(id: string, avatarHash: string | null): string {
  if (avatarHash) {
    return `https://cdn.discordapp.com/avatars/${id}/${avatarHash}.png?size=128`;
  }
  return `https://cdn.discordapp.com/embed/avatars/${(BigInt(id) >> 22n) % 6n}.png`;
}
