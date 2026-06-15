"use client";

import { useState } from "react";

const initialOf = (name: string) => (name || "?").trim().charAt(0).toUpperCase();

/** Avatar image with graceful fallback to the player's initial. */
export function Avatar({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) return <>{initialOf(name)}</>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={initialOf(name)} onError={() => setFailed(true)} />;
}
