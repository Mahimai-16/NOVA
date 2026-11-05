import "server-only";
import { createHmac } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { SUPABASE_URL } from "@/lib/supabase/env";
import type { Enquiry } from "./validation";

export class RateLimitedError extends Error {}

/** Salted hash so we can rate-limit by connection without storing anyone's IP address. */
export function hashIp(ip: string) {
  const salt = process.env.IP_HASH_SALT || `nova-covenant:${SUPABASE_URL}`;
  return createHmac("sha256", salt).update(ip).digest("hex").slice(0, 32);
}

/**
 * Saves a lead through the database function `public.submit_lead`
 * (supabase/migrations/0001_leads.sql). Visitors can't read or edit the table;
 * the function only inserts, and enforces rate limits inside the database.
 */
export async function submitLead(data: Enquiry, meta: { ipHash: string; userAgent: string | null }) {
  const supabase = await createClient();
  const { data: id, error } = await supabase.rpc("submit_lead", {
    p_full_name: data.fullName,
    p_company_name: data.companyName,
    p_business_email: data.businessEmail,
    p_country: data.country,
    p_division: data.division,
    p_requirement: data.requirement,
    p_message: data.message,
    p_ip_hash: meta.ipHash,
    p_user_agent: meta.userAgent?.slice(0, 300) ?? null,
  });
  if (error) {
    if (error.message.includes("RATE_LIMITED")) throw new RateLimitedError(error.message);
    throw new Error(`submit_lead failed: ${error.code ?? ""} ${error.message}`);
  }
  if (typeof id !== "string") throw new Error("submit_lead returned no id");
  return id;
}

export async function markLeadNotified(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_lead_notified", { p_id: id });
  if (error) console.error("[leads] could not mark notified", id, error.message);
}
