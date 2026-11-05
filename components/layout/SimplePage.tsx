import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Wordmark from "@/components/ui/Wordmark";
import Footer from "@/components/layout/Footer";

/** Shell for secondary pages (privacy policy, 404): dark top bar, content, footer. */
export default function SimplePage({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="bg-navy-950">
        <nav aria-label="Primary" className="container-wide flex h-[72px] items-center justify-between gap-6 lg:h-20">
          <Link href="/" className="shrink-0 rounded-md">
            <Wordmark tone="dark" />
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white">
            <ArrowLeft className="size-4" aria-hidden />
            Back to website
          </Link>
        </nav>
      </header>
      <main id="main" className="bg-grad-white">
        {children}
      </main>
      <Footer />
    </>
  );
}
