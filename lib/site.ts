export const site = {
  name: "Nova Covenant International Trading",
  shortName: "Nova Covenant",
  email: "mahi@novacovenanttrading.com",
  /** WhatsApp business contact. `number` is digits only with country code (for wa.me links). */
  whatsapp: { display: "+91 73395 91214", number: "917339591214" },
  url: "https://novacovenanttrading.com",
  description:
    "Nova Covenant International Trading is a multi-country trading, sourcing and distribution partner for importers, dealers, distributors and commercial buyers — serving Automotive & Mobility and Food & Agriculture.",
  tagline: "Bridging Nations. Building Trust.",
  secondaryTagline: "Trade Beyond Borders.",
  vision: "Build a globally recognized, trustworthy and profitable international trading company.",
};

export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Divisions", href: "#divisions" },
  { label: "Process", href: "#process" },
  { label: "Founder", href: "#founder" },
  { label: "Contact", href: "#contact" },
] as const;

export const divisionOptions = [
  "Automotive & Mobility",
  "Food & Agriculture",
  "General Trading Enquiry",
] as const;

export type DivisionOption = (typeof divisionOptions)[number];

/** Lets any "Enquire" link pre-select the division in the enquiry form. */
export const SELECT_DIVISION_EVENT = "nc:select-division";
