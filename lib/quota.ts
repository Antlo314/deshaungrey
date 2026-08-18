import { createHash } from "crypto";

export const VOICE_TURN_CAP = 12;
export const VOICE_TIMEOUT_MS = 15 * 60 * 1000;
export const VOICE_DAILY_SIGNED_URL_CAP = 400;
export const COOKIE_NAME = "dg_ash";

type Bucket = {
  turns: number;
  timeoutUntil: number;
  day: string;
};

type DayGate = { day: string; signed: number };

const sessions = new Map<string, Bucket>();
const dayGate: DayGate = { day: dayKey(), signed: 0 };

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function visitorKey(ip: string, ua: string) {
  return createHash("sha256").update(`${ip}|${ua}`).digest("hex").slice(0, 24);
}

function bucket(id: string): Bucket {
  const today = dayKey();
  const existing = sessions.get(id);
  if (!existing || existing.day !== today) {
    const fresh = { turns: 0, timeoutUntil: 0, day: today };
    sessions.set(id, fresh);
    return fresh;
  }
  return existing;
}

export function quotaStatus(id: string) {
  const b = bucket(id);
  const now = Date.now();
  if (b.timeoutUntil && now < b.timeoutUntil) {
    return {
      remaining: 0,
      cap: VOICE_TURN_CAP,
      timeoutMs: b.timeoutUntil - now,
      timedOut: true,
    };
  }
  if (b.timeoutUntil && now >= b.timeoutUntil) {
    b.turns = 0;
    b.timeoutUntil = 0;
  }
  return {
    remaining: Math.max(0, VOICE_TURN_CAP - b.turns),
    cap: VOICE_TURN_CAP,
    timeoutMs: 0,
    timedOut: false,
  };
}

export function consumeTurn(id: string) {
  const status = quotaStatus(id);
  if (status.timedOut || status.remaining <= 0) {
    const b = bucket(id);
    if (!b.timeoutUntil) b.timeoutUntil = Date.now() + VOICE_TIMEOUT_MS;
    return quotaStatus(id);
  }
  const b = bucket(id);
  b.turns += 1;
  if (b.turns >= VOICE_TURN_CAP) {
    b.timeoutUntil = Date.now() + VOICE_TIMEOUT_MS;
  }
  return quotaStatus(id);
}

export function canIssueSignedUrl() {
  const today = dayKey();
  if (dayGate.day !== today) {
    dayGate.day = today;
    dayGate.signed = 0;
  }
  return dayGate.signed < VOICE_DAILY_SIGNED_URL_CAP;
}

export function markSignedUrlIssued() {
  const today = dayKey();
  if (dayGate.day !== today) {
    dayGate.day = today;
    dayGate.signed = 0;
  }
  dayGate.signed += 1;
}
