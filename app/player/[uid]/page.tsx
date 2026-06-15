import { cache } from "react";
import type { Metadata } from "next";
import "../../players.css";
import { buildProfile } from "@/lib/profile";
import { OhHeader } from "@/components/players/OhHeader";
import { PlayerProfile } from "@/components/players/PlayerProfile";

export const dynamic = "force-dynamic";

const getProfile = cache(buildProfile);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uid: string }>;
}): Promise<Metadata> {
  const { uid } = await params;
  const r = await getProfile(uid);
  return { title: r.status === "ok" ? `ONLYHUMANS — ${r.data.name}` : "ONLYHUMANS — Player" };
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = await params;
  const r = await getProfile(uid);
  return (
    <div className="oh-page">
      <OhHeader />
      <main>
        {r.status === "ok" ? (
          <PlayerProfile p={r.data} />
        ) : r.status === "notfound" ? (
          <div className="empty">PLAYER NOT FOUND ON THE FLOOR</div>
        ) : (
          <div className="empty">BAD PLAYER ID</div>
        )}
      </main>
    </div>
  );
}
