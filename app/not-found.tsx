import type { Metadata } from "next";
import SimplePage from "@/components/layout/SimplePage";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page not found · Nova Covenant International Trading",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <SimplePage>
      <section className="container-x section-y">
        <p className="eyebrow text-brand">Error 404</p>
        <h1 className="mt-5 font-display text-[clamp(2.25rem,4vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-navy-900">
          This page could not be found.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-graphite">
          The link may be out of date, or the page may have moved. Everything about Nova Covenant is on our main page.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button href="/" arrow>
            Go to the homepage
          </Button>
          <Button href="/#contact" variant="outline">
            Send an enquiry
          </Button>
        </div>
      </section>
    </SimplePage>
  );
}
