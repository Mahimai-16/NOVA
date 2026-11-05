import Image from "next/image";

/**
 * Brand lock-up: the gold NC monogram (public/brand/nc-logo.png) beside the
 * company name. Used in the header, footer and secondary pages.
 */
export default function Wordmark({ tone = "dark", className = "" }: { tone?: "dark" | "light"; className?: string }) {
  const onDark = tone === "dark";
  return (
    <span className={`inline-flex items-center gap-3 ${className}`} aria-label="Nova Covenant International Trading">
      <Image
        src="/brand/nc-logo.png"
        alt=""
        aria-hidden
        width={489}
        height={512}
        sizes="48px"
        loading="eager"
        className="h-10 w-auto shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] lg:h-11"
      />
      <span aria-hidden className="inline-flex flex-col leading-none">
        <span className={`font-display text-[1.0625rem] font-semibold tracking-[0.2em] ${onDark ? "text-white" : "text-navy-900"}`}>
          NOVA COVENANT
        </span>
        <span className={`mt-1.5 text-[0.5625rem] font-medium tracking-[0.42em] ${onDark ? "text-white/55" : "text-steel"}`}>
          INTERNATIONAL TRADING
        </span>
      </span>
    </span>
  );
}
