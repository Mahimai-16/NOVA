"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send, ChevronDown } from "lucide-react";
import { enquirySchema, type EnquiryField } from "@/lib/validation";
import { divisionOptions, SELECT_DIVISION_EVENT, site } from "@/lib/site";
import Turnstile, { TURNSTILE_SITE_KEY, type TurnstileHandle } from "./Turnstile";

type Values = Record<EnquiryField, string> & { website: string };
type Status = "idle" | "submitting" | "success" | "error";

const empty: Values = {
  fullName: "",
  companyName: "",
  businessEmail: "",
  country: "",
  division: "",
  requirement: "",
  message: "",
  website: "",
};

const inputBase =
  "block w-full rounded-[10px] border bg-white px-4 text-[0.9375rem] text-navy-900 placeholder:text-steel/80 transition-[border-color,box-shadow] duration-200 outline-none focus:border-brand focus:ring-4 focus:ring-brand/15";

export default function EnquiryForm() {
  const uid = useId();
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<Partial<Record<EnquiryField, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  useEffect(() => {
    const onSelect = (e: Event) => {
      const division = (e as CustomEvent<string>).detail;
      if ((divisionOptions as readonly string[]).includes(division)) {
        setValues((v) => ({ ...v, division }));
        setErrors((er) => ({ ...er, division: undefined }));
        setStatus((s) => (s === "success" ? "idle" : s));
      }
    };
    window.addEventListener(SELECT_DIVISION_EVENT, onSelect);
    return () => window.removeEventListener(SELECT_DIVISION_EVENT, onSelect);
  }, []);

  const update = (field: keyof Values, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (field !== "website" && errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    setServerError("");

    const parsed = enquirySchema.safeParse(values);
    if (!parsed.success) {
      const next: Partial<Record<EnquiryField, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as EnquiryField;
        next[key] ??= issue.message;
      }
      setErrors(next);
      const first = Object.keys(next)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setServerError("Just a moment: we're running a quick security check. Please press Send again in a few seconds.");
      setStatus("error");
      requestAnimationFrame(() => statusRef.current?.focus());
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, turnstileToken }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        fieldErrors?: Partial<Record<EnquiryField, string>>;
      };
      if (res.ok && data.ok) {
        setStatus("success");
        setValues(empty);
        setErrors({});
      } else {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        setServerError(data.error || `We couldn't send your enquiry. Please email ${site.email}.`);
        setStatus("error");
      }
    } catch {
      setServerError(`Network error. Please check your connection or email ${site.email}.`);
      setStatus("error");
    }
    // Turnstile tokens are single-use: get a fresh one for any further attempt.
    turnstileRef.current?.reset();
    requestAnimationFrame(() => statusRef.current?.focus());
  }

  if (status === "success") {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="flex h-full min-h-[480px] flex-col items-start justify-center rounded-[var(--radius-feature)] border border-line bg-white p-8 outline-none sm:p-12"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-sage/15 text-sage">
          <CheckCircle2 className="size-7" aria-hidden />
        </span>
        <h3 className="mt-8 font-display text-3xl font-semibold tracking-tight text-navy-900">Thank you — enquiry sent.</h3>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-graphite">
          Your enquiry has been received by our team. We will reply to the business email you provided.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-10 text-sm font-semibold text-brand underline-offset-4 hover:underline"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  const field = (name: EnquiryField) => ({
    id: `${uid}-${name}`,
    name,
    value: values[name],
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${uid}-${name}-error` : undefined,
    className: `${inputBase} ${errors[name] ? "border-red-500/70" : "border-line hover:border-steel/60"}`,
  });

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      aria-label="Business enquiry form"
      className="rounded-[var(--radius-feature)] border border-line bg-white p-6 shadow-[0_40px_80px_-48px_rgba(16,29,46,0.35)] sm:p-10"
    >
      <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
        <Field label="Full Name" htmlFor={`${uid}-fullName`} error={errors.fullName} errorId={`${uid}-fullName-error`}>
          <input {...field("fullName")} type="text" autoComplete="name" className={`${field("fullName").className} h-12`} onChange={(e) => update("fullName", e.target.value)} />
        </Field>
        <Field label="Company Name" htmlFor={`${uid}-companyName`} error={errors.companyName} errorId={`${uid}-companyName-error`}>
          <input {...field("companyName")} type="text" autoComplete="organization" className={`${field("companyName").className} h-12`} onChange={(e) => update("companyName", e.target.value)} />
        </Field>
        <Field label="Business Email" htmlFor={`${uid}-businessEmail`} error={errors.businessEmail} errorId={`${uid}-businessEmail-error`}>
          <input {...field("businessEmail")} type="email" inputMode="email" autoComplete="email" className={`${field("businessEmail").className} h-12`} onChange={(e) => update("businessEmail", e.target.value)} />
        </Field>
        <Field label="Country" htmlFor={`${uid}-country`} error={errors.country} errorId={`${uid}-country-error`}>
          <input {...field("country")} type="text" autoComplete="country-name" className={`${field("country").className} h-12`} onChange={(e) => update("country", e.target.value)} />
        </Field>
        <Field label="Product Division" htmlFor={`${uid}-division`} error={errors.division} errorId={`${uid}-division-error`}>
          <div className="relative">
            <select
              {...field("division")}
              className={`${field("division").className} h-12 appearance-none pr-11 ${values.division ? "" : "text-steel"}`}
              onChange={(e) => update("division", e.target.value)}
            >
              <option value="" disabled>
                Select a division
              </option>
              {divisionOptions.map((d) => (
                <option key={d} value={d} className="text-navy-900">
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-steel" />
          </div>
        </Field>
        <Field label="Product / Requirement" htmlFor={`${uid}-requirement`} error={errors.requirement} errorId={`${uid}-requirement-error`}>
          <input
            {...field("requirement")}
            type="text"
            placeholder="e.g. Motorcycle brake shoes"
            className={`${field("requirement").className} h-12`}
            onChange={(e) => update("requirement", e.target.value)}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Message" htmlFor={`${uid}-message`} error={errors.message} errorId={`${uid}-message-error`}>
            <textarea
              {...field("message")}
              rows={5}
              placeholder="Quantities, specifications, packing, destination port and any other details."
              className={`${field("message").className} resize-y py-3.5 leading-relaxed`}
              onChange={(e) => update("message", e.target.value)}
            />
          </Field>
        </div>
      </div>

      {/* Honeypot — hidden from people and assistive tech */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${uid}-website`}>Website</label>
        <input id={`${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => update("website", e.target.value)} />
      </div>

      <Turnstile ref={turnstileRef} onToken={setTurnstileToken} />

      {status === "error" && serverError && (
        <div
          ref={statusRef}
          tabIndex={-1}
          role="alert"
          className="mt-6 flex gap-3 rounded-[10px] border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-800 outline-none"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {serverError}
        </div>
      )}

      <div className="mt-8 flex flex-col-reverse gap-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-steel sm:max-w-xs">
          All fields are required. Your details are used only to respond to this enquiry. See our{" "}
          <a href="/privacy" className="underline underline-offset-2 hover:text-brand">
            Privacy Policy
          </a>
          .
        </p>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="group inline-flex h-13 items-center justify-center gap-2.5 rounded-full bg-grad-brand px-8 text-[0.9375rem] font-semibold text-white shadow-[0_8px_24px_-8px_rgba(40,85,217,0.7)] transition-[background-position,box-shadow,transform] duration-500 hover:bg-right active:scale-[0.98] disabled:cursor-wait disabled:opacity-80"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Sending…
            </>
          ) : (
            <>
              Send Enquiry
              <Send className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
            </>
          )}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {status === "submitting" ? "Sending your enquiry" : ""}
      </p>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  errorId,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  errorId: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-navy-900">
        {label}
      </label>
      {children}
      {error && (
        <p id={errorId} className="mt-2 flex items-center gap-1.5 text-[0.8125rem] text-red-700">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
