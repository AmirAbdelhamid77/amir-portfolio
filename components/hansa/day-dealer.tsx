"use client";

// Level 2 — the Day layer's card dealer (redesign plan §10). The official
// beUI Card Dealer supplies the table; this wrapper maps the day's 1–3
// insights onto it and deals them from the deck into the hand on mount, so
// the entry is the dealer's own arc animation. Activating a hand card
// navigates to the insight detail — the card is the button.

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CardDealer, type CardDealerCard } from "@/components/motion/card-dealer";
import type { DayLedgerDay } from "@/lib/knowledge/day-ledger";
import { reviewStatusLabel } from "@/lib/knowledge/review-status";

type DealerInsight = CardDealerCard & {
  topic: string;
  title: string;
  hook: string;
  status: string | null;
  language?: string;
};

export function DayDealer({ day, live = false }: { day: DayLedgerDay; live?: boolean }) {
  const router = useRouter();
  // Deal on mount: the cards start in the deck and cross to the hand, which
  // is the dealer's signature animation. No randomness: the dealt order is
  // the bank's order.
  const [dealt, setDealt] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setDealt(true), 250);
    return () => window.clearTimeout(id);
  }, []);

  const cards: DealerInsight[] = day.insights.map((insight) => {
    // The hook is derived from the existing takeaway's first sentence — never
    // written fresh (plan §6). Keep terminal punctuation that is already there
    // instead of producing "pipeline.." on the card.
    const firstSentence = insight.takeaway.split(". ")[0].trim();
    const hook = /[.!?؟]$/.test(firstSentence) ? firstSentence : `${firstSentence}.`;
    return {
      id: insight.id,
      zone: dealt ? "hand" : "deck",
      label: `${insight.topic}: ${insight.cardTitle}`,
      topic: insight.topic,
      title: insight.cardTitle,
      hook,
      status: reviewStatusLabel(insight.reviewStatus),
      language: insight.language,
    };
  });

  return (
    <CardDealer
      cards={cards}
      cardWidth={230}
      cardHeight={330}
      spread={54}
      angle={6}
      aria-label={`Insights for ${day.date}`}
      onCardSelect={(id) => router.push(live
        ? `/day/live/?date=${day.date}&insight=${encodeURIComponent(id)}`
        : `/day/${day.date}/${id}/`)}
      renderFace={(card) => {
        const c = card as DealerInsight;
        const rtl = c.language === "ar";
        return (
          <div
            dir={rtl ? "rtl" : "ltr"}
            lang={c.language}
            className="flex h-full w-full flex-col gap-2 rounded-2xl border border-border bg-card p-3.5 text-start"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {c.topic}
            </span>
            <span className="text-balance text-[15px] font-medium leading-snug tracking-tight">
              {c.title}
            </span>
            <span className="mt-auto text-[12px] leading-5 text-muted-foreground">{c.hook}</span>
            {c.status ? (
              <span className="inline-flex w-fit items-center gap-1 text-[10px] text-muted-foreground">
                <span
                  aria-hidden="true"
                  className={`size-1.5 rounded-full ${
                    c.status.startsWith("Draft") ? "bg-warning" : "bg-primary/60"
                  }`}
                />
                {c.status}
              </span>
            ) : null}
          </div>
        );
      }}
    />
  );
}
