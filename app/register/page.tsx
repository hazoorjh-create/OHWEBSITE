import type { Metadata } from "next";
import "../register.css";
import { OhHeader } from "@/components/players/OhHeader";
import { RegisterGate } from "@/components/players/RegisterGate";

export const metadata: Metadata = {
  title: "ONLYHUMANS — Tournament Registration",
};

export default function RegisterPage() {
  return (
    <div className="oh-register">
      <OhHeader />
      <main>
        <div className="kicker">— Selection Department</div>
        <h1>Tournament Registration</h1>
        <div className="sub">
          The bracket machinery is being assembled. Registration requires a verified human: Discord sign-in plus a linked Steam account.
        </div>

        <div className="gatecard">
          <svg className="shield" viewBox="0 0 56 76">
            <path d="M28 0 L56 10 L54 38 C53 56 42 66 28 72 C14 66 3 56 2 38 L0 10 Z" fill="#3f9bd4" stroke="#0d2033" strokeWidth="4" />
            <path d="M14 34 L24 46 L43 22" fill="none" stroke="#06121f" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="t">Registration opens soon</div>
          <div className="s">
            OH SEASON 2 · DETAILS BEING STAMPED ON THE FACTORY FLOOR
            <br />
            FORMAT / DATES / PRIZE POOL — TBA
          </div>

          <RegisterGate />

          <div className="btnrow">
            <span className="btn primary" id="regBtn">
              Register — Locked
            </span>
            <a className="btn ghost" href="/players">
              View the Ladder
            </a>
          </div>
        </div>

        <footer>ONLYHUMANS — NO SHORTCUTS — NO BOTS — NO EXCUSES</footer>
      </main>
    </div>
  );
}
