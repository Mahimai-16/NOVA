import "server-only";
import { Resend } from "resend";
import type { Enquiry } from "./validation";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Strip CR/LF so user input can never inject extra headers via the subject line. */
const oneLine = (value: string) => value.replace(/[\r\n]+/g, " ").trim();

export function emailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || "mahi@novacovenanttrading.com";
  const from = process.env.CONTACT_FROM_EMAIL;
  return apiKey && from ? { apiKey, to, from } : null;
}

export async function sendEnquiryEmail(data: Enquiry, leadId?: string) {
  const config = emailConfig();
  if (!config) throw new Error("EMAIL_NOT_CONFIGURED");

  const resend = new Resend(config.apiKey);

  const rows: [string, string][] = [
    ["Full name", data.fullName],
    ["Company", data.companyName],
    ["Business email", data.businessEmail],
    ["Country", data.country],
    ["Division", data.division],
    ["Product / requirement", data.requirement],
    ...(leadId ? ([["Lead ID", leadId]] as [string, string][]) : []),
  ];

  const html = `
  <div style="font-family:Inter,Arial,sans-serif;color:#354152;max-width:640px">
    <p style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#2855D9;margin:0 0 8px">New business enquiry</p>
    <h1 style="font-size:20px;color:#101D2E;margin:0 0 20px">${escapeHtml(data.companyName)} · ${escapeHtml(data.division)}</h1>
    <table style="border-collapse:collapse;width:100%;font-size:14px">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:8px 12px 8px 0;color:#8795A5;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:8px 0;color:#101D2E">${escapeHtml(v)}</td></tr>`,
        )
        .join("")}
    </table>
    <h2 style="font-size:14px;color:#101D2E;margin:24px 0 8px">Message</h2>
    <p style="font-size:14px;line-height:1.6;white-space:pre-wrap;margin:0">${escapeHtml(data.message)}</p>
    <p style="font-size:12px;color:#8795A5;margin-top:32px">Sent from the enquiry form on novacovenanttrading.com. ${leadId ? "Saved to your Supabase leads table. " : ""}Reply directly to respond to the buyer.</p>
  </div>`;

  const text = [
    "New business enquiry",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "Message:",
    data.message,
  ].join("\n");

  const { data: result, error } = await resend.emails.send({
    from: config.from,
    to: [config.to],
    replyTo: data.businessEmail,
    subject: oneLine(`Enquiry: ${data.division} — ${data.companyName} (${data.country})`).slice(0, 180),
    html,
    text,
  });

  if (error || !result?.id) throw new Error(error?.message || "SEND_FAILED");
  return result.id;
}
