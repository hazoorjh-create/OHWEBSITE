"use client";

import "@/app/factory.css";
import { useEffect, useRef, useState } from "react";
import type { Snapshot } from "@/lib/snapshot";
import type { Me } from "./auth-types";
import { useFactoryAnimations } from "./useFactoryAnimations";
import { TopHud } from "./TopHud";
import { SectionNav } from "./SectionNav";
import { AuthSlot } from "./AuthSlot";
import { ProfileModal } from "./ProfileModal";
import { ThemeToggle } from "./ThemeToggle";
import { Hero } from "./Hero";
import { Journey } from "./Journey";
import { Games } from "./Games";
import { Tournaments } from "./Tournaments";
import { Lift } from "./Lift";
import { Hall } from "./Hall";
import { Verify } from "./Verify";

export function FactoryPage({ snap }: { snap: Snapshot }) {
  const root = useRef<HTMLDivElement>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useFactoryAnimations(root);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((m: Me) => {
        setMe(m);
        if (m.auth && !m.steam?.linked && location.search.includes("auth=ok")) {
          setModalOpen(true);
        }
      })
      .catch(() => setMe({ auth: false }));
  }, []);

  return (
    <div ref={root}>
      <TopHud />
      <SectionNav authSlot={<AuthSlot me={me} onOpen={() => setModalOpen(true)} />} />
      <Hero />
      <Journey />
      <Games hist={snap.hist} />
      <Tournaments />
      <Lift lb={snap.lb} trend={snap.trend} generated={snap.generated} league={snap.league} />
      <Hall />
      <Verify />
      <ProfileModal me={me} open={modalOpen} onClose={() => setModalOpen(false)} setMe={setMe} />
      <ThemeToggle />
    </div>
  );
}
