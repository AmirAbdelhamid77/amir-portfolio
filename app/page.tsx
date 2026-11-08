import type { Metadata } from "next";
import Link from "next/link";
import { HansaKnowledgeLanding } from "@/components/knowledge/hansa-landing";
import { TimelineHome } from "@/components/hansa/timeline-home";
import { getDays, newestDayOnOrBeforeToday } from "@/lib/knowledge/day-ledger";
import insightsContent from "@/content/knowledge/insights.json";
import type { Insight } from "@/lib/knowledge/insights";
import { SITE } from "@/lib/site";

// Redesign plan §4: the redesigned timeline Home ships dark behind HOME_V2.
// Unset (or any value but "1") keeps the accepted R3–R6 Home as the default.
const HOME_V2 = process.env.NEXT_PUBLIC_HOME_V2 === "1";

// The build-time day ledger for the timeline Home. The feed is fail-closed;
// getDays throws on duplicates, >3 insights per day, or a missing source.
// `true` matches the accepted Home's eligibility exactly (technical-review
// editions included, each carrying its status marker).
const DAYS = getDays(insightsContent.items as Insight[], true);

// The root IS the Hansa learning landing. The previous root — a directory of
// Atlas/Learn/Practice gateways with a portfolio framing — was retired with the
// canonical-home migration, and its links now live in the shared navigation,
// the landing's own continuation row and the footer. See
// `docs/canonical-home/FILE_OWNERSHIP.md` for the link-by-link ledger.
//
// `title.absolute` deliberately bypasses the layout's `%s — <author>` template:
// the homepage introduces the product (Hansa) while the author stays credited in
// `authors`/`creator` on the layout and on About/Work.

const TITLE = "Hansa — interactive data learning and knowledge";
const DESCRIPTION =
  "One data decision to think through, dated editions on a timeline, knowledge cards that change the lens, and an Atlas that states its own review status. The visualization course, the statistics reference and the question banks sit one step away.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  keywords: [
    "data learning",
    "data visualization course",
    "statistics reference",
    "Power BI",
    "SQL",
    "Microsoft Fabric",
    "question bank",
  ],
  openGraph: {
    type: "website",
    url: `${SITE.url}/`,
    siteName: "Hansa",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Hansa — a daily data decision, knowledge cards and a dated editions timeline",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Hansa",
    alternateName: SITE.name,
    url: SITE.url,
    description:
      "Source-backed learning, documented concept connections and independent data practice.",
    author: { "@type": "Person", name: SITE.name, url: SITE.url },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {HOME_V2 ? (
        <TimelineHome days={DAYS} defaultDay={newestDayOnOrBeforeToday(DAYS) ?? DAYS[DAYS.length - 1]?.date} />
      ) : (
        <HansaKnowledgeLanding />
      )}
      {/* Server-rendered day list (plan §12): every day is reachable as a link
          in the HTML, independent of the timeline's JavaScript. */}
      {HOME_V2 ? (
        <nav aria-label="All days" className="sr-only">
          <ul>
            {DAYS.map((day) => (
              <li key={day.date}>
                <Link href={`/day/${day.date}/`}>
                  {day.date} — {day.insights.length}{" "}
                  {day.insights.length === 1 ? "insight" : "insights"}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </>
  );
}
