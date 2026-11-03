import type { Metadata } from "next";
import { LearningPathPage } from "@/components/study/learning-path-page";
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
  const title = SUBJECTS.find((entry) => entry.id === subject)!.title;
  return {
    title: `${title} — learning sequence`,
    alternates: { canonical: `/learn/${subject}/path/` },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = await params;
  return <LearningPathPage subject={subject} />;
}
