import type { Metadata } from "next";
import "../players.css";
import { getLadder } from "@/lib/board";
import { OhHeader } from "@/components/players/OhHeader";
import { LadderBoard } from "@/components/players/LadderBoard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ONLYHUMANS — Ladder",
  description: "ONLYHUMANS ladder and player profiles.",
};

export default async function PlayersPage() {
  const players = await getLadder();
  return (
    <div className="oh-page">
      <OhHeader />
      <main>
        <LadderBoard players={players} />
      </main>
    </div>
  );
}
