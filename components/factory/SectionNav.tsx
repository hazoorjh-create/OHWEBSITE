export function SectionNav({ authSlot }: { authSlot: React.ReactNode }) {
  return (
    <nav id="nav" aria-label="Section navigation">
      <a href="#hero">Home</a>
      <a href="#tournaments">Tournaments</a>
      <a href="#games">Live / History</a>
      <a href="#lift">TOP / META</a>
      <a href="/players">Players</a>
      <a href="#hall">Hall</a>
      {authSlot}
    </nav>
  );
}
