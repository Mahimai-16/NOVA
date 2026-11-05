"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

/**
 * Supabase client for Client Components (runs in the visitor's browser).
 * Not used by the enquiry form, which submits through /api/enquiry so the server
 * can run validation, spam checks and email alerts. Ready for future features.
 */
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}
