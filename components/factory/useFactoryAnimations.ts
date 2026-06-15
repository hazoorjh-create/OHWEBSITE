import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { RefObject } from "react";

/**
 * Ports the entire onlyhumans-factory.html GSAP choreography.
 * Runs client-only inside useGSAP (scoped to the page root, auto-cleanup).
 */
export function useFactoryAnimations(root: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      const $ = (id: string) => document.getElementById(id);
      const hud = (n: string, name: string) => {
        const a = $("hudNum");
        const b = $("hudName");
        if (a) a.textContent = n;
        if (b) b.textContent = name;
      };

      /* ---- top production progress bar ---- */
      const fill = document.querySelector<HTMLElement>("#prog .fill");
      let progTick = false;
      const onScroll = () => {
        if (progTick) return;
        progTick = true;
        requestAnimationFrame(() => {
          const m = document.documentElement.scrollHeight - innerHeight;
          if (fill) fill.style.width = (scrollY / m) * 100 + "%";
          progTick = false;
        });
      };
      addEventListener("scroll", onScroll, { passive: true });

      /* ---- stage HUD ---- */
      (
        [
          ["#games", "03", "EVALUATION"],
          ["#tournaments", "04", "SELECTION"],
          ["#lift", "05", "RANKING"],
          ["#hall", "06", "ARCHIVE"],
          ["#verify", "07", "VERIFICATION"],
        ] as [string, string, string][]
      ).forEach(([sel, n, name]) => {
        ScrollTrigger.create({
          trigger: sel,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (s) => {
            if (s.isActive) hud(n, name);
          },
        });
      });

      /* ---- reduced motion: static fallback ---- */
      const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (REDUCE) {
        document.documentElement.classList.add("noanim");
        document.querySelectorAll<HTMLElement>("#liftRows .mmr").forEach((el) => {
          el.textContent = Number(el.dataset.mmr).toLocaleString();
        });
        const verdict = $("verdict");
        if (verdict) verdict.textContent = "RESULT: HUMAN";
        const asm = $("asmPct");
        if (asm) asm.textContent = "100%";
      }

      if (!REDUCE) {
        /* ---- HERO — zoom into the factory door ---- */
        gsap
          .timeline({
            scrollTrigger: { trigger: "#hero", start: "top top", end: "+=120%", scrub: 1, pin: true, anticipatePin: 1 },
          })
          .to("#heroTop", { y: -90, opacity: 0, duration: 0.45, ease: "none" }, 0)
          .to("#hero .cue", { opacity: 0, duration: 0.1 }, 0)
          .to("#facWrap", { scale: 3.1, y: "12%", transformOrigin: "50% 96%", duration: 1, ease: "power1.in" }, 0)
          .to("#hero .grid", { opacity: 0, duration: 0.6 }, 0.3)
          .to("#doorGlow", { opacity: 1, scale: 3.4, duration: 0.6, ease: "power1.in" }, 0.45);

        /* ---- THE JOURNEY — pinned horizontal world ---- */
        const world = $("world")!;
        const beltStrip = $("beltStrip")!;
        const asmPct = $("asmPct")!;
        const readout = $("readout")!;
        const panDist = () => -(world.scrollWidth - innerWidth);

        const J = gsap.timeline({
          scrollTrigger: {
            trigger: "#journey",
            start: "top top",
            end: () => (innerWidth < 760 ? "+=4200" : "+=6500"),
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate(self) {
              const wx = gsap.getProperty(world, "x") as number;
              beltStrip.style.backgroundPosition = wx * 1.15 + "px 0px, 0px 0px";
              const p = self.progress;
              const a = gsap.utils.clamp(0, 1, (p - 0.3) / 0.28);
              asmPct.textContent = Math.round(a * 100) + "%";
              if (p < 0.27) hud("01", "INSTINCT");
              else if (p < 0.6) hud("02", "DISCIPLINE");
              else hud("02", "OUTPUT — QC");
            },
          },
        });

        J.to(world, { x: panDist, ease: "none", duration: 1 }, 0);
        J.to("#wallFar", { x: () => panDist() * 0.35, ease: "none", duration: 1 }, 0);

        J.fromTo("#cap1", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.03 }, 0.015)
          .to("#cap1", { opacity: 0, y: -30, duration: 0.03 }, 0.15)
          .fromTo("#cap2", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.03 }, 0.32)
          .to("#cap2", { opacity: 0, y: -30, duration: 0.03 }, 0.5)
          .fromTo("#cap3", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.03 }, 0.63)
          .to("#cap3", { opacity: 0, y: -30, duration: 0.03 }, 0.88);

        J.to("#interior", { opacity: 1, duration: 0.04 }, 0.27).to("#interior", { opacity: 0, duration: 0.05 }, 0.585);

        document.querySelectorAll("#interior .piston").forEach((p, i) => {
          J.to(p, { y: 46, duration: 0.018, repeat: 13, yoyo: true, ease: "none" }, 0.31 + i * 0.005);
        });

        J.fromTo("#scanline", { opacity: 0, top: "28%" }, { opacity: 1, top: "78%", duration: 0.04, ease: "none" }, 0.31)
          .to("#scanline", { top: "28%", duration: 0.04, ease: "none" }, 0.35)
          .to("#scanline", { opacity: 0, duration: 0.01 }, 0.39);

        const says: [number, string][] = [
          [0.295, "BOOT SEQUENCE...<br>SUBJECT: CANIS-0451"],
          [0.345, "APPLYING VOLTAGE ⚡<br>MOTIVATION: INJECTED"],
          [0.415, "HUMILIATION PROTOCOL<br>REPLAYING YOUR WORST GAME"],
          [0.47, "EDUCATION MODULE<br>LECTURE 101 IN PROGRESS"],
          [0.53, "REBUILDING FRAME...<br>REMOVING: EXCUSES (4,512 FOUND)"],
          [0.575, "ASSEMBLY COMPLETE<br>RELEASING SUBJECT..."],
        ];
        says.forEach(([t, html]) => J.call(() => (readout.innerHTML = html), undefined, t));

        /* SHOCK */
        J.fromTo("#shockFx", { opacity: 0 }, { opacity: 1, duration: 0.006, repeat: 9, yoyo: true, ease: "none" }, 0.35).to(
          "#shockFx",
          { opacity: 0, duration: 0.008 },
          0.41,
        );
        J.to("#charLayer", { x: 7, duration: 0.005, repeat: 11, yoyo: true, ease: "none" }, 0.352).to(
          "#charLayer",
          { x: 0, duration: 0.006 },
          0.412,
        );

        /* HUMILIATION */
        J.to("#shameSign", { y: 300, duration: 0.025, ease: "power2.out" }, 0.42).to("#shameSign", { y: -360, duration: 0.025, ease: "power2.in" }, 0.462);
        J.to("#fDog", { scaleY: 0.9, rotation: 4, transformOrigin: "50% 100%", duration: 0.02 }, 0.425).to(
          "#fDog",
          { scaleY: 1, rotation: 0, duration: 0.02 },
          0.465,
        );
        document.querySelectorAll(".haha").forEach((h, i) => {
          J.fromTo(h, { opacity: 0, y: 18 }, { opacity: 1, y: -22, duration: 0.02 }, 0.428 + i * 0.008).to(h, { opacity: 0, y: -44, duration: 0.015 }, 0.452 + i * 0.008);
        });

        /* LECTURE + dog -> wireframe */
        J.fromTo("#board", { opacity: 0, x: 120 }, { opacity: 1, x: 0, duration: 0.02, ease: "power2.out" }, 0.47).to(
          "#board",
          { opacity: 0, x: 120, duration: 0.02, ease: "power2.in" },
          0.53,
        );
        J.to("#fDog", { opacity: 0, duration: 0.035, ease: "none" }, 0.49);
        J.fromTo("#fWire", { opacity: 0 }, { opacity: 1, duration: 0.035, ease: "none" }, 0.49);

        /* REBUILD — sparks, wireframe -> human */
        const burst = (t: number) => {
          document.querySelectorAll(".spark").forEach((s, i) => {
            const dx = (i % 2 ? 1 : -1) * (40 + i * 26);
            const dy = -(60 + ((i * 37) % 120));
            J.fromTo(s, { opacity: 0, x: 0, y: 0, scale: 1 }, { opacity: 0.85, x: dx, y: dy, scale: 0.4, duration: 0.02, ease: "power1.out" }, t).to(
              s,
              { opacity: 0, duration: 0.012 },
              t + 0.02,
            );
          });
        };
        burst(0.535);
        J.to("#fWire", { opacity: 0, duration: 0.035, ease: "none" }, 0.55);
        J.fromTo("#fHuman", { opacity: 0 }, { opacity: 1, duration: 0.035, ease: "none" }, 0.55);

        /* QC stamp */
        J.fromTo("#qcStamp", { opacity: 0, scale: 2.6, rotate: -5 }, { opacity: 1, scale: 1, rotate: -5, duration: 0.025, ease: "power2.in" }, 0.65).to(
          "#qcStamp",
          { opacity: 0, y: -40, duration: 0.03 },
          0.76,
        );

        /* subtle char bob */
        J.to("#charLayer", { y: -6, duration: 0.05, repeat: 9, yoyo: true, ease: "sine.inOut" }, 0);

        /* ---- LIFT — vertical leaderboard ascent ---- */
        const liftRows = $("liftRows")!;
        const liftEndY = () => {
          const H = liftRows.scrollHeight;
          const vh = innerHeight;
          const finalTop = Math.max(vh * 0.3, (vh - H) * 0.72);
          return finalTop - vh;
        };
        gsap
          .timeline({
            scrollTrigger: {
              trigger: "#liftStage",
              start: "top top",
              end: () => (innerWidth < 760 ? "+=2300" : "+=3200"),
              scrub: 1,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate(self) {
                const cable = $("liftCable");
                if (cable) cable.style.backgroundPosition = "0px " + self.progress * 900 + "px";
                document.querySelectorAll<HTMLElement>("#liftRows .mmr").forEach((el) => {
                  el.textContent = Math.round(Number(el.dataset.mmr) * Math.min(1, self.progress * 1.25)).toLocaleString();
                });
              },
            },
          })
          .to(liftRows, { y: liftEndY, ease: "none", duration: 1 }, 0);

        /* ---- VERIFICATION — scrubbed finale ---- */
        const verdict = $("verdict")!;
        const vSays: [number, string][] = [
          [0.13, "SHIELD DESCENDING..."],
          [0.2, "SCANNING SUBJECT... ▓▓▓░░░░░"],
          [0.34, "SCANNING SUBJECT... ▓▓▓▓▓▓░░"],
          [0.46, "INSTINCT: OVERRIDDEN ✓ — DISCIPLINE: CONFIRMED ✓"],
          [0.53, "NO SHORTCUTS DETECTED ✓"],
          [0.6, "RESULT: HUMAN"],
          [0.88, "GATE OPEN — WELCOME TO THE OTHER SIDE"],
        ];
        const V = gsap.timeline({
          scrollTrigger: {
            trigger: "#verify",
            start: "top top",
            end: () => (innerWidth < 760 ? "+=2300" : "+=3000"),
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        V.to("#vShield", { y: 165, duration: 0.13, ease: "power1.in" }, 0)
          .fromTo("#vBeam", { opacity: 0 }, { opacity: 1, duration: 0.02 }, 0.15)
          .to("#vBeam", { y: 160, duration: 0.16, ease: "none" }, 0.17)
          .to("#vBeam", { y: 0, duration: 0.16, ease: "none" }, 0.35)
          .to("#vBeam", { opacity: 0, duration: 0.03 }, 0.52)
          .to("#gate .door.l", { x: "-101%", duration: 0.12, ease: "power2.inOut" }, 0.6)
          .to("#gate .door.r", { x: "101%", duration: 0.12, ease: "power2.inOut" }, 0.6)
          .to("#gate .glow", { opacity: 1, duration: 0.1 }, 0.62)
          .to("#vHuman", { opacity: 1, y: 0, duration: 0.1, ease: "power1.out" }, 0.68)
          .fromTo("#vStamp", { opacity: 0, scale: 2.4, rotate: -4 }, { opacity: 1, scale: 1, rotate: -4, duration: 0.06, ease: "power2.in" }, 0.8)
          .to("#vLogo", { opacity: 1, y: 0, duration: 0.08, ease: "power1.out" }, 0.74)
          .to(".final-ctas", { opacity: 1, y: 0, duration: 0.08 }, 0.88);
        vSays.forEach(([t, txt]) => V.call(() => (verdict.textContent = txt), undefined, t));

        /* ---- gears rotate with scroll ---- */
        document.querySelectorAll(".gear").forEach((g, i) => {
          gsap.to(g, {
            rotate: i % 2 ? -300 : 300,
            ease: "none",
            scrollTrigger: { trigger: "#tournaments", start: "top bottom", end: "bottom top", scrub: 1 },
          });
        });
      }

      /* ---- reveal-on-scroll for content sections ---- */
      const io = new IntersectionObserver(
        (es) =>
          es.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("on");
              io.unobserve(e.target);
            }
          }),
        { threshold: 0.18 },
      );
      document.querySelectorAll(".rv").forEach((el) => io.observe(el));

      /* keep measurements honest after fonts/images settle */
      const onLoad = () => ScrollTrigger.refresh();
      addEventListener("load", onLoad);

      return () => {
        removeEventListener("scroll", onScroll);
        removeEventListener("load", onLoad);
        io.disconnect();
      };
    },
    { scope: root },
  );
}
