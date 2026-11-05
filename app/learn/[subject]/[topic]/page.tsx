import type { Metadata } from "next";
import { TopicDesk } from "@/components/study/topic-desk";
import { ReadingCollections } from "@/components/fabric/reading/ReadingCollections";
import { TOPIC_GOALS } from "@/lib/study/briefs";
import { SUBJECTS, subjectById, topicHref } from "@/lib/study/taxonomy";

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
    description: TOPIC_GOALS[`${subject}.${topic}`] ?? entry.goal,
    alternates: { canonical: topicHref(subject, topic) },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ subject: string; topic: string }>;
}) {
  const { subject, topic } = await params;
  // FC06 reading collections: self-guarding — renders only for Fabric subject
  // topics with bound articles and returns null otherwise. Data is fs-loaded
  // at build time; no client JS.
  return (
    <>
      <TopicDesk subject={subject} topic={topic} />
      <ReadingCollections subject={subject} topic={topic} />
    </>
  );
}
