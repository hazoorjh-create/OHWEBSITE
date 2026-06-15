import { NextResponse } from "next/server";
import { currentUser, discordAvatarUrl } from "@/lib/session";
import { getSteamId } from "@/lib/queries";
import { steamLinks } from "@/lib/steam";

export async function GET() {
  const sess = await currentUser();
  if (!sess) return NextResponse.json({ auth: false });

  const uid = BigInt(sess.id);
  const steam64 = await getSteamId(uid);
  const steam = steam64 ? { linked: true, ...steamLinks(steam64) } : { linked: false };

  return NextResponse.json({
    auth: true,
    user: {
      id: sess.id,
      name: sess.name,
      avatar: discordAvatarUrl(sess.id, sess.avatar),
    },
    steam,
  });
}
