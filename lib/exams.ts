import { z } from "zod";
import sqlBank from "@/content/exams/sql.json";
import powerBiBank from "@/content/exams/power-bi.json";
import excelBank from "@/content/exams/excel.json";
import pythonBank from "@/content/exams/python.json";
import statisticsBank from "@/content/exams/statistics.json";
import fundamentalsBank from "@/content/exams/fundamentals.json";

export const EXAM_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type ExamLevel = (typeof EXAM_LEVELS)[number];

const base = {
  id: z.string().min(1),
  topic: z.string().min(1),
  prompt: z.string().min(1),
  explanation: z.string().min(1),
};

const singleSchema = z.object({
  ...base,
  type: z.literal("single"),
  options: z.array(z.string().min(1)).min(2),
  answer: z.number().int().min(0),
});

const multiSchema = z.object({
  ...base,
  type: z.literal("multi"),
  options: z.array(z.string().min(1)).min(2),
  answer: z.array(z.number().int().min(0)).min(2),
});

const booleanSchema = z.object({
  ...base,
  type: z.literal("boolean"),
  answer: z.boolean(),
});

const numericSchema = z.object({
  ...base,
  type: z.literal("numeric"),
  answer: z.number(),
  tolerance: z.number().min(0).optional(),
  unit: z.string().optional(),
});

const questionSchema = z.discriminatedUnion("type", [
  singleSchema,
  multiSchema,
  booleanSchema,
  numericSchema,
]);

const examSchema = z
  .object({
    slug: z.string().min(1),
    title: z.string().min(1),
    topic: z.string().min(1),
    level: z.enum(EXAM_LEVELS),
    description: z.string().min(1),
    durationMinutes: z.number().int().min(1),
    passMark: z.number().min(1).max(100),
    questions: z.array(questionSchema).min(1),
  })
  .superRefine((exam, ctx) => {
    const ids = new Set<string>();
    for (const question of exam.questions) {
      if (ids.has(question.id)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate question id "${question.id}" in ${exam.slug}`,
        });
      }
      ids.add(question.id);

      if (
        (question.type === "single" || question.type === "multi") &&
        question.answer !== undefined
      ) {
        const answers = Array.isArray(question.answer)
          ? question.answer
          : [question.answer];
        for (const index of answers) {
          if (index >= question.options.length) {
            ctx.addIssue({
              code: "custom",
              message: `Answer index ${index} is out of range in ${question.id}`,
            });
          }
        }
      }
    }
  });

export type Question = z.infer<typeof questionSchema>;
export type Exam = z.infer<typeof examSchema>;

const RAW_BANKS = [
  sqlBank,
  powerBiBank,
  excelBank,
  pythonBank,
  statisticsBank,
  fundamentalsBank,
];

export const EXAMS: Exam[] = RAW_BANKS.map((bank) => examSchema.parse(bank));

export const EXAM_SUMMARIES = EXAMS.map((exam) => ({
  slug: exam.slug,
  title: exam.title,
  topic: exam.topic,
  level: exam.level,
  description: exam.description,
  durationMinutes: exam.durationMinutes,
  passMark: exam.passMark,
  questionCount: exam.questions.length,
}));

export type ExamSummary = (typeof EXAM_SUMMARIES)[number];

export function getExam(slug: string) {
  return EXAMS.find((exam) => exam.slug === slug);
}

export const TOPIC_META: Record<
  string,
  { label: string; short: string; color: string; ring: string; icon: string }
> = {
  SQL: {
    label: "SQL",
    short: "SQL",
    color: "text-primary",
    ring: "bg-primary/10 text-primary",
    icon: "database",
  },
  "Power BI": {
    label: "Power BI & DAX",
    short: "Power BI",
    color: "text-warning",
    ring: "bg-warning/15 text-foreground",
    icon: "chart",
  },
  Excel: {
    label: "Excel",
    short: "Excel",
    color: "text-success",
    ring: "bg-success/15 text-foreground",
    icon: "table",
  },
  Python: {
    label: "Python & Pandas",
    short: "Python",
    color: "text-violet",
    ring: "bg-violet/15 text-foreground",
    icon: "code",
  },
  Statistics: {
    label: "Statistics",
    short: "Stats",
    color: "text-accent",
    ring: "bg-accent/20 text-foreground",
    icon: "sigma",
  },
  Fundamentals: {
    label: "Fundamentals",
    short: "Fundamentals",
    color: "text-rose-500",
    ring: "bg-rose-500/10 text-foreground",
    icon: "layers",
  },
};
