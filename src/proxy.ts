import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ownerConnection, ownerEnabled } from "@/lib/owner/config";
import { ownerFetch } from "@/lib/owner/request";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  if (!ownerEnabled()) return response;
  try {
    const { url, key } = ownerConnection();
    const client = createServerClient(url, key, {
      global: { fetch: ownerFetch() },
      cookieOptions: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (values, headers) => {
          for (const { name, value } of values) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          response.headers.set("Cache-Control", "private, no-store");
          for (const { name, value, options } of values) response.cookies.set(name, value, options);
          for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
          response.headers.set("Cache-Control", "private, no-store");
          response.headers.set("Referrer-Policy", "no-referrer");
          response.headers.set("X-Robots-Tag", "noindex, nofollow");
        },
      },
    });
    // Refresh only. Every page/action independently checks user AND membership.
    await client.auth.getUser();
  } catch {
    // The protected page/action fails closed with a useful recovery message.
  }
  return response;
}

export const config = { matcher: ["/owner-command-center/:path*"] };
