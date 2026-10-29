"use client";

import { useState } from "react";
import { Contrast, Eye, TriangleAlert } from "lucide-react";
import { ToggleChip } from "@/components/data-viz/lab-ui";
import { Controls, ResetButton, VerdictPill } from "./kit";

type Semantics = "qualitative" | "sequential" | "diverging";
type Family = Semantics;

const FAMILIES: Record<Family, { label: string; colors: string[]; use: string }> = {
  qualitative: {
    label: "Qualitative",
    colors: ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"],
    use: "Unordered categories. Colour separates; it must not imply rank.",
  },
  sequential: {
    label: "Sequential",
    colors: ["#d7ecf7", "#a8d3ea", "#6fb2d8", "#3488bd", "#0b5b8a"],
    use: "Low to high on one direction. Lightness carries the order.",
  },
  diverging: {
    label: "Diverging",
    colors: ["#b2182b", "#ef8a62", "#f7f7f7", "#67a9cf", "#2166ac"],
    use: "Deviation around a meaningful midpoint, such as zero or target.",
  },
};

const SEMANTICS: {
  id: Semantics;
  label: string;
  correct: Family;
  wrong: Family;
  values: string[];
  prompt: string;
  wrongNote: string;
}[] = [
  {
    id: "qualitative",
    label: "Unordered categories",
    correct: "qualitative",
    wrong: "sequential",
    values: ["Organic", "Paid", "Direct", "Email", "Referral"],
    prompt: "Five channels with no order and no midpoint.",
    wrongNote:
      "A sequential ramp invents a ranking: the reader assumes dark means more, but “more” is undefined.",
  },
  {
    id: "sequential",
    label: "Ordered magnitude",
    correct: "sequential",
    wrong: "diverging",
    values: ["0–20", "20–40", "40–60", "60–80", "80–100"],
    prompt: "Satisfaction bands from low to high.",
    wrongNote:
      "A diverging scale puts a neutral midpoint at 40–60. There is no meaningful centre here, so the midpoint is false.",
  },
  {
    id: "diverging",
    label: "Deviation around a target",
    correct: "diverging",
    wrong: "qualitative",
    values: ["−10", "−5", "0", "+5", "+10"],
    prompt: "Variance to target, in percentage points.",
    wrongNote:
      "A qualitative palette drops the sign and the midpoint: +10 and −10 become two arbitrary colours.",
  },
];

export function PaletteFigure() {
  const [semantics, setSemantics] = useState<Semantics>("qualitative");
  const [showWrong, setShowWrong] = useState(false);
  const [grayscale, setGrayscale] = useState(false);

  const current = SEMANTICS.find((item) => item.id === semantics) ?? SEMANTICS[0];
  const activeKey = showWrong ? current.wrong : current.correct;
  const family = FAMILIES[activeKey];
  const right = !showWrong;

  return (
    <div className="space-y-3">
      <Controls>
        <div role="group" aria-label="Variable semantics" className="flex flex-wrap gap-1">
          {SEMANTICS.map((item) => (
            <ToggleChip
              key={item.id}
              pressed={semantics === item.id}
              onClick={() => {
                setSemantics(item.id);
                setShowWrong(false);
              }}
            >
              {item.label}
            </ToggleChip>
          ))}
        </div>
        <ToggleChip pressed={showWrong} onClick={() => setShowWrong(!showWrong)}>
          <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
          Wrong family
        </ToggleChip>
        <ToggleChip pressed={grayscale} onClick={() => setGrayscale(!grayscale)}>
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          Grayscale
        </ToggleChip>
        <ResetButton
          onClick={() => {
            setSemantics("qualitative");
            setShowWrong(false);
            setGrayscale(false);
          }}
          disabled={semantics === "qualitative" && !showWrong && !grayscale}
        />
      </Controls>

      <div className="rounded-2xl border border-border bg-background p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-foreground">{current.prompt}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {family.label} palette · {showWrong ? "deliberately wrong" : "matches the variable"}
            </p>
          </div>
          <VerdictPill tone={right ? "good" : "bad"}>
            {right ? "Match" : "Mismatch"}
          </VerdictPill>
        </div>

        <div
          className="mt-4 grid grid-cols-5 gap-1.5"
          style={grayscale ? { filter: "grayscale(1)" } : undefined}
        >
          {family.colors.map((color, index) => (
            <div key={`${family.label}-${index}`} className="min-w-0">
              <div
                className="h-16 rounded-lg border border-border"
                style={{ backgroundColor: color }}
              />
              <p className="mt-1.5 truncate text-center font-mono text-[10px] text-muted-foreground">
                {current.values[index]}
              </p>
            </div>
          ))}
        </div>

        <p aria-live="polite" className="mt-4 text-xs leading-6 text-muted-foreground">
          <strong className="font-medium text-foreground">{family.label}:</strong> {family.use}{" "}
          {showWrong ? current.wrongNote : ""}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {(Object.keys(FAMILIES) as Family[]).map((key) => {
          const item = FAMILIES[key];
          const active = key === activeKey;
          return (
            <div
              key={key}
              className={
                "rounded-2xl border p-3 " +
                (active ? "border-foreground/30 bg-card/60" : "border-border bg-background")
              }
            >
              <p className="flex items-center justify-between gap-2 text-xs font-medium text-foreground">
                {item.label}
                {active ? <Contrast className="h-3.5 w-3.5" aria-hidden="true" /> : null}
              </p>
              <div className="mt-2 flex h-4 overflow-hidden rounded-full">
                {item.colors.map((color, index) => (
                  <span
                    key={index}
                    className="h-full flex-1"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="mt-2 text-[11px] leading-5 text-muted-foreground">{item.use}</p>
            </div>
          );
        })}
      </div>

      <p className="rounded-xl border border-border bg-card/40 p-3 text-[11px] leading-6 text-muted-foreground">
        <strong className="font-medium text-foreground">Why grayscale matters:</strong> a
        sequential ramp must keep its order without hue; a qualitative set only has to
        stay distinguishable. If the grayscale preview turns a sequential scale into
        five similar greys, the ramp is too weak. The qualitative swatches use the
        Okabe–Ito palette, chosen for common colour-vision deficiencies.
      </p>
    </div>
  );
}
