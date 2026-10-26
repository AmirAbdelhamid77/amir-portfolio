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

/**
 * Five primary destinations instead of eight peers.
 *
 * The old list mixed three different jobs — evaluate professional work, learn a
 * concept, practise a skill — and put two levels of a hierarchy (`/learn` and
 * `/learn/statistics`) side by side. `Learn` and `Practice` now point at
 * catalogues that hold the sub-destinations; `Experience` becomes part of the
 * About family rather than a peer of `Work`.
 */
export const NAV = [
  { href: "/work", label: "Work", description: "Case studies and evidence" },
  { href: "/learn/catalogue", label: "Learn", description: "Courses, references, labs" },
  { href: "/practice/catalogue", label: "Practice", description: "Question banks and drills" },
  { href: "/services", label: "Services", description: "Dashboards, cleanup, training" },
  { href: "/about", label: "About", description: "Background, experience, contact" },
] as const;

/**
 * Which route prefixes should light up a primary nav item.
 *
 * `pathname.startsWith(href)` is not enough once a nav label points at a
 * catalogue: a reader inside `/learn/chapter/04/` is still in Learn. Existing
 * URLs keep their meaning; only the highlight is computed from the family.
 */
export const NAV_SECTIONS: Record<string, readonly string[]> = {
  "/work": ["/work"],
  // `/explore/` is the visualization lab gallery: part of the learning material.
  "/learn/catalogue": ["/learn", "/explore"],
  // `/lab/` holds the question banks: part of practice, not of learning.
  "/practice/catalogue": ["/practice", "/lab"],
  "/services": ["/services"],
  "/about": ["/about", "/experience"],
};

/** Secondary destinations that stay one tap away without becoming top-level peers. */
export const SECONDARY_NAV = [
  { href: "/experience", label: "Experience & skills" },
  { href: "/contact", label: "Contact" },
] as const;

export const FOOTER_LINKS = [
  {
    heading: "Work",
    links: [
      { href: "/work", label: "Case studies" },
      { href: "/work/hse-analytics", label: "HSE analytics case" },
      { href: "/services", label: "Services" },
      { href: "/experience", label: "Experience & skills" },
      { href: "/about", label: "About" },
    ],
  },
  {
    heading: "Learn",
    links: [
      { href: "/learn/catalogue", label: "Learning catalogue" },
      { href: "/search", label: "Search the site" },
      { href: "/learn", label: "Data Visualization course" },
      { href: "/learn/statistics", label: "Statistics reference" },
      { href: "/explore/charts", label: "Six chart labs" },
      { href: "/explore/choose", label: "Chart decision assistant" },
      { href: "/learn/ar", label: "المسار العربي" },
    ],
  },
  {
    heading: "Practice",
    links: [
      { href: "/practice/catalogue", label: "Practice catalogue" },
      { href: "/lab", label: "Analyst bank (60)" },
      { href: "/lab/dp-600", label: "Fabric DP-600 (834)" },
      { href: "/lab/dp-600/progress", label: "Progress & saved sessions" },
      { href: "/practice", label: "Visualization scenarios" },
    ],
  },
] as const;
