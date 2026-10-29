import type { Metadata } from "next";
import { HansaKnowledgeLanding } from "@/components/knowledge/hansa-landing";
import { SITE } from "@/lib/site";

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
      <HansaKnowledgeLanding />
    </>
  );
}
