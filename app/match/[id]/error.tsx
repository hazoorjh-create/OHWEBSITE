"use client";

import { OhHeader } from "@/components/players/OhHeader";
import "@/app/players.css";

export default function ErrorPage() {
  return (
    <div className="oh-page">
      <OhHeader />
      <main style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="empty">
          MATCH LOG NOT FOUND
          <div style={{ marginTop: "20px" }}>
            <a href="/" className="btn ghost">← Return to Factory</a>
          </div>
        </div>
      </main>
    </div>
  );
}
