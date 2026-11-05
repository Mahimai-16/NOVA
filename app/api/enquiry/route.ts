import { after } from "next/server";
import { enquirySchema } from "@/lib/validation";
import { emailConfig, sendEnquiryEmail } from "@/lib/email";
import { hashIp, markLeadNotified, RateLimitedError, submitLead } from "@/lib/leads";
import { supabaseConfigured } from "@/lib/supabase/env";
import { verifyTurnstile } from "@/lib/turnstile";
import { appendLeadToSheet, sheetsConfigured } from "@/lib/sheets";
import { site } from "@/lib/site";

/**
 * Enquiry pipeline:
 *  1. honeypot + per-instance burst limit (cheap, before any network call)
 *  2. Cloudflare Turnstile (when TURNSTILE_SECRET_KEY is set)
 *  3. Zod validation (same schema as the browser)
 *  4. save the lead to Supabase via submit_lead() (rate limits enforced in the database)
 *     ← the lead is never lost after this
 *  5. after the response, in parallel: email alert via Resend + row in the Google Sheet
 * Without Supabase configured it falls back to email-only delivery.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

/** Per-instance burst guard. Serverless instances don't share memory; the database limits are the real ones. */
const hits = new Map<string, number[]>();
function burstLimited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW * 2;
}

const fail = (status: number, error: string, extra?: Record<string, unknown>) =>
  Response.json({ ok: false, error, ...extra }, { status });

const directEmail = `Please email ${site.email} directly.`;

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const ipHash = hashIp(ip);

  if (burstLimited(ipHash)) {
    return fail(429, "Too many enquiries from this connection. Please try again later or email us directly.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Invalid request.");
  }
  if (!body || typeof body !== "object") return fail(400, "Invalid request.");
  const raw = body as Record<string, unknown>;

  // Honeypot: bots fill hidden fields. Respond neutrally without sending.
  if (raw.website) return fail(400, "Unable to process this enquiry.");

  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return fail(422, "Please check the highlighted fields.", { fieldErrors });
  }
  const data = parsed.data;

  console.log("[enquiry] received", { hasToken: typeof raw.turnstileToken === "string" && raw.turnstileToken.length > 0 });

  if (!(await verifyTurnstile(raw.turnstileToken, ip))) {
    return fail(400, "We couldn't verify this submission. Please refresh the page and try again.", {
      code: "TURNSTILE_FAILED",
    });
  }

  const hasDb = supabaseConfigured();
  const hasEmail = emailConfig() !== null;

  if (!hasDb && !hasEmail) {
    console.error("[enquiry] neither Supabase nor Resend is configured");
    return fail(503, `Online enquiries are temporarily unavailable. ${directEmail}`);
  }

  // Preferred path: save the lead, then notify by email in the background.
  if (hasDb) {
    try {
      const leadId = await submitLead(data, { ipHash, userAgent: request.headers.get("user-agent") });
      console.log("[enquiry] lead saved", leadId);

      const createdAt = new Date();
      after(async () => {
        await Promise.all([
          hasEmail &&
            sendEnquiryEmail(data, leadId)
              .then(() => markLeadNotified(leadId))
              .then(() => console.log("[enquiry] email alert sent", leadId))
              // The lead is already saved; it just shows email_notified = false.
              .catch((err) => console.error("[enquiry] lead saved but email notification failed", leadId, err)),
          sheetsConfigured() &&
            appendLeadToSheet(data, { leadId, createdAt })
              .then((row) => console.log("[enquiry] added to Google Sheet row", row, leadId))
              .catch((err) => console.error("[enquiry] lead saved but Google Sheet update failed", leadId, err)),
        ]);
      });
      return Response.json({ ok: true });
    } catch (err) {
      if (err instanceof RateLimitedError) {
        return fail(429, "Too many enquiries. Please try again later or email us directly.");
      }
      console.error("[enquiry] Supabase save failed", err);
      if (!hasEmail) return fail(502, `We couldn't send your enquiry just now. Please try again or ${directEmail.toLowerCase()}`);
      // Fall through: deliver by email so the enquiry still reaches the team.
    }
  }

  try {
    await sendEnquiryEmail(data);
    if (sheetsConfigured()) {
      after(() =>
        appendLeadToSheet(data, { createdAt: new Date() }).catch((err) =>
          console.error("[enquiry] Google Sheet update failed", err),
        ),
      );
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[enquiry] email send failed", err);
    return fail(502, `We couldn't send your enquiry just now. Please try again or ${directEmail.toLowerCase()}`);
  }
}
