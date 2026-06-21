import type { Metadata } from "next";
import { getMatchDetails } from "@/lib/match";
import { Scoreboard } from "@/components/match/Scoreboard";
import { OhHeader } from "@/components/players/OhHeader";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `ONLYHUMANS — Match ${id}` };
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await getMatchDetails(id);

  if (!match) {
    notFound();
  }

  return (
    <div className="oh-page">
      <OhHeader />
      <main>
        <Scoreboard match={match} />
      </main>
    </div>
  );
}
