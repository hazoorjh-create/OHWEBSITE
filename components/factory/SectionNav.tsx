export function SectionNav({ authSlot }: { authSlot: React.ReactNode }) {
  return (
    <nav id="nav" aria-label="Section navigation">
      <a href="#hero">Home</a>
      <a href="#games">Live / History</a>
      <a href="#telemetry">Meta</a>
      <a href="#tournaments">Tournaments</a>
      <a href="#lift">Leaderboard</a>
      <a href="/players">Players</a>
      <a href="#hall">Hall</a>
      <a href="#verify">Verify</a>
      {authSlot}
    </nav>
  );
}
