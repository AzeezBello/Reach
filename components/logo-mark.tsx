/** The REACH mark as inline SVG (same artwork as public/brand/logo-mark.svg). */
export function LogoMark({ className = "size-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="reach-mark-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22c55e" />
          <stop offset="1" stopColor="#15803d" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#reach-mark-bg)" />
      <path
        d="M15 40 L32 23 L49 40"
        fill="none"
        stroke="#fff"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 51 L32 41 L42 51"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.72"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="13" r="4.5" fill="#facc15" />
    </svg>
  );
}
