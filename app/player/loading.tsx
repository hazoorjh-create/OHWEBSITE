import "../players.css";
import { OhHeader } from "@/components/players/OhHeader";

export default function Loading() {
  return (
    <div className="oh-page">
      <OhHeader />
      <main style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2rem" }}>
        
        <div style={{ position: "relative", width: "120px", height: "120px" }}>
          {/* Outer rotating ring */}
          <div style={{
            position: "absolute", inset: 0,
            border: "4px solid rgba(255, 122, 47, 0.2)",
            borderTopColor: "var(--orange)",
            borderRadius: "50%",
            animation: "boltspin 1.5s linear infinite"
          }} />
          {/* Inner pulsing core */}
          <div style={{
            position: "absolute", inset: "20px",
            background: "rgba(255, 122, 47, 0.1)",
            borderRadius: "50%",
            animation: "pulse 1.4s ease-in-out infinite"
          }} />
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-mono)", color: "var(--orange)", fontSize: "12px",
            letterSpacing: "0.1em"
          }}>
            L O A D
          </div>
        </div>

        <div style={{
          fontFamily: "var(--font-display)",
          color: "var(--text)",
          fontSize: "24px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          textShadow: "0 0 10px rgba(143,216,248,0.5)"
        }}>
          Fabricating Human Profile...
        </div>
        
      </main>
    </div>
  );
}
