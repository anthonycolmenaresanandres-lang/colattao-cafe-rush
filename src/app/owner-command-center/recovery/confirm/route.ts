import { NextResponse, type NextRequest } from "next/server";
import { authorizeOwner, ownerClient } from "@/lib/owner/server";
import { confirmRecovery, recoveryConfig, RECOVERY_PATH } from "@/lib/owner/recovery";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const headers = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow" };
  let config;
  try { config = recoveryConfig(); } catch { /* Never derive a redirect destination from a request Host header. */ }
  if (!config) return new NextResponse("Password recovery is not configured. Return to owner sign-in or contact your administrator.", { status: 503, headers });
  let confirmed = false;
  try {
    const client = await ownerClient(true);
    const codes = request.nextUrl.searchParams.getAll("code");
    confirmed = await confirmRecovery(codes.length === 1 ? codes[0] : null, !request.nextUrl.searchParams.has("error"), {
      exchange: async (code) => {
        const result = await client.auth.exchangeCodeForSession(code);
        // The installed SDK returns redirectType from its PKCE verifier, although
        // its public TS return type omits it. Check at runtime and fail closed.
        const redirectType = "redirectType" in result.data && typeof result.data.redirectType === "string" ? result.data.redirectType : null;
        return { error: result.error, data: { redirectType } };
      },
      authorize: () => authorizeOwner(client),
      signOut: () => client.auth.signOut({ scope: "local" }),
    });
  } catch { /* Do not reflect provider errors, codes or tokens into HTML. */ }
  // Fixed internal destinations: ignore all user-supplied next/redirect parameters.
  return NextResponse.redirect(`${config.origin}${RECOVERY_PATH}${confirmed ? "/password" : "?error=link"}`, { status: 303, headers });
}
