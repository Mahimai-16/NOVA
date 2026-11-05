import "server-only";
import type { Enquiry } from "./validation";

/**
 * Sends a lead to the Google Sheet through the Apps Script web app in
 * google-apps-script/LeadsSheet.gs. Only the tracking fields are sent.
 */
function config() {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const secret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;
  return url && secret ? { url, secret } : null;
}

export function sheetsConfigured() {
  return config() !== null;
}

export async function appendLeadToSheet(data: Enquiry, meta: { leadId?: string; createdAt: Date }) {
  const c = config();
  if (!c) throw new Error("SHEETS_NOT_CONFIGURED");

  const res = await fetch(c.url, {
    method: "POST",
    // Apps Script reads the raw body; text/plain avoids a CORS preflight-style rejection.
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      secret: c.secret,
      leadId: meta.leadId,
      createdAt: meta.createdAt.toISOString(),
      fullName: data.fullName,
      companyName: data.companyName,
      businessEmail: data.businessEmail,
      country: data.country,
      division: data.division,
      requirement: data.requirement,
      message: data.message,
    }),
    redirect: "follow", // Apps Script answers via a redirect to googleusercontent.com
    signal: AbortSignal.timeout(20_000),
  });

  const text = await res.text();
  let result: { ok?: boolean; error?: string; row?: number };
  try {
    result = JSON.parse(text);
  } catch {
    throw new Error(`Sheets webhook returned ${res.status} non-JSON: ${text.slice(0, 160)}`);
  }
  if (!result.ok) throw new Error(`Sheets webhook error: ${result.error ?? "unknown"}`);
  return result.row;
}
