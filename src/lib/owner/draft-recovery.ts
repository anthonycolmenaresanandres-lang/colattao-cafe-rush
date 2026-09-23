import { MAX_MENU_BYTES, validateMenu, type MenuDocument } from "./menu-model";

export type RecoveryDraft = { schemaVersion: 1; scope: string; revision: number; savedAt: number; menu: MenuDocument };
export const RECOVERY_LIFETIME = 24 * 60 * 60 * 1000;
export const recoveryKey = (scope: string) => `colattao-owner-draft:v1:${scope}`;

/** Recovery is untrusted input, scoped to the authenticated business AND user. */
export function decodeRecovery(raw: string | null, scope: string, now = Date.now()): RecoveryDraft | null {
  if (!raw || raw.length > MAX_MENU_BYTES + 1000) return null;
  try {
    const value = JSON.parse(raw);
    if (!value || value.schemaVersion !== 1 || value.scope !== scope || !Number.isSafeInteger(value.revision) || value.revision < 1 || !Number.isFinite(value.savedAt) || value.savedAt > now + 60_000 || now - value.savedAt > RECOVERY_LIFETIME) return null;
    const menu = validateMenu(value.menu, { allowIncompleteNames: true });
    return { schemaVersion: 1, scope, revision: value.revision, savedAt: value.savedAt, menu };
  } catch { return null; }
}

export function encodeRecovery(scope: string, revision: number, menu: MenuDocument, now = Date.now()): string {
  return JSON.stringify({ schemaVersion: 1, scope, revision, savedAt: now, menu });
}
