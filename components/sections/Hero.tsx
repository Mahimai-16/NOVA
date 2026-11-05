import Image from "next/image";
import HeroMotion from "@/components/motion/HeroMotion";
import Button from "@/components/ui/Button";
import { site } from "@/lib/site";

/**
 * HERO — shipment imagery and text ONLY.
 * Do not add product imagery, product names, metrics or badges here (brand rule).
 */
/** "Bridging Nations. Building Trust." → second sentence gets the gold italic treatment. */
const [taglineLead, taglineAccent] = site.tagline.split(/(?<=\.)\s+/);

export default function Hero() {
  return (
    <HeroMotion id="home" className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-navy-950 text-white">
      {/* Shipment visual */}
      <div className="absolute inset-0 -z-10" data-hero-parallax>
        {/* Mouse parallax layer (oversized so edges never show while it moves) */}
        <div data-depth="-44" className="absolute -inset-10">
        <div data-hero-bg className="absolute inset-0 origin-[60%_50%]">
          <Image
            src="/images/hero/shipment.png"
            alt="Container vessel moored beside harbour cranes at a commercial port at dusk"
            fill
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-[65%_center] brightness-[1.12] contrast-[1.05] saturate-[1.1]"
          />
        </div>
        </div>
      </div>

      {/* Contrast treatment: midnight-navy gradients keep copy legible over the ship */}
      {/* Phones: text spans the full width, so add an even veil for legibility */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-navy-950/40 md:hidden" />
      {/* Dark only behind the copy (left), so the ship and port stay bright on the right */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(7,19,33,0.86)_0%,rgba(7,19,33,0.62)_32%,rgba(7,19,33,0.18)_58%,rgba(7,19,33,0)_78%)]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(7,19,33,0.85)_0%,rgba(7,19,33,0.15)_28%,rgba(7,19,33,0)_55%,rgba(7,19,33,0.35)_100%)]" />
      <div aria-hidden data-depth="70" className="absolute -left-40 top-1/3 -z-10 size-[42rem] rounded-full bg-brand/12 blur-[140px]" />

      {/* Cursor-following light (desktop only, positioned by HeroMotion) */}
      <div
        aria-hidden
        data-hero-spot
        className="pointer-events-none absolute left-0 top-0 -z-10 hidden size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(22,119,248,0.22),transparent_65%)] opacity-0 mix-blend-screen md:block"
      />

      {/* Very subtle geographic grid */}
      <svg aria-hidden data-depth="-20" className="absolute -inset-12 -z-10 h-[calc(100%+6rem)] w-[calc(100%+6rem)] opacity-[0.07]" preserveAspectRatio="none">
        <defs>
          <pattern id="hero-grid" width="88" height="88" patternUnits="userSpaceOnUse">
            <path d="M88 0H0V88" fill="none" stroke="white" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>

      <div data-hero-veil aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-navy-950 opacity-0" />

      <div data-hero-content className="container-wide pb-24 pt-32 lg:pb-20 lg:pt-28">
        <div data-depth="16" className="max-w-[54rem] [text-shadow:0_2px_28px_rgba(7,19,33,0.6)]">
          <p data-hero-item className="eyebrow flex items-center gap-3 text-[0.8125rem] tracking-[0.28em] text-[#8FB8FF]">
            <span aria-hidden className="h-px w-12 bg-gradient-to-r from-[#8FB8FF] to-transparent" />
            {site.secondaryTagline.replace(/\.$/, "")}
          </p>
          <h1
            data-hero-item
            className="mt-7 font-display text-[clamp(2.5rem,5vw,6rem)] font-medium leading-[1.06] tracking-[-0.015em]"
          >
            <span className="block sm:whitespace-nowrap">{taglineLead}</span>
            <span className="-mb-[0.15em] block w-fit pb-[0.15em] pr-[0.15em] italic text-grad-gold [text-shadow:none] sm:whitespace-nowrap">{taglineAccent}</span>
          </h1>
          <p data-hero-item className="mt-8 max-w-[32rem] text-lg leading-relaxed text-white/80 xl:max-w-[36rem] xl:text-xl">
            Connecting markets with dependable products through international trading, sourcing and distribution, built on reliable relationships and clear communication.
          </p>
          <div data-hero-item className="mt-11 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button href="#divisions" arrow>
              Explore Our Divisions
            </Button>
            <Button href="#contact" variant="ghost-dark">
              Business Enquiry
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <a
        href="#about"
        aria-label="Scroll to About"
        data-hero-item
        className="absolute bottom-8 right-5 hidden 2xl:right-20 flex-col items-center gap-3 text-[0.625rem] font-semibold tracking-[0.3em] text-white/50 transition-colors hover:text-white md:flex md:right-8 xl:right-14"
      >
        <span className="[writing-mode:vertical-rl]">SCROLL</span>
        <span className="relative h-14 w-px overflow-hidden bg-white/20">
          <span className="absolute inset-x-0 top-0 h-1/2 bg-white motion-safe:animate-[scroll-cue_2.2s_ease-in-out_infinite]" />
        </span>
      </a>
    </HeroMotion>
  );
}
