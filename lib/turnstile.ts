import "server-only";

/** Cloudflare Turnstile is enforced only when its secret key is configured. */
export function turnstileConfigured() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export async function verifyTurnstile(token: unknown, ip: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || !token || token.length > 2048) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (ip && ip !== "unknown") body.set("remoteip", ip);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!data.success) console.warn("[turnstile] rejected", data["error-codes"]);
    return data.success === true;
  } catch (err) {
    console.error("[turnstile] verification request failed", err);
    return false;
  }
}
