import { ArrowLeftRight, Search, Truck } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { site } from "@/lib/site";

const pillars = [
  {
    icon: ArrowLeftRight,
    title: "Trading",
    body: "Commercial buying and selling between suppliers and business buyers across international markets.",
  },
  {
    icon: Search,
    title: "Sourcing",
    body: "Identifying suitable products and suppliers in multiple countries against each buyer's requirement.",
  },
  {
    icon: Truck,
    title: "Distribution",
    body: "Coordinating the movement of goods from source to the markets our partners serve.",
  },
];

/** "Build a globally recognized…" → "To build a globally recognized…" with the verb highlighted. */
const [visionVerb, ...visionWords] = site.vision.split(" ");
const visionRest = visionWords.join(" ");

export default function About() {
  return (
    <Reveal as="section" id="about" aria-labelledby="about-title" className="section-y bg-grad-white">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <SectionHeading eyebrow="About Nova Covenant" title={<span id="about-title">Trade Built on Relationships.</span>} />
          </div>
          <div className="space-y-6 text-lg leading-relaxed text-graphite lg:col-span-5 lg:col-start-8 lg:pt-12">
            <p data-reveal>
              <strong className="font-semibold text-navy-900">Nova Covenant International Trading</strong> operates from multiple
              countries and sources products from multiple countries. We work with importers, dealers, distributors, wholesalers and
              procurement teams who need a dependable counterpart for cross-border supply.
            </p>
            <p data-reveal>
              Every relationship starts with a clear understanding of the buyer&rsquo;s requirement and continues with direct,
              consistent communication &mdash; from the first enquiry to the final arrangement of supply.
            </p>
          </div>
        </div>

        {/* Vision */}
        <figure
          data-reveal
          className="relative mt-20 overflow-hidden rounded-[var(--radius-feature)] bg-grad-navy px-7 py-12 text-white sm:px-12 lg:mt-28 lg:px-16 lg:py-16"
        >
          <div aria-hidden className="absolute -right-24 -top-24 size-80 rounded-full bg-brand/30 blur-[100px]" />
          <div aria-hidden className="absolute -bottom-28 left-1/3 size-72 rounded-full bg-[#F5B942]/10 blur-[100px]" />
          <div className="relative grid gap-8 lg:grid-cols-12 lg:items-center">
            <figcaption className="lg:col-span-3">
              <p className="eyebrow flex items-center gap-3 text-[#F5C35A]">
                <span aria-hidden className="h-px w-8 bg-current" />
                Our Vision
              </p>
              <p className="mt-4 hidden text-sm leading-relaxed text-white/50 lg:block">{site.secondaryTagline}</p>
            </figcaption>
            <blockquote className="lg:col-span-9">
              <p className="font-display text-[clamp(1.625rem,3vw,2.5rem)] font-medium italic leading-snug tracking-[-0.01em] text-balance">
                To <span className="text-grad-gold not-italic">{visionVerb.toLowerCase()}</span> {visionRest}
              </p>
            </blockquote>
          </div>
        </figure>

        <ol className="mt-20 grid border-t border-line md:grid-cols-3 lg:mt-28">
          {pillars.map((p, i) => (
            <li
              key={p.title}
              data-reveal
              className="group relative border-b border-line py-10 md:border-b-0 md:px-8 md:py-12 md:first:pl-0 md:[&:not(:first-child)]:border-l"
            >
              <span aria-hidden className="absolute left-0 top-0 h-px w-0 bg-brand transition-[width] duration-700 ease-out-expo group-hover:w-full md:group-first:left-0" />
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-medium text-steel">0{i + 1}</span>
                <span className="flex size-11 items-center justify-center rounded-full bg-brand/8 text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                  <p.icon className="size-5" aria-hidden />
                </span>
              </div>
              <h3 className="mt-8 font-display text-2xl font-semibold tracking-tight text-navy-900">{p.title}</h3>
              <p className="mt-3 max-w-xs leading-relaxed text-graphite">{p.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </Reveal>
  );
}
