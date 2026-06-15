"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
  }, []);

  const toggle = () => {
    const next = !light;
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("oh-theme", next ? "light" : "dark");
    } catch {
      /* ignore */
    }
    setLight(next);
  };

  return (
    <div
      id="themeBtn"
      role="button"
      tabIndex={0}
      aria-label="Toggle dark / light mode"
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
    >
      {light ? "🌙 DARK MODE" : "☀ LIGHT MODE"}
    </div>
  );
}
