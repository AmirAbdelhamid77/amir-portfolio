// Canonical origin for metadata, the sitemap and robots.txt. Set
// NEXT_PUBLIC_SITE_URL at build time when the site moves to a custom domain;
// otherwise it falls back to the Cloudflare Workers URL.
const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://hansa.amir-portfolio.workers.dev"
).replace(/\/+$/, "");

export const SITE = {
  url: siteUrl,
  name: "Amir Abdelhamid",
  role: "Data Analyst",
  title: "Amir Abdelhamid — Data Analyst & BI Developer",
  description:
    "Data analyst building decision-ready dashboards with Power BI, SQL, Python, and Excel. Case studies, services, and a free Data Lab for practice exams.",
  shortDescription:
    "Power BI, SQL, Python, and Excel — turned into dashboards people actually use.",
  email: "amirabdalhamid227@gmail.com",
  location: "Egypt · working remotely",
  availability: "Available for full-time roles and freelance work",
  socials: {
    github: "https://github.com/AmirAbdelhamid77",
    linkedin: "https://linkedin.com/in/amir-abdelhamid-55093a19a",
  },
  // Set NEXT_PUBLIC_CONTACT_ENDPOINT (e.g. a Formspree URL) at build time to
  // enable in-page delivery. Without it the form composes an email instead.
  contactEndpoint: process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ?? "",
} as const;

export const NAV = [
  { href: "/work", label: "Work" },
  { href: "/experience", label: "Experience" },
  { href: "/services", label: "Services" },
  { href: "/lab", label: "Data Lab" },
  { href: "/about", label: "About" },
] as const;

export const FOOTER_LINKS = [
  {
    heading: "Explore",
    links: [
      { href: "/work", label: "Case studies" },
      { href: "/lab", label: "Data Lab" },
      { href: "/services", label: "Services" },
      { href: "/experience", label: "Experience" },
    ],
  },
  {
    heading: "More",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/work/hse-analytics", label: "HSE case study" },
      { href: "/lab/sql", label: "SQL practice" },
    ],
  },
] as const;
