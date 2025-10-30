import type { SVGProps } from "react";

export interface IconProps {
  size?: number;
  color?: string;
}

export function LogoMark({ size = 28, color = "#000" }: IconProps) {
  const height = size;
  const width = size * 1.1;
  const radius = 6;
  const gap = 4;
  const barH = (height - gap * 2) / 3;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="0"
        y="0"
        rx={radius}
        ry={radius}
        width={width}
        height={barH}
        fill={color}
      />
      <rect
        x="0"
        y={barH + gap}
        rx={radius}
        ry={radius}
        width={width}
        height={barH}
        fill={color}
      />
      <rect
        x="0"
        y={(barH + gap) * 2}
        rx={radius}
        ry={radius}
        width={width}
        height={barH}
        fill={color}
      />
    </svg>
  );
}

export function GoogleIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.7h5.2c-.2 1.2-1.6 3.5-5.2 3.5-3.1 0-5.6-2.6-5.6-5.7s2.5-5.7 5.6-5.7c1.8 0 3 .7 3.7 1.3l2.5-2.4C16.8 3 14.6 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c6.9 0 9.2-4.8 8.6-9.6H12z"
      />
      <path
        fill="#4285F4"
        d="M21.6 12.1H12v3.8h5.5c-.5 1.6-2.1 3.5-5.5 3.5-3.3 0-6-2.7-6-6s2.7-6 6-6c1.8 0 3 .7 3.7 1.3l2.6-2.5C16.9 3 14.6 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10 9.6-4.2 9.6-9.9c0-.6 0-1-.1-1z"
        opacity="0"
      />
    </svg>
  );
}

export function OutlookIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2" fill="#0A66C2" />
      <path d="M3 8l9 6 9-6" fill="none" stroke="#fff" strokeWidth="2" />
    </svg>
  );
}

export function SunIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
        <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
        <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
        <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
      </g>
    </svg>
  );
}

export function SearchIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="11"
        cy="11"
        r="7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="16.65"
        y1="16.65"
        x2="21"
        y2="21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MoonIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79z"
        fill="currentColor"
      />
    </svg>
  );
}

export function BellIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M18 8a6 6 0 10-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M13.73 21a2 2 0 01-3.46 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

export function ClockIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 7v5l3 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export type SVGIconProps = SVGProps<SVGSVGElement>;
