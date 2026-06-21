import "@/app/players.css";
import { OhHeader } from "@/components/players/OhHeader";

export default function Loading() {
  return (
    <div className="oh-page">
      <OhHeader />
      <style>{`
        @keyframes oh-spin-right {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes oh-spin-left {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        @keyframes oh-pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.95); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes oh-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      <main style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3rem" }}>
        
        <div style={{ position: "relative", width: "100px", height: "100px" }}>
          {/* Outer ring */}
          <div style={{
            position: "absolute", inset: 0,
            border: "3px solid rgba(255, 122, 47, 0.1)",
            borderTopColor: "var(--orange)",
            borderBottomColor: "var(--orange)",
            borderRadius: "50%",
            animation: "oh-spin-right 1.5s linear infinite"
          }} />
          {/* Inner ring */}
          <div style={{
            position: "absolute", inset: "15px",
            border: "3px solid rgba(143, 216, 248, 0.1)",
            borderLeftColor: "var(--ice)",
            borderRightColor: "var(--ice)",
            borderRadius: "50%",
            animation: "oh-spin-left 2s linear infinite"
          }} />
          {/* Core */}
          <div style={{
            position: "absolute", inset: "35px",
            background: "var(--orange)",
            boxShadow: "0 0 15px var(--orange)",
            borderRadius: "50%",
            animation: "oh-pulse 1.5s ease-in-out infinite"
          }} />
        </div>

        <div style={{
          fontFamily: "var(--font-display)",
          color: "var(--text)",
          fontSize: "22px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          textShadow: "0 0 10px rgba(143,216,248,0.3)",
          animation: "oh-blink 1.5s infinite"
        }}>
          Reconstructing Battle Logs...
        </div>
        
      </main>
    </div>
  );
}
