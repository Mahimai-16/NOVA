import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

/**
 * Supabase client for Route Handlers, Server Functions and Server Components.
 * Create a new one per request (it's cheap): it reads that request's cookies, which
 * is what lets user sessions work once authentication is added later.
 * Using it makes the calling route dynamic (rendered per request).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies are read-only. Safe to ignore
          // while there is no authentication (no session to refresh).
        }
      },
    },
  });
}
