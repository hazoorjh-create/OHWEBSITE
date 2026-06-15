import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ONLYHUMANS — The Human Factory",
  description:
    "ONLYHUMANS Dota 2 community — the human manufacturing facility. Live games, match history, tournaments and leaderboard.",
};

export const viewport: Viewport = {
  themeColor: "#04070d",
};

// Set the saved theme before first paint to avoid a flash.
const themeScript = `try{if(localStorage.getItem('oh-theme')==='light')document.documentElement.classList.add('light')}catch(e){}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=Russo+One&family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
