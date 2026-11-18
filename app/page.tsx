import type { Metadata } from "next";
import { HansaKnowledgeLanding } from "@/components/knowledge/hansa-landing";
import { TimelineHome } from "@/components/hansa/timeline-home";
import { EDITORIAL_DAYS, LIVE_DECKS } from "@/lib/knowledge/editorial-feed";
import { EXAM_SUMMARIES } from "@/lib/exams";
import { SITE } from "@/lib/site";

// Redesign plan §4/§15: the beUI Timeline Home is the release default as of
// the final consolidation (owner authorization, 2026-11-08). The escape hatch
// is explicit and build-time: HOME_V2=0 restores the accepted R3–R6 Home for
// one release; it also stays reachable at /archive/.
const HOME_V2 = process.env.NEXT_PUBLIC_HOME_V2 !== "0";

// The root IS the Hansa learning landing. The previous root — a directory of
// Atlas/Learn/Practice gateways with a portfolio framing — was retired with the
// canonical-home migration, and its links now live in the shared navigation,
// the landing's own continuation row and the footer. See
// `docs/canonical-home/FILE_OWNERSHIP.md` for the link-by-link ledger.
//
// `title.absolute` deliberately bypasses the layout's `%s - <brand>` template:
// the homepage names the product itself. The author stays credited in
// `authors`/`creator` on the layout, in JSON-LD and on About/Work.

const TITLE = SITE.brandTitle;
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
        <TimelineHome
          archive={EDITORIAL_DAYS}
          decks={LIVE_DECKS}
          exams={EXAM_SUMMARIES.map(({ slug, title }) => ({ slug, title }))}
        />
      ) : (
        <HansaKnowledgeLanding />
      )}
    </>
  );
}
