/** ONLYHUMANS chrome logo (eye + shield). idPrefix keeps gradient ids unique. */
export function LogoSvg({ idPrefix = "l" }: { idPrefix?: string }) {
  const chrome = `${idPrefix}chrome`;
  const dota = `${idPrefix}dota`;
  const shield = `${idPrefix}shield`;
  return (
    <svg
      viewBox="0 0 300 190"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="ONLYHUMANS logo"
    >
      <defs>
        <linearGradient id={chrome} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".45" stopColor="#cfeeff" />
          <stop offset=".75" stopColor="#5fb6e6" />
          <stop offset="1" stopColor="#2e8fc7" />
        </linearGradient>
        <linearGradient id={dota} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff8a3d" />
          <stop offset="1" stopColor="#c43a12" />
        </linearGradient>
        <linearGradient id={shield} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9adcfb" />
          <stop offset="1" stopColor="#2e7cb8" />
        </linearGradient>
      </defs>
      <g transform="translate(18,18) rotate(-8 70 75)">
        <ellipse cx="70" cy="78" rx="64" ry="72" fill="#0d2033" />
        <ellipse cx="70" cy="78" rx="56" ry="64" fill={`url(#${chrome})`} stroke="#0d2033" strokeWidth="5" />
        <ellipse cx="70" cy="78" rx="32" ry="40" fill="#04070d" stroke="#0d2033" strokeWidth="5" />
        <g transform="translate(46,30) rotate(6)">
          <rect width="48" height="48" rx="7" fill={`url(#${dota})`} stroke="#5a1505" strokeWidth="4" />
          <path d="M8 8 L40 40 M40 8 L8 40 M8 8 L26 12 M40 40 L22 36" stroke="#3d0e02" strokeWidth="6" strokeLinecap="round" fill="none" />
        </g>
      </g>
      <g transform="translate(150,28) rotate(5)">
        <path
          d="M10 18 C26 10 34 12 36 22 L30 70 C44 64 58 62 72 64 L80 20 C84 8 100 8 102 20 L84 128 C80 140 62 140 62 128 L68 90 C56 88 44 90 26 96 L20 128 C16 140 -2 138 0 126 Z"
          fill={`url(#${chrome})`}
          stroke="#0d2033"
          strokeWidth="6"
          strokeLinejoin="round"
        />
      </g>
      <g transform="translate(228,18)">
        <path d="M28 0 L56 10 L54 38 C53 56 42 66 28 72 C14 66 3 56 2 38 L0 10 Z" fill={`url(#${shield})`} stroke="#0d2033" strokeWidth="5" />
        <path d="M28 8 L48 15 L46.5 37 C45.5 51 37 59 28 64 Z" fill="#fff" opacity=".18" />
        <path d="M14 34 L24 46 L43 22" fill="none" stroke="#06121f" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
