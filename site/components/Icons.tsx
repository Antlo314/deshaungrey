import type { SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round" };

export const Arrow = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);
export const ArrowUpRight = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);
export const Close = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

/** Discipline icons — thin-line, one weight, on the same 24 grid. */
export const DiscIcon = ({ name, ...p }: { name: string } & SVGProps<SVGSVGElement>) => {
  switch (name) {
    case "seed":
      return (
        <svg {...base} {...p}>
          <path d="M12 21V11M12 11c0-4 3-7 8-7-0 4-3 7-8 7ZM12 14c0-3-2.5-5-6-5 0 3 2.5 5 6 5Z" />
        </svg>
      );
    case "compass":
      return (
        <svg {...base} {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="m15.5 8.5-2 5-5 2 2-5z" />
        </svg>
      );
    case "orbit":
      return (
        <svg {...base} {...p}>
          <circle cx="12" cy="12" r="3" />
          <path d="M3 12c0-2 4-4 9-4s9 2 9 4-4 4-9 4-9-2-9-4Z" transform="rotate(-30 12 12)" />
          <circle cx="19" cy="7" r="1" fill="currentColor" />
        </svg>
      );
    case "prism":
      return (
        <svg {...base} {...p}>
          <path d="M12 3 3 19h18L12 3Z" />
          <path d="M12 3v16M12 11l9 8" opacity=".5" />
        </svg>
      );
    case "signal":
      return (
        <svg {...base} {...p}>
          <circle cx="12" cy="13" r="1.4" fill="currentColor" />
          <path d="M8.5 16.5a5 5 0 0 1 0-7M15.5 9.5a5 5 0 0 1 0 7M5.5 19.5a9 9 0 0 1 0-13M18.5 6.5a9 9 0 0 1 0 13" />
        </svg>
      );
    case "console":
      return (
        <svg {...base} {...p}>
          <path d="M4 5h16v14H4z" />
          <path d="M8 9v6M12 8v8M16 10v4" />
          <circle cx="8" cy="12" r="1.2" fill="currentColor" />
          <circle cx="12" cy="10" r="1.2" fill="currentColor" />
          <circle cx="16" cy="13" r="1.2" fill="currentColor" />
        </svg>
      );
    case "screen":
      return (
        <svg {...base} {...p}>
          <rect x="3" y="5" width="18" height="12" rx="1" />
          <path d="M8 21h8M12 17v4M10 9l5 2-5 2z" />
        </svg>
      );
    case "handshake":
      return (
        <svg {...base} {...p}>
          <path d="M3 10h4l3-3 4 1 4-1 3 3M7 10l4 4 2-1M11 14l3 3 2-2 3-3" />
        </svg>
      );
    default:
      return (
        <svg {...base} {...p}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
};

/**
 * Icon map used by the ASH widget (she came over from the artist site, where
 * icons were addressed as `Icon.name`). Kept as a map so her markup ports 1:1.
 */
export const Icon = {
  speaker: (p: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 9v6h3l5 4V5L7 9H4Z" />
      <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" />
    </svg>
  ),
  speakerOff: (p: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 9v6h3l5 4V5L7 9H4Z" />
      <path d="M16 9.5l5 5M21 9.5l-5 5" />
    </svg>
  ),
  close: (p: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
  mic: (p: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  ),
  arrow: (p: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
};
