import type { Metadata } from "next";
import { SubjectHome } from "@/components/learn/subject-home";
import { VisualizationHome } from "@/components/learn/visualization-home";
import { requireSubject } from "@/lib/curriculum/model";
import { SUBJECTS } from "@/lib/study/taxonomy";

export const dynamicParams = false;

export function generateStaticParams() {
  return SUBJECTS.map((subject) => ({ subject: subject.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subject: string }>;
}): Promise<Metadata> {
  const { subject } = await params;
  const home = requireSubject(subject);
  return {
    title:
      subject === "visualization"
        ? "Data Visualization — from question to decision"
        : `${home.title} — learning path`,
    description: home.goal,
    alternates: { canonical: `/learn/${subject}/` },
  };
}

/**
 * Alias of `/learn/<subject>`. Topic desks, links and saved progress keep
 * working; the canonical page is the subject home under `/learn`.
 *
 * Visualization has a full course home of its own, so the alias renders that
 * same component instead of the generic subject layout.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = await params;
  const home = requireSubject(subject);
  return subject === "visualization" ? (
    <VisualizationHome />
  ) : (
    <SubjectHome subject={home} />
  );
}
