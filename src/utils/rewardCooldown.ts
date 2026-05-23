const STORAGE_KEY = "discount_claimed_timestamp";
const COOLDOWN_MS = 12 * 60 * 60 * 1000;

export type CooldownStatus = {
  blocked: boolean;
  remainingMs: number;
  claimedAt: number | null;
};

function getStoredTimestamp(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getCooldownStatus(now = Date.now()): CooldownStatus {
  const claimedAt = getStoredTimestamp();
  if (!claimedAt) {
    return { blocked: false, remainingMs: 0, claimedAt: null };
  }

  const elapsed = now - claimedAt;
  const remainingMs = Math.max(0, COOLDOWN_MS - elapsed);

  return {
    blocked: remainingMs > 0,
    remainingMs,
    claimedAt,
  };
}

export function claimReward(now = Date.now()): CooldownStatus {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, String(now));
  }

  return getCooldownStatus(now);
}
