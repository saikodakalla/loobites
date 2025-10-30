interface AvatarProps {
  size?: number;
}

export function Avatar({ size = 30 }: AvatarProps) {
  const d = size;
  return (
    <svg
      width={d}
      height={d}
      viewBox="0 0 32 32"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#FCA5A5" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill="url(#grad)" />
      <circle cx="16" cy="13" r="6" fill="#fff" opacity="0.85" />
      <rect x="7" y="20" width="18" height="8" rx="4" fill="#fff" opacity="0.85" />
    </svg>
  );
}
