import { ArrowUpRight, Mail } from "lucide-react";
import Wordmark from "@/components/ui/Wordmark";
import CurrentYear from "@/components/ui/CurrentYear";
import { navLinks, site } from "@/lib/site";

export default function Footer() {
  return (
    <footer id="footer" className="relative overflow-hidden bg-grad-deep text-white">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent" />
      <div className="container-x pt-20 pb-10 lg:pt-28">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Wordmark tone="dark" />
            <p className="mt-8 max-w-sm font-display text-2xl font-medium leading-snug tracking-tight text-white/90">
              {site.tagline}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50">
              International trading, sourcing and distribution for Automotive &amp; Mobility and Food &amp; Agriculture.
            </p>
          </div>

          <nav aria-label="Footer" className="lg:col-span-3">
            <p className="eyebrow text-white/40">Navigate</p>
            <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 lg:grid-cols-1">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={`/${l.href}`} className="text-sm text-white/70 transition-colors hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-4">
            <p className="eyebrow text-white/40">Business enquiries</p>
            <a
              href={`mailto:${site.email}`}
              className="group mt-6 inline-flex items-center gap-3 break-all text-base text-white transition-colors hover:text-brand-bright sm:text-lg"
            >
              <Mail className="size-5 shrink-0 text-brand-bright" aria-hidden />
              {site.email}
              <ArrowUpRight aria-hidden className="size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
            <p className="mt-4 text-sm text-white/50">Importers, dealers, distributors, wholesalers and procurement teams are welcome to get in touch.</p>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> {site.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="transition-colors hover:text-white">
              Privacy Policy
            </a>
            <a href="#main" className="transition-colors hover:text-white">
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
