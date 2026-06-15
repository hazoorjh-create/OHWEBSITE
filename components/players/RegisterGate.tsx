"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import type { Me } from "@/components/factory/auth-types";

export function RegisterGate() {
  const [me, setMe] = useState<Me | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((m: Me) => setMe(m))
      .catch(() => setMe(null));
  }, []);

  let content: React.ReactNode;
  if (me === undefined) {
    content = "CHECKING CREDENTIALS...";
  } else if (me === null) {
    content = <span className="warn">SERVER OFFLINE — CREDENTIALS UNAVAILABLE</span>;
  } else if (!me.auth) {
    content = (
      <>
        <span className="warn">⚠ NOT SIGNED IN</span> —{" "}
        <a onClick={() => signIn("discord", { callbackUrl: "/register" })}>SIGN IN WITH DISCORD</a> TO PRE-VERIFY
      </>
    );
  } else if (!me.steam?.linked) {
    content = (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={me.user!.avatar} alt="" />
        {me.user!.name} — <span className="warn">⚠ STEAM NOT LINKED</span>
        <br />
        LINK IT FROM YOUR PROFILE ON THE <a href="/">FACTORY PAGE</a>
      </>
    );
  } else {
    content = (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={me.user!.avatar} alt="" />
        {me.user!.name} — <span className="ok">✓ HUMANITY VERIFIED · STEAM LINKED</span>
        <br />
        YOU&apos;RE READY — REGISTRATION BUTTON UNLOCKS WHEN SEASON 2 OPENS
      </>
    );
  }

  return <div id="authState">{content}</div>;
}
