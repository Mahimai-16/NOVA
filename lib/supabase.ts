import "server-only";
import { createHmac } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Enquiry } from "./validation";

/** Server-side only. The secret key bypasses Row Level Security, so it must never reach the browser. */
function config() {
  const url = process.env.SUPABASE_URL;
  // New-style "sb_secret_..." key, or the legacy service_role JWT.
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

let client: SupabaseClient | null = null;

export function supabaseConfigured() {
  return config() !== null;
}

function db() {
  const c = config();
  if (!c) throw new Error("SUPABASE_NOT_CONFIGURED");
  client ??= createClient(c.url, c.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}

/** Salted hash so we can rate-limit by connection without storing anyone's IP address. */
export function hashIp(ip: string) {
  const salt = process.env.IP_HASH_SALT || config()?.key || "nova-covenant";
  return createHmac("sha256", salt).update(ip).digest("hex").slice(0, 32);
}

/** How many leads this connection has submitted in the last `windowMs`. */
export async function recentLeadCount(ipHash: string, windowMs: number) {
  const since = new Date(Date.now() - windowMs).toISOString();
  const { count, error } = await db()
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  if (error) throw new Error(`rate-limit query failed: ${error.message}`);
  return count ?? 0;
}

export async function insertLead(data: Enquiry, meta: { ipHash: string; userAgent: string | null }) {
  const { data: row, error } = await db()
    .from("leads")
    .insert({
      full_name: data.fullName,
      company_name: data.companyName,
      business_email: data.businessEmail,
      country: data.country,
      division: data.division,
      requirement: data.requirement,
      message: data.message,
      ip_hash: meta.ipHash,
      user_agent: meta.userAgent?.slice(0, 300) ?? null,
    })
    .select("id")
    .single();
  if (error || !row) throw new Error(`insert failed: ${error?.message ?? "no row returned"}`);
  return row.id as string;
}

export async function markLeadNotified(id: string) {
  const { error } = await db().from("leads").update({ email_notified: true }).eq("id", id);
  if (error) console.error("[leads] could not mark notified", id, error.message);
}
