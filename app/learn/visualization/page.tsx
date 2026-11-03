import type { Metadata } from "next";
import { VisualizationHome } from "@/components/learn/visualization-home";

// The visualization subject has its own full course home rather than the generic
// subject layout. `/study/visualization` renders the same component.
export const metadata: Metadata = {
  title: "Data Visualization — from question to decision",
  description:
    "A ten-chapter data-visualization learning path: the six core charts, colour and accessibility, statistical traps, chart selection, dashboards, Power BI, and interview practice — with interactive labs.",
  alternates: { canonical: "/learn/visualization/" },
  openGraph: {
    title: "Data Visualization — from question to decision",
    description:
      "Ten chapters, interactive chart labs, an integrity lab, and a deterministic chart decision assistant.",
    url: "/learn/visualization/",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Data Visualization learning path" }],
  },
};

export default function Page() {
  return <VisualizationHome />;
}
