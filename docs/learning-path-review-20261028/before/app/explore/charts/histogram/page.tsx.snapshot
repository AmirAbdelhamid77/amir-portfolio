import type { Metadata } from "next";
import { getChartLab } from "@/lib/data-viz/labs";
import { ChartLabShell } from "@/components/data-viz/chart-lab-shell";
import { HistogramLab } from "@/components/data-viz/labs/histogram-lab";

const LAB = getChartLab("histogram")!;

export const metadata: Metadata = {
  title: `${LAB.title} lab`,
  description: LAB.summary.slice(0, 175),
  alternates: { canonical: "/explore/charts/histogram" },
  openGraph: {
    title: `${LAB.title} lab — Data Visualization`,
    description: LAB.summary.slice(0, 175),
    url: "/explore/charts/histogram",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "${LAB.title} lab" }],
  },
};

export default function Page() {
  return (
    <ChartLabShell lab={LAB}>
      <HistogramLab />
    </ChartLabShell>
  );
}
