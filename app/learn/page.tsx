import type { Metadata } from "next";
import { CurriculumHome } from "@/components/learn/curriculum-home";

export const metadata: Metadata = {
  title: "Learn — one path through the subjects",
  description:
    "Data visualization, statistics, SQL, Microsoft Fabric, Power BI, analytical foundations, Python and Excel in one ordered curriculum: foundation, applied, advanced and reference.",
  alternates: { canonical: "/learn/" },
  openGraph: {
    title: "Learn — one path through the subjects",
    description:
      "Eight subjects, one order: understand the foundation, apply it, then handle the advanced case.",
    url: "/learn/",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Learn: one path through the subjects" }],
  },
};

export default function Page() {
  return <CurriculumHome />;
}
