"use client";

import React from "react";

const DogSvg = () => (
  <svg width="75" height="55" viewBox="0 0 150 110">
    <g className="leg"><rect x="48" y="72" width="9" height="34" rx="4" fill="#0e1c2c" stroke="#2a4a68" strokeWidth="2" /></g>
    <g className="leg b"><rect x="64" y="72" width="9" height="34" rx="4" fill="#0e1c2c" stroke="#2a4a68" strokeWidth="2" /></g>
    <g className="leg b"><rect x="96" y="72" width="9" height="34" rx="4" fill="#0e1c2c" stroke="#2a4a68" strokeWidth="2" /></g>
    <g className="leg"><rect x="112" y="72" width="9" height="34" rx="4" fill="#0e1c2c" stroke="#2a4a68" strokeWidth="2" /></g>
    <g className="tail"><path d="M128 60 Q146 50 144 34" fill="none" stroke="#2a4a68" strokeWidth="6" strokeLinecap="round" /></g>
    <ellipse cx="86" cy="62" rx="46" ry="22" fill="#0e1c2c" stroke="#2a4a68" strokeWidth="2.5" />
    <circle cx="34" cy="46" r="18" fill="#0e1c2c" stroke="#2a4a68" strokeWidth="2.5" />
    <path d="M22 34 L16 16 L32 28 Z" fill="#0e1c2c" stroke="#2a4a68" strokeWidth="2" />
    <path d="M44 32 L52 16 L34 26 Z" fill="#0e1c2c" stroke="#2a4a68" strokeWidth="2" />
    <ellipse cx="20" cy="50" rx="9" ry="6" fill="#0e1c2c" stroke="#2a4a68" strokeWidth="2" />
    <circle cx="13" cy="49" r="3" fill="#8fd8f8" />
    <circle cx="30" cy="44" r="3" fill="#8fd8f8" />
    <path d="M18 56 q5 4 11 1" stroke="#8fd8f8" fill="none" strokeWidth="2" />
  </svg>
);

const HumanSvg = () => (
  <svg width="55" height="75" viewBox="0 0 110 150">
    <g className="arm"><line x1="38" y1="56" x2="24" y2="92" stroke="#3f7ca8" strokeWidth="8" strokeLinecap="round" /></g>
    <g className="arm b"><line x1="72" y1="56" x2="86" y2="92" stroke="#3f7ca8" strokeWidth="8" strokeLinecap="round" /></g>
    <g className="legH"><line x1="46" y1="100" x2="38" y2="146" stroke="#3f7ca8" strokeWidth="9" strokeLinecap="round" /></g>
    <g className="legH b"><line x1="64" y1="100" x2="72" y2="146" stroke="#3f7ca8" strokeWidth="9" strokeLinecap="round" /></g>
    <circle cx="55" cy="22" r="15" fill="#eaf6ff" stroke="#2e8fc7" strokeWidth="2.5" />
    <path d="M40 40 H70 L76 102 H34 Z" fill="#eaf6ff" stroke="#2e8fc7" strokeWidth="2.5" />
    <path d="M47 52 L55 62 L66 46" fill="none" stroke="#2e8fc7" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export default function ConveyorBelt() {
  return (
    <div style={{ position: "relative", width: "100%", height: "150px", overflow: "hidden", marginTop: "50px", borderTop: "2px solid rgba(46,143,199,0.2)", borderBottom: "2px solid rgba(46,143,199,0.2)", background: "rgba(5, 10, 15, 0.8)" }}>
      <style>{`
        .belt-bg {
          position: absolute;
          bottom: 20px;
          left: -100px;
          width: 200%;
          height: 20px;
          background: repeating-linear-gradient(
            90deg,
            #111,
            #111 20px,
            #222 20px,
            #222 40px
          );
          animation: belt-scroll 1.5s linear infinite;
          border-top: 2px solid #333;
          border-bottom: 2px solid #333;
          z-index: 1;
        }

        @keyframes belt-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(40px); }
        }

        .machine {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 220px;
          height: 120px;
          background: linear-gradient(180deg, #162436, #0e1622);
          border: 3px solid #3f7ca8;
          border-bottom: none;
          box-shadow: 0 0 30px rgba(46,143,199,0.4), inset 0 0 20px rgba(0,0,0,0.8);
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: 15px;
        }

        .machine::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; height: 15px;
          background: repeating-linear-gradient(90deg, #3f7ca8, #3f7ca8 10px, transparent 10px, transparent 20px);
          opacity: 0.3;
        }

        .machine-door {
          position: absolute;
          bottom: 0;
          width: 60px;
          height: 70px;
          background: #050a0f;
          border: 2px solid #3f7ca8;
          border-bottom: none;
          box-shadow: inset 0 0 20px #000;
        }
        .machine-door.left { left: 15px; border-top-right-radius: 20px; border-top-left-radius: 5px; border-left: none; }
        .machine-door.right { right: 15px; border-top-left-radius: 20px; border-top-right-radius: 5px; border-right: none; }

        .machine-text {
          font-family: var(--font-display);
          color: #8fd8f8;
          font-size: 20px;
          text-align: center;
          text-shadow: 0 0 10px #8fd8f8;
          letter-spacing: 0.15em;
          animation: machine-pulse 2s infinite alternate;
          z-index: 2;
          background: #050a0f;
          padding: 5px 15px;
          border: 1px solid #3f7ca8;
          border-radius: 4px;
          margin-top: 5px;
        }

        @keyframes machine-pulse {
          0% { opacity: 0.8; box-shadow: 0 0 5px rgba(143,216,248,0.2); }
          100% { opacity: 1; box-shadow: 0 0 15px rgba(143,216,248,0.6); }
        }

        .subject {
          position: absolute;
          bottom: 30px;
          z-index: 5;
        }

        .animal {
          left: -100px;
          animation: ride-in 5s linear infinite;
        }

        .human {
          left: 50%;
          animation: ride-out 5s linear infinite;
        }

        @keyframes ride-in {
          0% { left: -100px; opacity: 1; }
          90% { left: calc(50% - 90px); opacity: 1; }
          95% { left: calc(50% - 70px); opacity: 0; }
          100% { left: calc(50% - 70px); opacity: 0; }
        }

        @keyframes ride-out {
          0% { left: calc(50% + 40px); opacity: 0; }
          5% { left: calc(50% + 60px); opacity: 1; }
          100% { left: calc(100% + 100px); opacity: 1; }
        }
      `}</style>

      <div className="belt-bg" />

      {[0, 1, 2, 3, 4].map((i) => (
        <div 
          key={`animal-${i}`} 
          className="subject animal" 
          style={{ animationDelay: `${i * 1}s` }}
        >
          <DogSvg />
        </div>
      ))}

      <div className="machine">
        <div className="machine-door left" />
        <div className="machine-text">HUMANISER</div>
        <div className="machine-door right" />
      </div>

      {[0, 1, 2, 3, 4].map((i) => (
        <div 
          key={`human-${i}`} 
          className="subject human" 
          style={{ animationDelay: `${i * 1}s` }}
        >
          <HumanSvg />
        </div>
      ))}
    </div>
  );
}
