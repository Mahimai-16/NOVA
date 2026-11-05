import { Mail, ListChecks } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import EnquiryForm from "@/components/ui/EnquiryForm";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { site } from "@/lib/site";

const helpful = [
  "Product name, model or part numbers",
  "Required quantity and packing",
  "Destination country and port",
  "Preferred trade terms (e.g. FOB, CIF)",
];

export default function Contact() {
  return (
    <Reveal as="section" id="contact" aria-labelledby="contact-title" className="section-y relative bg-grad-cloud">
      <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <SectionHeading
            eyebrow="Business Enquiry"
            title={<span id="contact-title">Let&rsquo;s Discuss Your Requirements.</span>}
            intro="Send us your enquiry and we will get back to you by email. For direct contact, write to us at any time."
          />

          <a
            data-reveal
            href={`mailto:${site.email}`}
            className="group mt-10 flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-white p-5 transition-colors hover:border-brand"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-grad-brand text-white">
              <Mail className="size-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="eyebrow block text-steel">Email</span>
              <span className="mt-1 block break-all font-medium text-navy-900 group-hover:text-brand sm:text-lg">{site.email}</span>
            </span>
          </a>

          <a
            data-reveal
            href={`https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent("Hello Nova Covenant, I have a business enquiry.")}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Chat on WhatsApp: ${site.whatsapp.display}`}
            className="group mt-4 flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-white p-5 transition-colors hover:border-[#25D366]"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
              <WhatsAppIcon className="size-6" />
            </span>
            <span className="min-w-0">
              <span className="eyebrow block text-steel">WhatsApp contact</span>
              <span className="mt-1 block font-medium text-navy-900 group-hover:text-[#128C7E] sm:text-lg">{site.whatsapp.display}</span>
            </span>
          </a>

          <div data-reveal className="mt-8 rounded-[var(--radius-card)] bg-grad-navy p-7 text-white">
            <p className="flex items-center gap-3 font-display font-semibold">
              <ListChecks className="size-5 text-brand-bright" aria-hidden />
              Helpful to include
            </p>
            <ul className="mt-5 space-y-3 text-[0.9375rem] text-white/70">
              {helpful.map((h) => (
                <li key={h} className="flex gap-3">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-bright" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div data-reveal className="lg:col-span-7">
          <EnquiryForm />
        </div>
      </div>
    </Reveal>
  );
}
