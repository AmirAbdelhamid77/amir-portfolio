"use client";

import { useState } from "react";
import { Check, GripVertical } from "lucide-react";
import {
  SortableList,
  SortableListGroup,
  SortableListItem,
  SortableListItemContent,
  SortableListHandle,
  SortableListUndo,
} from "@/components/motion/sortable-stack";
import { ENCODING_CHANNELS } from "@/lib/data-viz/figure-data";
import { Insight, ToggleChip } from "@/components/data-viz/lab-ui";
import { Controls, ResetButton, VerdictPill } from "./kit";
import { cn } from "@/lib/utils";

interface Channel {
  id: string;
  label: string;
  rank: number;
  why: string;
}

// A deterministic starting order that is not the answer: the learner has to
// reason, not accept the first arrangement. (The source ranking is always
// available in text below the exercise.)
const START_ORDER = ["length", "position", "colour", "unaligned", "angle"];

function startingItems(): Channel[] {
  return START_ORDER.flatMap((id) => {
    const item = ENCODING_CHANNELS.find((channel) => channel.id === id);
    return item ? [item] : [];
  });
}

export function EncodingFigure() {
  const [items, setItems] = useState<Channel[]>(startingItems);
  const [checked, setChecked] = useState(false);

  const correct = items.filter((item, index) => item.rank === index + 1).length;
  const exact = correct === items.length;

  return (
    <div className="space-y-3">
      <Controls>
        <ToggleChip pressed={checked} onClick={() => setChecked(true)}>
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          Check ranking
        </ToggleChip>
        <ResetButton
          onClick={() => {
            setItems(startingItems());
            setChecked(false);
          }}
          disabled={!checked && items.every((item, index) => item.id === START_ORDER[index])}
        />
        <span className="text-[11px] text-muted-foreground">
          Drag the handle, or focus it and press ↑ / ↓. Most accurate at the top.
        </span>
      </Controls>

      <SortableList
        items={items}
        onItemsChange={(next) => {
          setItems(next);
          setChecked(false);
        }}
        getItemLabel={(item) => item.label}
        label="Rank the encoding channels from most to least accurate"
        showUndo={false}
      >
        <SortableListGroup>
          {items.map((item, index) => {
            const state = checked
              ? item.rank === index + 1
                ? "correct"
                : "wrong"
              : "idle";
            return (
              <SortableListItem
                key={item.id}
                id={item.id}
                className={cn(
                  "bg-card/50",
                  state === "correct" && "border-emerald-500/40 bg-emerald-500/[0.05]",
                  state === "wrong" && "border-rose-500/35 bg-rose-500/[0.04]",
                )}
              >
                <SortableListHandle aria-label={`Reorder ${item.label}`}>
                  <GripVertical size={18} aria-hidden="true" />
                </SortableListHandle>
                <SortableListItemContent>
                  <p className="flex flex-wrap items-baseline gap-2 text-sm text-foreground">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {index + 1}
                    </span>
                    {item.label}
                    {checked ? (
                      <span className="font-mono text-[10px] text-muted-foreground">
                        source rank {item.rank}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{item.why}</p>
                </SortableListItemContent>
              </SortableListItem>
            );
          })}
        </SortableListGroup>
        <SortableListUndo>Undo last move</SortableListUndo>
      </SortableList>

      <div aria-live="polite">
        {checked ? (
          exact ? (
            <p className="flex flex-wrap items-center gap-2 text-xs text-foreground">
              <VerdictPill tone="good">Exact</VerdictPill>
              All five channels are in the source order. Position on a common scale is
              the strongest channel; colour and size are secondary.
            </p>
          ) : (
            <p className="flex flex-wrap items-center gap-2 text-xs text-foreground">
              <VerdictPill tone="warn">
                {correct} of {items.length} in place
              </VerdictPill>
              Green rows are in the source position. Keep the rationale in view: a
              swapped pair usually means two channels were judged by familiarity rather
              than accuracy.
            </p>
          )
        ) : (
          <p className="text-[11px] leading-5 text-muted-foreground">
            Predict first: which channel gives the smallest reading error? Then check.
          </p>
        )}
      </div>

      <Insight>
        This is a ranking claim from the source figure, not a measurement produced by
        the page. The experiment behind it is Cleveland &amp; McGill&apos;s graphical
        perception work; the exercise tests whether you can apply the order, not
        whether the page can re-run the study.
      </Insight>

      <details className="rounded-2xl border border-border bg-card/30 p-3">
        <summary className="cursor-pointer text-xs font-medium text-foreground">
          Text fallback: the source ranking
        </summary>
        <ol className="mt-3 space-y-2 text-[11px] leading-5 text-muted-foreground">
          {[...ENCODING_CHANNELS]
            .sort((a, b) => a.rank - b.rank)
            .map((item) => (
              <li key={item.id}>
                <span className="font-medium text-foreground">
                  {item.rank}. {item.label}
                </span>{" "}
                — {item.why}
              </li>
            ))}
        </ol>
      </details>
    </div>
  );
}
