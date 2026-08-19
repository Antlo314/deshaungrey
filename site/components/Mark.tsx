import { PROFILE_PATH, PROFILE_VIEWBOX } from "./ProfilePath";

/**
 * The M.E.G profile — vector trace of the gold line-art from the official
 * lockup. Filled shape (evenodd), so it scales from a favicon to a hero.
 */
export function Profile({ className, color = "var(--gold-logo)", title }: { className?: string; color?: string; title?: string }) {
  return (
    <svg className={className} viewBox={PROFILE_VIEWBOX} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} fill={color} fillRule="evenodd">
      {title ? <title>{title}</title> : null}
      <path d={PROFILE_PATH} />
    </svg>
  );
}

/** Wordmark in live type: M.E.G with red dots and the red ENTERPRISES bar. */
export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="wm" aria-hidden>
      <b>
        M<i>.</i>E<i>.</i>G
      </b>
      {!compact ? <small>Enterprises</small> : null}
    </span>
  );
}

/** Nav / footer lockup: profile + wordmark. */
export function Lockup({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <Profile />
      <Wordmark compact={compact} />
      <span className="sr">MEG Enterprises</span>
    </>
  );
}
