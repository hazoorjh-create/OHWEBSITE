"use client";

import React from "react";

const ANIMALS = ["🐴", "🐶", "🐱", "🐒", "🐷", "🦧", "🐺"];
const HUMANS = ["👨", "👩", "🧑", "👱‍♂️", "👨‍🦲", "🕵️‍♂️", "👷‍♀️"];

export default function ConveyorBelt() {
  return (
    <div style={{ position: "relative", width: "100%", height: "150px", overflow: "hidden", marginTop: "50px", borderTop: "2px solid rgba(46,143,199,0.2)", borderBottom: "2px solid rgba(46,143,199,0.2)", background: "rgba(5, 10, 15, 0.8)" }}>
      <style>{`
        .belt-bg {
          position: absolute;
          bottom: 20px;
          left: 0;
          width: 200%;
          height: 20px;
          background: repeating-linear-gradient(
            90deg,
            #111,
            #111 20px,
            #222 20px,
            #222 40px
          );
          animation: belt-scroll 2s linear infinite;
          border-top: 2px solid #333;
          border-bottom: 2px solid #333;
          z-index: 1;
        }

        @keyframes belt-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-40px); }
        }

        .machine {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 180px;
          height: 100px;
          background: linear-gradient(180deg, #1a2a3a, #0a1626);
          border: 2px solid #2e8fc7;
          border-bottom: none;
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
          box-shadow: 0 0 20px rgba(46,143,199,0.3), inset 0 0 15px rgba(0,0,0,0.8);
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .machine-door {
          position: absolute;
          bottom: 0;
          width: 40px;
          height: 60px;
          background: #050a0f;
          border-top-left-radius: 50%;
          border-top-right-radius: 50%;
          border: 1px solid rgba(46,143,199,0.5);
          border-bottom: none;
        }
        .machine-door.left { left: 10px; }
        .machine-door.right { right: 10px; }

        .machine-text {
          font-family: var(--font-display);
          color: #2e8fc7;
          font-size: 14px;
          text-align: center;
          text-shadow: 0 0 5px #2e8fc7;
          margin-bottom: 30px;
          letter-spacing: 0.1em;
          animation: machine-pulse 2s infinite alternate;
        }

        @keyframes machine-pulse {
          0% { opacity: 0.8; text-shadow: 0 0 5px #2e8fc7; }
          100% { opacity: 1; text-shadow: 0 0 15px #2e8fc7, 0 0 20px #2e8fc7; }
        }

        .subject {
          position: absolute;
          bottom: 40px;
          font-size: 32px;
          z-index: 5;
        }

        .animal {
          left: -50px;
          animation: ride-in 5s linear infinite;
        }

        .human {
          left: 50%;
          animation: ride-out 5s linear infinite;
        }

        @keyframes ride-in {
          0% { left: -50px; opacity: 1; }
          90% { left: calc(50% - 70px); opacity: 1; }
          95% { left: calc(50% - 60px); opacity: 0; }
          100% { left: calc(50% - 60px); opacity: 0; }
        }

        @keyframes ride-out {
          0% { left: calc(50% + 40px); opacity: 0; }
          5% { left: calc(50% + 50px); opacity: 1; }
          100% { left: calc(100% + 50px); opacity: 1; }
        }
      `}</style>

      {/* The moving belt background */}
      <div className="belt-bg" />

      {/* The Subjects entering (Animals) */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div 
          key={`animal-${i}`} 
          className="subject animal" 
          style={{ 
            animationDelay: `${i * 1}s`,
            animationDuration: "5s"
          }}
        >
          {ANIMALS[i % ANIMALS.length]}
        </div>
      ))}

      {/* The Machine */}
      <div className="machine">
        <div className="machine-door left" />
        <div className="machine-text">
          HUMANITY<br/>RECLAMATION
        </div>
        <div className="machine-door right" />
      </div>

      {/* The Verified leaving (Humans) */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div 
          key={`human-${i}`} 
          className="subject human" 
          style={{ 
            animationDelay: `${i * 1}s`,
            animationDuration: "5s" 
          }}
        >
          {HUMANS[i % HUMANS.length]}
        </div>
      ))}
    </div>
  );
}
