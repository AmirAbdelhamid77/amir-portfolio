import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, ListChecks, Target } from "lucide-react";
import { EXAMS, TOPIC_META, getExam } from "@/lib/exams";
import { ExamPlayer } from "@/components/lab/exam-player";
import { Container, Eyebrow } from "@/components/ui";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return EXAMS.map((exam) => ({ slug: exam.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const exam = getExam(slug);
  if (!exam) return { title: "Exam not found" };

  return {
    title: exam.title,
    description: exam.description,
    alternates: { canonical: `/lab/${exam.slug}` },
    openGraph: {
      title: `${exam.title} — Data Lab`,
      description: exam.description,
      url: `/lab/${exam.slug}`,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: `${exam.title} — Data Lab` }],
    },
  };
}

export default async function ExamPage({ params }: Params) {
  const { slug } = await params;
  const exam = getExam(slug);
  if (!exam) notFound();

  const meta = TOPIC_META[exam.topic];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: exam.title,
    description: exam.description,
    educationalLevel: exam.level,
    learningResourceType: "Practice exam",
    teaches: exam.topic,
    numberOfQuestions: exam.questions.length,
    isAccessibleForFree: true,
    author: { "@type": "Person", name: SITE.name, url: SITE.url },
    url: `${SITE.url}/lab/${exam.slug}/`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="border-b border-border">
        <Container className="pb-8 pt-20 md:pb-10 md:pt-24">
          <Link
            href="/lab"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Data Lab
          </Link>

          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em]",
                    meta?.ring ?? "bg-card",
                  )}
                >
                  {exam.topic}
                </span>
                <Eyebrow>{exam.level}</Eyebrow>
              </div>
              <h1 className="mt-3 text-3xl font-medium tracking-tight md:text-4xl">
                {exam.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                {exam.description}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border bg-border text-xs">
              <div className="bg-card/80 px-4 py-3">
                <p className="flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  <ListChecks className="h-3 w-3" aria-hidden="true" />
                  Questions
                </p>
                <p className="mt-1 font-mono text-base">{exam.questions.length}</p>
              </div>
              <div className="bg-card/80 px-4 py-3">
                <p className="flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  Minutes
                </p>
                <p className="mt-1 font-mono text-base">{exam.durationMinutes}</p>
              </div>
              <div className="bg-card/80 px-4 py-3">
                <p className="flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  <Target className="h-3 w-3" aria-hidden="true" />
                  Pass
                </p>
                <p className="mt-1 font-mono text-base">{exam.passMark}%</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-8 md:py-12">
        <Container>
          <ExamPlayer exam={exam} />

          <div className="mt-10 rounded-2xl border border-border bg-card/30 p-5 text-xs leading-6 text-muted-foreground">
            <p className="font-medium text-foreground">A note on the questions</p>
            <p className="mt-1.5">
              These are original practice questions written to reflect how the
              tools behave, not leaked exam content, and they are not affiliated
              with Microsoft, IBM, or any certification body. If an explanation
              seems wrong, tell me —{" "}
              <a
                href={`mailto:${SITE.email}?subject=${encodeURIComponent(`Data Lab feedback: ${exam.title}`)}`}
                className="text-foreground underline decoration-border-strong underline-offset-4"
              >
                email the correction
              </a>{" "}
              and I will fix it.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
