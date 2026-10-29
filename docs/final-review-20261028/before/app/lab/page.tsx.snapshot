import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Boxes,
  Clock,
  ListChecks,
  ShieldCheck,
  Target,
} from "lucide-react";
import { EXAM_SUMMARIES } from "@/lib/exams";
import { ExamCatalog } from "@/components/lab/exam-catalog";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Data Lab",
  description:
    "Free data-analyst practice exams for SQL, Power BI/DAX, Excel, Python/Pandas, statistics, and analytics fundamentals — plus a separate 834-question Microsoft Fabric DP-600 lab. Practice or timed mock mode, with explanations.",
  alternates: { canonical: "/lab" },
  openGraph: {
    title: "Data Lab — free data-analyst practice exams",
    description:
      "60 questions across six topics. Practice mode explains every answer; mock mode runs the clock.",
    url: "/lab",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Amir Abdelhamid — Data Lab" }],
  },
};

const HOW = [
  {
    icon: ListChecks,
    title: "Practice mode",
    body: "Check one question at a time. The explanation appears immediately, before you move on.",
  },
  {
    icon: Clock,
    title: "Mock exam",
    body: "A countdown, flagging, and a navigator. Feedback is withheld until you submit.",
  },
  {
    icon: Target,
    title: "Review",
    body: "See a topic breakdown, retry only the questions you missed, and print the review.",
  },
];

export default function LabPage() {
  const questionCount = EXAM_SUMMARIES.reduce(
    (sum, exam) => sum + exam.questionCount,
    0,
  );

  return (
    <>
      <section className="relative border-b border-border">
        <div aria-hidden="true" className="grid-noise mask-b-fade absolute inset-0 opacity-50" />
        <div
          aria-hidden="true"
          className="absolute -top-40 right-1/4 h-80 w-80 rounded-full opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in oklch, var(--violet) 20%, transparent), transparent 70%)",
          }}
        />
        <Container className="relative py-16 md:py-20">
          <Eyebrow dot>Free · no account · saved in your browser</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight md:text-5xl">
            The Data Lab.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Practice the reasoning behind the tool. Every question explains the
            answer — including why the plausible wrong option is wrong.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">
            {[
              { value: String(EXAM_SUMMARIES.length), label: "exam sets" },
              { value: String(questionCount), label: "questions" },
              { value: "6", label: "topics" },
              { value: "100%", label: "free" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card/70 p-4">
                <p className="font-mono text-2xl font-medium tracking-tight">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <div className="grid gap-4 sm:grid-cols-3">
            {HOW.map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-card/40 p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h2 className="mt-3 text-sm font-medium">{item.title}</h2>
                <p className="mt-1.5 text-xs leading-6 text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <ExamCatalog exams={EXAM_SUMMARIES} />
          </div>

          <Link
            href="/lab/dp-600"
            className="group mt-6 flex flex-col gap-4 rounded-3xl border border-primary/25 bg-primary/[0.04] p-5 transition-colors hover:border-primary/45 sm:flex-row sm:items-center sm:justify-between sm:p-6"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Boxes className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                  Microsoft Fabric · DP-600
                </p>
                <h2 className="mt-1 text-base font-medium tracking-tight">
                  834 Fabric questions, 18 source packs, one hub
                </h2>
                <p className="mt-1.5 max-w-xl text-xs leading-6 text-muted-foreground">
                  Guided study, topic practice, case studies and a custom timed simulation — with
                  option-level rationales, source-video timestamps and an honest coverage report
                  against the official DP-600 objectives.
                </p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border-strong bg-background px-4 py-2 text-xs text-foreground">
              Open the hub
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </Link>

          <div className="mt-6 grid gap-4 rounded-3xl border border-border bg-card/40 p-6 sm:grid-cols-[1.4fr_1fr] md:p-8">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success" aria-hidden="true" />
                <h2 className="text-sm font-medium">How the scoring works</h2>
              </div>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                Each exam has 10 questions and a 70% pass mark. Multi-select
                questions require every correct option and no incorrect ones.
                Numeric answers accept a small tolerance where relevant.
                Results and personal bests are stored in <code className="rounded bg-background px-1 py-0.5 font-mono text-[10px]">localStorage</code> on this
                device — nothing is sent anywhere.
              </p>
            </div>
            <div className="flex flex-col justify-center gap-2 rounded-2xl border border-border bg-background/60 p-4">
              <p className="text-xs text-muted-foreground">
                Want a structured study plan instead of random practice?
              </p>
              <ButtonLink href="/services#training" size="sm" variant="secondary">
                <BookOpenCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Training & exam prep
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
