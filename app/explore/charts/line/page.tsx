import type { Metadata } from "next";
import { getChartLab } from "@/lib/data-viz/labs";
import { ChartLabShell } from "@/components/data-viz/chart-lab-shell";
import { LineLab } from "@/components/data-viz/labs/line-lab";

const LAB = getChartLab("line")!;

export const metadata: Metadata = {
  title: `${LAB.title} lab`,
  description: LAB.summary.slice(0, 175),
  alternates: { canonical: "/explore/charts/line" },
  openGraph: {
    title: `${LAB.title} lab — Data Visualization`,
    description: LAB.summary.slice(0, 175),
    url: "/explore/charts/line",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "${LAB.title} lab" }],
  },
};

export default function Page() {
  return (
    <ChartLabShell lab={LAB}>
      <LineLab />
    </ChartLabShell>
  );
}
