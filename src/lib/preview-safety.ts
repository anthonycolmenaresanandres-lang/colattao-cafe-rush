/** Preview deployments must never use inherited credentials to mutate live services. */
export function isReadOnlyPreview(env: Record<string, string | undefined> = process.env) {
  return env.VERCEL_ENV === "preview";
}

export const PREVIEW_SUBMISSION_MESSAGE = "This is a read-only preview. Nothing was sent, uploaded or changed. Use the menu demo to explore safely.";
