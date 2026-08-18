let current: HTMLAudioElement | null = null;

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
}
