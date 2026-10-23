import type { ReactNode } from "react";

const paths: Record<string, ReactNode> = {
  eye: (
    <>
      <path d="M2.2 12s3.4-6.2 9.8-6.2S21.8 12 21.8 12s-3.4 6.2-9.8 6.2S2.2 12 2.2 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  "eye-off": (
    <>
      <path d="M3 3l18 18" />
      <path d="M10.6 6.1A9.9 9.9 0 0 1 12 6c6.4 0 9.8 6 9.8 6a17.5 17.5 0 0 1-2.4 3.1" />
      <path d="M6.5 7.7C3.8 9.4 2.2 12 2.2 12s3.4 6 9.8 6a9.8 9.8 0 0 0 4.2-.9" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </>
  ),
  "arrow-left": (
    <>
      <path d="M19 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </>
  ),
  "arrow-right": (
    <>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </>
  ),
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  "chevron-up": <path d="m18 15-6-6-6 6" />,
  "chevron-left": <path d="m15 18-6-6 6-6" />,
  "chevron-right": <path d="m9 18 6-6-6-6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  user: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.8 20c.7-3.5 3.3-5.6 7.2-5.6s6.5 2.1 7.2 5.6" />
    </>
  ),
  logout: (
    <>
      <path d="M9.5 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20h4" />
      <path d="M14 8l4 4-4 4M8 12h10" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  "more-vertical": (
    <>
      <circle cx="12" cy="5" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9" r="1.5" />
      <path d="m4 17 5-5 3.5 3.5L16 12l4 4" />
    </>
  ),
  check: <path d="m5 12 4.2 4.2L19 6.5" />,
  alert: (
    <>
      <path d="M12 3 2.8 20h18.4L12 3Z" />
      <path d="M12 9v5M12 17.2v.1" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.8v.1" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9 7V4h6v3M6.5 7l.8 13h9.4l.8-13" />
      <path d="M10 11v5M14 11v5" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path d="m14.5 5.5 3 3" />
    </>
  ),
  box: (
    <>
      <path d="M3.8 7.5 12 3l8.2 4.5v9L12 21l-8.2-4.5v-9Z" />
      <path d="m3.8 7.5 8.2 4.5 8.2-4.5M12 12v9" />
    </>
  ),
  ticket: (
    <>
      <path d="M3.5 8.5V6h17v2.5a3.5 3.5 0 0 0 0 7V18h-17v-2.5a3.5 3.5 0 0 0 0-7Z" />
      <path d="M12 7.5v9" strokeDasharray="2 2" />
    </>
  ),
  cash: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 9.5v5M18 9.5v5" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </>
  ),
  home: (
    <>
      <path d="m3.5 10.5 8.5-7 8.5 7" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M9.5 20v-6h5v6" />
    </>
  ),
  gift: (
    <>
      <path d="M4 10h16v10H4zM2.5 7h19v3h-19zM12 7v13" />
      <path d="M12 7c-1.4-3.3-5.5-3.4-5.5-.9 0 1 1 1.9 2.7 1.9H12Zm0 0c1.4-3.3 5.5-3.4 5.5-.9 0 1-1 1.9-2.7 1.9H12Z" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.3 20c.6-3.2 2.8-5 5.7-5s5.1 1.8 5.7 5" />
      <path d="M16 5.3a3.2 3.2 0 0 1 0 6.2M17.5 15.3c1.8.6 2.9 2.2 3.2 4.7" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  bag: (
    <>
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  warning: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6M12 16.5v.1" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4M7.5 8.5 12 4l4.5 4.5" />
      <path d="M4 16v3h16v-3" />
    </>
  ),
  "circle-plus": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  "arrow-up-right": (
    <>
      <path d="M7 17 17 7M9 7h8v8" />
    </>
  ),
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.7 2.7L16.5 9" />
    </>
  ),
  "alert-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5M12 16.5v.1" />
    </>
  ),
};

interface IconeProps {
  name: string;
  size?: number;
  className?: string;
  label?: string;
  strokeWidth?: number;
}

export default function Icone({
  name,
  size = 20,
  className = "",
  label,
  strokeWidth = 1.8,
}: IconeProps) {
  const content = paths[name];
  if (!content) return null;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {label ? <title>{label}</title> : null}
      {content}
    </svg>
  );
}
