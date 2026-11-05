import type { Metadata } from "next";
import type { ReactNode } from "react";
import SimplePage from "@/components/layout/SimplePage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy · Nova Covenant International Trading",
  description: "How Nova Covenant International Trading collects, uses and protects the details you send through our website.",
  alternates: { canonical: "/privacy" },
};

/** Update this date whenever the policy text changes. */
const LAST_UPDATED = "5 November 2026";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-navy-900">{title}</h2>
      <div className="mt-4 space-y-4 leading-relaxed text-graphite">{children}</div>
    </section>
  );
}

const mail = (
  <a href={`mailto:${site.email}`} className="font-medium text-brand underline-offset-2 hover:underline">
    {site.email}
  </a>
);

export default function PrivacyPage() {
  return (
    <SimplePage>
      <article className="container-x section-y">
        <div className="max-w-3xl">
          <p className="eyebrow text-brand">Legal</p>
          <h1 className="mt-5 font-display text-[clamp(2.25rem,4vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-navy-900">
            Privacy Policy
          </h1>
          <p className="mt-6 text-sm text-steel">Last updated: {LAST_UPDATED}</p>

          <p className="mt-8 text-lg leading-relaxed text-graphite">
            This policy explains how {site.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) handles the information you share with us
            through this website. We collect only what we need to respond to business enquiries.
          </p>

          <Section title="Information we collect">
            <p>When you send an enquiry, we collect the details you enter in the form:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>your full name, company name and business email address</li>
              <li>your country</li>
              <li>the product division, your product requirement and your message</li>
            </ul>
            <p>
              To protect the form from spam and abuse, we also record your browser type and a one-way, salted hash derived from
              your IP address. We do not store your IP address itself.
            </p>
          </Section>

          <Section title="How we use it">
            <p>We use your information only to:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>read and respond to your enquiry, and follow up on the business discussion it starts</li>
              <li>keep a record of enquiries we have received</li>
              <li>prevent spam and misuse of the enquiry form</li>
            </ul>
            <p>We do not sell your information, and we do not use it for unrelated marketing.</p>
          </Section>

          <Section title="Service providers">
            <p>We use trusted providers to run this website. They process data on our behalf and only for these purposes:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                <strong className="font-semibold text-navy-900">Vercel</strong>: website hosting, plus privacy-friendly visitor
                statistics that use no cookies and do not identify you
              </li>
              <li>
                <strong className="font-semibold text-navy-900">Supabase</strong>: secure storage of enquiries
              </li>
              <li>
                <strong className="font-semibold text-navy-900">Resend</strong>: delivery of enquiry notifications to our team
              </li>
              <li>
                <strong className="font-semibold text-navy-900">Cloudflare Turnstile</strong>: an automated check that the form
                is being used by a person, not a bot
              </li>
            </ul>
            <p>Some of these providers may process data outside your country, with safeguards in place.</p>
          </Section>

          <Section title="Cookies">
            <p>
              This website does not use advertising or tracking cookies. The spam check may use strictly necessary technical data
              to work.
            </p>
          </Section>

          <Section title="How long we keep it">
            <p>
              We keep enquiry details for as long as needed to handle your enquiry and any business relationship that follows,
              and then delete them, unless we are required by law to keep them longer.
            </p>
          </Section>

          <Section title="Your rights">
            <p>
              You can ask us to access, correct or delete the information we hold about you, or withdraw your consent to us
              using it, at any time. Email us at {mail} and we will respond promptly. If you are not satisfied with our
              response, you may contact the data protection authority in your country.
            </p>
          </Section>

          <Section title="Security">
            <p>
              Enquiries are sent over encrypted connections (HTTPS) and stored in a database that is not publicly accessible.
              Access is limited to our team.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about this policy or your data: {mail}. We may update this policy from time to time; the date at the
              top shows the latest version.
            </p>
          </Section>
        </div>
      </article>
    </SimplePage>
  );
}
