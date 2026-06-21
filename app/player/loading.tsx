import "../players.css";
import { OhHeader } from "@/components/players/OhHeader";

export default function Loading() {
  return (
    <div className="oh-page">
      <OhHeader />
      <main style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          fontFamily: "var(--font-display)",
          color: "var(--orange)",
          fontSize: "24px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          animation: "pulse 1.4s infinite"
        }}>
          ACCESSING DATABANKS...
        </div>
      </main>
    </div>
  );
}
