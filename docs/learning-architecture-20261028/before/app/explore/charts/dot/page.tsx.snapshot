import type { Metadata } from "next";
import { getChartLab } from "@/lib/data-viz/labs";
import { ChartLabShell } from "@/components/data-viz/chart-lab-shell";
import { DotLab } from "@/components/data-viz/labs/dot-lab";

const LAB = getChartLab("dot")!;

export const metadata: Metadata = {
  title: `${LAB.title} lab`,
  description: LAB.summary.slice(0, 175),
  alternates: { canonical: "/explore/charts/dot" },
  openGraph: {
    title: `${LAB.title} lab — Data Visualization`,
    description: LAB.summary.slice(0, 175),
    url: "/explore/charts/dot",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "${LAB.title} lab" }],
  },
};

export default function Page() {
  return (
    <ChartLabShell lab={LAB}>
      <DotLab />
    </ChartLabShell>
  );
}
