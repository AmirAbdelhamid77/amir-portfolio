import type { Metadata } from "next";
import { TopicDesk } from "@/components/study/topic-desk";
import { SUBJECTS, subjectById } from "@/lib/study/taxonomy";

// Alias of `/learn/<subject>/<topic>`. Old links, saved progress and query
// parameters keep working; the canonical page is the one under `/learn`.
export const dynamicParams = false;

export function generateStaticParams() {
  return SUBJECTS.flatMap((subject) =>
    subject.topics.map(([topic]) => ({ subject: subject.id, topic })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subject: string; topic: string }>;
}): Promise<Metadata> {
  const { subject, topic } = await params;
  const entry = subjectById(subject)!;
  const title = entry.topics.find(([id]) => id === topic)![1];
  return {
    title: `${title} — ${entry.title}`,
    alternates: { canonical: `/learn/${subject}/${topic}/` },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ subject: string; topic: string }>;
}) {
  const { subject, topic } = await params;
  return <TopicDesk subject={subject} topic={topic} />;
}
