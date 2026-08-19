/**
 * Exclusive audio + now-playing store.
 * Only one <audio> plays at a time (claimAudio / releaseAudio) and the
 * MiniPlayer subscribes to whatever is current.
 */
import type { Single } from "./catalog";

let current: HTMLAudioElement | null = null;

export type NowPlaying = {
  track: Single | null;
  playing: boolean;
  time: number;
  cap: number;
  el: HTMLAudioElement | null;
};

const state: NowPlaying = { track: null, playing: false, time: 0, cap: 30, el: null };
const subs = new Set<(s: NowPlaying) => void>();

function emit() {
  for (const fn of subs) fn({ ...state });
}

export function subscribe(fn: (s: NowPlaying) => void) {
  subs.add(fn);
  fn({ ...state });
  return () => {
    subs.delete(fn);
  };
}

export function claimAudio(el: HTMLAudioElement) {
  if (current && current !== el) {
    current.pause();
    try {
      current.currentTime = 0;
    } catch {
      /* ignore */
    }
    current.dispatchEvent(new Event("dg-yield"));
  }
  current = el;
}

export function releaseAudio(el: HTMLAudioElement) {
  if (current === el) current = null;
  if (state.el === el) {
    state.el = null;
    state.playing = false;
    emit();
  }
}

export function publish(partial: Partial<NowPlaying>) {
  Object.assign(state, partial);
  emit();
}

/** Toggle from anywhere (MiniPlayer). Dispatches to the owning Player via a custom event. */
export function toggleCurrent() {
  if (!state.el) return;
  state.el.dispatchEvent(new Event("dg-toggle"));
}
