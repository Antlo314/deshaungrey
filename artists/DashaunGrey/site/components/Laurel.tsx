import type { ReactNode, SVGProps } from "react";

/** One laurel branch, drawn to be mirrored. Stroke-only so it takes currentColor. */
function Branch(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 96" fill="none" stroke="currentColor" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" {...p}>
      {/* stem */}
      <path d="M34 92 C 18 78, 8 60, 10 6" />
      {/* leaves — pairs along the stem */}
      {[
        [11, 14, -1], [13, 22, 1], [11, 30, -1], [14, 38, 1], [12, 46, -1], [16, 54, 1],
        [14, 62, -1], [19, 70, 1], [19, 78, -1], [25, 85, 1],
      ].map(([x, y, s], i) => (
        <path
          key={i}
          d={
            s > 0
              ? `M${x} ${y} c 9 -3, 14 2, 12 9 c -6 2, -12 -1, -12 -9 z`
              : `M${x} ${y} c -9 -3, -14 2, -12 9 c 6 2, 12 -1, 12 -9 z`
          }
          fill="currentColor"
          fillOpacity={0.18}
        />
      ))}
    </svg>
  );
}

/** Text or content flanked by two gold laurel branches. */
export function Laurel({ children, size = 64, className = "" }: { children: ReactNode; size?: number; className?: string }) {
  const h = size;
  const w = Math.round(size * 0.42);
  return (
    <span className={`laurel ${className}`} style={{ ["--lh" as string]: `${h}px` }}>
      <Branch style={{ width: w, height: h }} aria-hidden />
      <span className="laurel-body">{children}</span>
      <Branch style={{ width: w, height: h, transform: "scaleX(-1)" }} aria-hidden />
    </span>
  );
}
