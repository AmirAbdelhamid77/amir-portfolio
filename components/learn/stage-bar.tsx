import type { Stage } from "@/lib/study/topic-review";
import { STAGE_ORDER } from "@/lib/curriculum/model";

const FILL: Record<Stage, string> = {
  Foundation: "var(--chart-2)",
  Applied: "var(--chart-1)",
  Advanced: "var(--chart-4)",
  Reference: "var(--muted-foreground)",
};

export const STAGE_LABEL: Record<Stage, string> = {
  Foundation: "Foundation",
  Applied: "Applied",
  Advanced: "Advanced",
  Reference: "Reference",
};

/**
 * The shape of a subject: how much of it is foundation, application, advanced
 * work or look-up material. The bar is decorative; the sentence below it carries
 * the same counts for screen readers and for anyone who cannot see the colour
 * difference.
 */
export function StageBar({
  counts,
  className,
}: {
  counts: Readonly<Record<Stage, number>>;
  className?: string;
}) {
  const total = STAGE_ORDER.reduce((sum, stage) => sum + counts[stage], 0);
  const parts = STAGE_ORDER.filter((stage) => counts[stage] > 0);
  const summary =
    total === 0
      ? "No units yet"
      : parts.map((stage) => `${counts[stage]} ${STAGE_LABEL[stage].toLowerCase()}`).join(" · ");

  return (
    <div className={className}>
      <div
        className="flex h-1.5 w-full overflow-hidden rounded-full bg-border"
        aria-hidden="true"
      >
        {total > 0
          ? parts.map((stage) => (
              <span
                key={stage}
                style={{
                  width: `${(counts[stage] / total) * 100}%`,
                  background: FILL[stage],
                }}
              />
            ))
          : null}
      </div>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {summary}
      </p>
    </div>
  );
}
