"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/** Public site key, inlined at build time. When unset, the widget renders nothing (local dev). */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptPromise: Promise<void> | null = null;

function loadScript() {
  if (window.turnstile) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export type TurnstileHandle = { reset: () => void };

/**
 * Cloudflare Turnstile: a privacy-friendly, usually invisible bot check.
 * Tokens are single-use, so the form calls reset() after every submission attempt.
 */
const Turnstile = forwardRef<TurnstileHandle, { onToken: (token: string) => void }>(function Turnstile({ onToken }, ref) {
  const el = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      onTokenRef.current("");
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    },
  }));

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !el.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(el.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: "light",
          size: "flexible",
          appearance: "interaction-only",
          callback: (t: string) => onTokenRef.current(t),
          "expired-callback": () => onTokenRef.current(""),
          "error-callback": () => onTokenRef.current(""),
        });
      })
      .catch((err) => console.error(err));
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, []);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={el} className="mt-6 empty:hidden" />;
});

export default Turnstile;
