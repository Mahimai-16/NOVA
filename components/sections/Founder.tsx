import Image from "next/image";
import type { ReactNode } from "react";
import { ImagePlus, Mail, MapPin, Quote, BriefcaseBusiness, Layers, ArrowUpRight } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import FounderStage from "@/components/three/FounderStage";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { founder } from "@/lib/founder";

/** Dashed "fill me in" chip used wherever a founder detail is still empty. */
function Placeholder({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-lg border border-dashed border-steel/50 bg-cloud px-3 py-1 text-steel ${className}`}>
      {children}
    </span>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

export default function Founder() {
  const details = [
    { icon: BriefcaseBusiness, label: "Role", value: founder.role },
    { icon: MapPin, label: "Based in", value: founder.location },
    { icon: Layers, label: "Divisions", value: founder.focus.join(" · ") },
    { icon: Mail, label: "Email", value: founder.email, href: `mailto:${founder.email}` },
  ];

  return (
    <Reveal as="section" id="founder" aria-labelledby="founder-title" className="section-y bg-grad-cloud">
      <div className="container-x">
        <SectionHeading
          eyebrow="Leadership"
          title={<span id="founder-title">Meet the Founder.</span>}
          intro="Every enquiry is handled with direct involvement from the founder, so buyers deal with a decision-maker from the first conversation."
        />

        <article
          data-reveal
          className="mt-14 grid overflow-hidden rounded-[var(--radius-feature)] border border-line bg-white shadow-[0_40px_80px_-56px_rgba(16,29,46,0.4)] lg:mt-20 lg:grid-cols-12"
        >
          {/* Portrait */}
          <div className="relative lg:col-span-5">
            <div data-reveal-image className="relative aspect-[4/5] h-full w-full overflow-hidden bg-navy-900 lg:aspect-auto lg:min-h-[560px]">
              {founder.photo ? (
                /* Picture set in lib/founder.ts: shown as the original image, no 3D effects or overlays */
                <Image
                  src={founder.photo}
                  alt={founder.photoAlt || (founder.name ? `Portrait of ${founder.name}` : "Founder portrait")}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover object-center"
                />
              ) : (
                <>
                  {/* No photo yet: 3D stage with a placeholder panel and a container ship in orbit (three.js) */}
                  <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,#1a3566_0%,#0d1b31_55%,#071321_100%)]" />
                  <FounderStage>
                    <div className="absolute inset-4 flex flex-col items-center justify-center rounded-[18px] border-2 border-dashed border-white/20 text-center sm:inset-6">
                      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(40,85,217,0.35),transparent_60%)]" />
                      <span className="relative flex size-20 items-center justify-center rounded-full bg-white/10 text-white/70 ring-1 ring-white/15">
                        <ImagePlus className="size-8" aria-hidden />
                      </span>
                      <p className="relative mt-6 font-display text-lg font-semibold text-white">Founder photo</p>
                      <p className="relative mt-2 max-w-[16rem] text-sm leading-relaxed text-white/50">Portrait placeholder. Add a 4:5 photo and set it in lib/founder.ts</p>
                    </div>
                  </FounderStage>
                </>
              )}
              <span className="pointer-events-none absolute bottom-6 left-6 inline-flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-navy-900">
                <span aria-hidden className="size-1.5 rounded-full bg-brand" />
                Founder
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col p-7 sm:p-10 lg:col-span-7 lg:p-14">
            <p className="eyebrow text-brand">{founder.role}</p>
            <h3 className="mt-4 font-display text-[clamp(2rem,3.4vw,2.75rem)] font-semibold leading-tight tracking-tight text-navy-900">
              {founder.name || <Placeholder className="font-display text-[0.6em] font-medium">Founder Name</Placeholder>}
            </h3>
            <p className="mt-3 text-graphite">
              Nova Covenant International Trading
              {founder.background ? <> · {founder.background}</> : null}
            </p>
            {!founder.background && (
              <p className="mt-3">
                <Placeholder className="text-sm">Short background: experience, industry or education</Placeholder>
              </p>
            )}

            <blockquote className="relative mt-10 border-l-2 border-brand pl-6">
              <Quote aria-hidden className="absolute -left-3 -top-3 size-6 rounded-full bg-white p-1 text-brand" />
              <p className="text-lg leading-relaxed text-navy-900/85">
                {founder.message || <Placeholder>Founder&rsquo;s message</Placeholder>}
              </p>
            </blockquote>

            <dl className="mt-10 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-2">
              {details.map((d) => (
                <div key={d.label} className="flex items-start gap-4 bg-white p-5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cloud text-navy-900 ring-1 ring-line">
                    <d.icon className="size-[1.125rem]" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <dt className="eyebrow text-steel">{d.label}</dt>
                    <dd className="mt-1.5 break-words font-medium text-navy-900">
                      {d.value ? (
                        d.href ? (
                          <a href={d.href} className="transition-colors hover:text-brand">{d.value}</a>
                        ) : (
                          d.value
                        )
                      ) : (
                        <Placeholder className="text-sm">Add {d.label.toLowerCase()}</Placeholder>
                      )}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href={`mailto:${founder.email}`} arrow>
                Email the Founder
              </Button>
              {founder.linkedin ? (
                <a
                  href={founder.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex h-13 items-center justify-center gap-2.5 rounded-full border border-line px-7 text-[0.9375rem] font-semibold text-navy-900 transition-colors hover:border-brand hover:text-brand"
                >
                  <LinkedinIcon className="size-4" />
                  LinkedIn
                  <ArrowUpRight aria-hidden className="size-4" />
                </a>
              ) : (
                <span className="inline-flex h-13 items-center justify-center gap-2.5 rounded-full border border-dashed border-steel/50 px-7 text-[0.9375rem] font-medium text-steel">
                  <LinkedinIcon className="size-4" />
                  LinkedIn profile: add URL
                </span>
              )}
            </div>
          </div>
        </article>
      </div>
    </Reveal>
  );
}
