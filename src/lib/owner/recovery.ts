/** Recovery policy and orchestration. Provider calls are injected for offline tests. */
import { isReadOnlyPreview } from "../preview-safety";
export type RecoveryState = { error: string; message: string; done?: boolean; sessionSignOutFailed?: boolean };
type ProviderResult = { error: { code?: string } | null };
export const RECOVERY_PATH = "/owner-command-center/recovery";

export function recoveryConfig(env: Record<string, string | undefined> = process.env) {
  if (isReadOnlyPreview(env)) return null;
  if (env.OWNER_PORTAL_ENABLED !== "true" || env.OWNER_RECOVERY_ENABLED !== "true") return null;
  const raw = env.OWNER_APP_ORIGIN;
  if (!raw) throw new Error("Recovery origin is not configured");
  const url = new URL(raw);
  const local = env.NODE_ENV !== "production" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if ((url.protocol !== "https:" && !(local && url.protocol === "http:")) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error("Recovery origin must be a trusted HTTPS origin");
  return { origin: url.origin, callback: `${url.origin}${RECOVERY_PATH}/confirm` };
}

export function recoveryAvailable() {
  try { return recoveryConfig() !== null; } catch { return false; }
}

export async function requestRecovery(email: unknown, callback: string | null, send: (email: string, callback: string) => Promise<ProviderResult>): Promise<RecoveryState> {
  if (!callback) return { error: "Password recovery is not configured yet. Contact your Colattao administrator.", message: "" };
  if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return { error: "Enter a valid email address.", message: "" };
  try {
    const result = await send(email.trim(), callback);
    if (result.error) throw new Error("Recovery request not confirmed");
    // Identical for existing and unknown accounts. Never promise email delivery.
    return { error: "", message: "If an account exists for that address, a reset email will be sent. Open the newest link in this browser. Check spam and wait at least a minute before requesting another link." };
  } catch {
    return { error: "The reset request could not be confirmed. Wait a minute and try again, or contact your administrator. Your menu has not changed.", message: "" };
  }
}

export async function confirmRecovery(code: unknown, enabled: boolean, ports: {
  exchange: (code: string) => Promise<{ error: unknown; data: { redirectType: string | null } }>;
  authorize: () => Promise<unknown>;
  signOut: () => Promise<unknown>;
}) {
  if (!enabled || typeof code !== "string" || !/^[A-Za-z0-9_-]{1,2048}$/.test(code)) return false;
  try {
    const result = await ports.exchange(code);
    if (result.error || result.data.redirectType !== "recovery") throw new Error("Invalid recovery link");
    await ports.authorize();
    return true;
  } catch {
    try { await ports.signOut(); } catch { /* The protected page/action still checks membership. */ }
    return false;
  }
}

export async function changePassword(password: unknown, confirmation: unknown, enabled: boolean, authorize: () => Promise<{
  update: (password: string) => Promise<ProviderResult>;
  signOut: () => Promise<ProviderResult>;
}>): Promise<RecoveryState> {
  if (!enabled) return { error: "Password recovery is not configured yet.", message: "" };
  if (typeof password !== "string" || password.length < 12 || password.length > 256 || !password.trim()) return { error: "Use a password or passphrase between 12 and 256 characters.", message: "" };
  if (confirmation !== password) return { error: "The passwords do not match.", message: "" };
  let account;
  try { account = await authorize(); } catch { return { error: "Your session or access could not be verified. Request a new reset link or sign in again.", message: "" }; }
  try {
    const result = await account.update(password);
    if (result.error?.code === "weak_password") return { error: "Choose a stronger password that meets your account's password policy.", message: "" };
    if (result.error?.code === "same_password") return { error: "Choose a password different from your current password.", message: "" };
    if (result.error) throw new Error("Password update not confirmed");
  } catch {
    // A network failure may occur after the provider accepted the new password.
    return { error: "The password change could not be confirmed. Try signing in with your new password before requesting another reset. Your menu has not changed.", message: "" };
  }
  try {
    const result = await account.signOut();
    if (result.error) throw new Error("Sign-out not confirmed");
  } catch {
    return { error: "", done: true, sessionSignOutFailed: true, message: "Your password was changed, but signing out existing sessions could not be confirmed. Contact your administrator if another device may have access." };
  }
  return { error: "", done: true, message: "Your password was changed. Sign in with your new password. Existing access tokens may remain valid until they expire." };
}
