"use client";
// Adapted from BeUI's Card Dealer — https://beui.dev/components/blocks/card-dealer,
// registry source https://beui.dev/r/card-dealer.json (retrieved 2026-10-26).
//
// Kept: stable card ids, deck/hand/pile zones, measured stage, arc flight with
// spring settling, stagger, 3D face/back flip, depth-ordered z-index, hover and
// focus lift, neighbour push, reduced-motion path, keyboard buttons.
// Changed: the stage is a knowledge tray rather than a full table; the reader
// opens below the hand instead of a discard pile; a whole-card overlay button
// holds only the accessible name, never nested links. See
// docs/prototype-c/v2/COMPONENT_MAPPING.md.

import { AnimatePresence, arc, motion, type AnimationPlaybackControls, type Transition, useAnimate, useReducedMotion } from "motion/react";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { X } from "lucide-react";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { STAGE_FLIGHT, STAGE_HOP, STAGE_INSPECT } from "@/lib/knowledge/motion";
import type { CardKind } from "@/lib/knowledge/models";
import { cn } from "@/lib/utils";

export type DealerZone = "deck" | "hand" | "pile";

export type DealerCard = {
  id: string;
  zone: DealerZone;
  kind: CardKind;
  eyebrow: string;
  title: string;
  preview: string;
  label: string;
};

const FLIGHT_STRENGTH = -0.35;
const HOP_STRENGTH = -0.3;
const STAGGER = 0.05;
const MAX_STAGGER_WINDOW = 0.18;
const EDGE = 12;
const HOVER_LIFT = 16;
const HOVER_PUSH = 12;
const MAX_FAN_ANGLE = 9;
const MAX_FAN_DROP = 16;

type Pose = { x: number; y: number; rotate: number; faceDown: boolean; z: number };

function pileTilt(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return ((Math.abs(hash) % 11) - 5) * 0.8;
}

export function KnowledgeDealer({
  cards,
  activeId,
  reader,
  onSelect,
  onDeal,
  onCollect,
  onCloseReader,
  status,
  className,
}: {
  cards: DealerCard[];
  activeId: string | null;
  reader: ReactNode;
  onSelect: (id: string) => void;
  onDeal: () => void;
  onCollect: () => void;
  onCloseReader: () => void;
  status: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const stageRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const dealRef = useRef<HTMLButtonElement>(null);
  const cardRefs = useRef(new Map<string, HTMLButtonElement>());
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const closingRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      setSize({ width: stage.clientWidth, height: stage.clientHeight });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const deck = cards.filter((card) => card.zone === "deck");
  const hand = cards.filter((card) => card.zone === "hand");
  const pile = cards.filter((card) => card.zone === "pile");

  // Opening the reader is a distinct interactive region: focus moves to it so a
  // keyboard user is not left behind the hand. Closing returns focus to the
  // card that was taken out.
  useEffect(() => {
    if (activeId) {
      closingRef.current = activeId;
      const frame = requestAnimationFrame(() => {
        readerRef.current?.focus({ preventScroll: false });
      });
      return () => cancelAnimationFrame(frame);
    }
    const closing = closingRef.current;
    closingRef.current = null;
    if (closing) cardRefs.current.get(closing)?.focus({ preventScroll: true });
  }, [activeId]);

  const deckWidth = Math.min(size?.width ?? 360, 420);
  const cardWidth = clamp(deckWidth * 0.36, 100, 150);
  const cardHeight = Math.round(cardWidth * 1.32);
  const deckPoseY = clamp((size?.height ?? 300) / 2 - cardHeight / 2 - 14, EDGE, 300);
  // A fan, not a stack: each card keeps a wide enough exposed strip to be a
  // comfortable touch target, which 40% spacing did not.
  const spread = cardWidth * 0.58;

  const poseFor = (card: DealerCard, slot: number): Pose => {
    const width = size?.width ?? deckWidth;
    const height = size?.height ?? 300;
    if (card.zone === "deck") {
      const depth = Math.min(slot, 5);
      return {
        x: EDGE + 4 + depth * 1.4,
        y: clamp(height / 2 - cardHeight / 2 - 16, EDGE, height) + depth * 1.2,
        rotate: depth * 0.5,
        faceDown: true,
        z: 60 - slot,
      };
    }
    if (card.zone === "pile") {
      return {
        x: width - cardWidth - EDGE,
        y: EDGE,
        rotate: pileTilt(card.id),
        faceDown: false,
        z: 400 + slot,
      };
    }
    const count = Math.max(hand.length, 1);
    const offset = slot - (count - 1) / 2;
    const edge = Math.max((count - 1) / 2, 1);
    const reach = offset / edge;
    const tilt = Math.min(6 * edge, MAX_FAN_ANGLE);
    const drop = Math.min(3 * edge * edge, MAX_FAN_DROP);
    const room = width - cardWidth - EDGE * 2;
    const step = count > 1 ? Math.min(spread, room / (count - 1)) : 0;
    const lifted = hovered ?? activeId;
    const liftedSlot = lifted ? hand.findIndex((item) => item.id === lifted) : -1;
    const push =
      liftedSlot < 0 || slot === liftedSlot
        ? 0
        : Math.sign(slot - liftedSlot) * HOVER_PUSH;
    return {
      x: width / 2 - cardWidth / 2 + offset * step + push,
      y: height - cardHeight - EDGE - (slot === liftedSlot ? HOVER_LIFT : 0),
      // The selected card settles upright; its neighbours keep the fan tilt.
      rotate: slot === liftedSlot ? 0 : reach * tilt + reach * drop / 12,
      faceDown: false,
      z: slot === liftedSlot ? 300 : 100 + slot,
    };
  };

  const renderCard = (card: DealerCard, slot: number) => {
    const pose = poseFor(card, slot);
    const interactive = card.zone === "hand";
    return (
      <CardFrame
        key={card.id}
        pose={pose}
        slot={slot}
        reduce={reduce}
        width={cardWidth}
        height={cardHeight}
      >
        <div className="size-full [perspective:900px]">
          <motion.span
            aria-hidden="true"
            className="relative block size-full [transform-style:preserve-3d]"
            initial={false}
            animate={{ rotateY: pose.faceDown ? 180 : 0 }}
            transition={reduce ? { duration: 0 } : STAGE_FLIGHT}
          >
            <span className="absolute inset-0 overflow-hidden rounded-[18px] [backface-visibility:hidden]">
              <CardFace card={card} compact={cardWidth < 128} />
            </span>
            <span className="absolute inset-0 overflow-hidden rounded-[18px] [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <CardBack />
            </span>
          </motion.span>
        </div>
        {interactive ? (
          <button
            ref={(node) => {
              if (node) cardRefs.current.set(card.id, node);
              else cardRefs.current.delete(card.id);
            }}
            type="button"
            aria-label={card.label}
            aria-expanded={activeId === card.id}
            onClick={() => onSelect(card.id)}
            onPointerEnter={(event) => {
              if (canHover && event.pointerType === "mouse") setHovered(card.id);
            }}
            onPointerLeave={() =>
              setHovered((id) => (id === card.id ? null : id))
            }
            onFocus={() => setHovered(card.id)}
            onBlur={() => setHovered((id) => (id === card.id ? null : id))}
            className="absolute inset-0 cursor-pointer rounded-[18px] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
        ) : null}
      </CardFrame>
    );
  };

  const handEmpty = hand.length === 0;
  const deckEmpty = deck.length === 0;

  return (
    <section aria-labelledby="dealer-title" className={cn("relative", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            02 / Deal an idea
          </p>
          <h2
            id="dealer-title"
            className="mt-2 text-lg font-medium tracking-tight"
          >
            The hand behind the claim
          </h2>
        </div>
        <span className="rounded-full border border-border-strong px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground tabular-nums">
          {hand.length} / {cards.length} dealt
        </span>
      </div>

      <div
        ref={stageRef}
        role="group"
        aria-label="Knowledge card tray"
        className="relative mt-3 h-[264px] w-full touch-manipulation select-none sm:h-[300px]"
      >
        {/* The empty landing area stays visible so the deck reads as a deck,
            not as the only card. */}
        <div
          aria-hidden="true"
          className="absolute bottom-3 right-3 top-16 rounded-[22px] border border-dashed border-border-strong/70"
          style={{ left: cardWidth + 40 }}
        />
        {!deckEmpty ? (
          <p
            aria-hidden="true"
            className="absolute text-center font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground/70"
            style={{ left: EDGE + 4, top: deckPoseY + cardHeight + 6, width: cardWidth }}
          >
            deck · {deck.length}
          </p>
        ) : null}
        <p
          aria-hidden="true"
          className="absolute inset-x-0 bottom-6 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60"
        >
          {handEmpty ? "hand — empty" : "inspect a card to read it"}
        </p>
        {size
          ? [deck, hand, pile].flatMap((zone) =>
              zone.map((card, slot) => renderCard(card, slot)),
            )
          : null}
        {!deckEmpty ? (
          <button
            type="button"
            onClick={onDeal}
            aria-label="Deal from the deck"
            className="absolute rounded-[18px] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            style={{
              left: EDGE + 4,
              top: deckPoseY,
              width: cardWidth,
              height: cardHeight,
            }}
          />
        ) : null}
        {deckEmpty && handEmpty ? (
          <p className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-muted-foreground">
            All available ideas are dealt. Collect the hand to start again.
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          ref={dealRef}
          type="button"
          onClick={onDeal}
          disabled={deckEmpty}
          className={cn(
            "inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-medium transition-colors",
            "bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            "disabled:pointer-events-none disabled:opacity-40",
          )}
        >
          {deck.length > 0
            ? hand.length > 0
              ? `Deal ${deck.length} more`
              : "Deal three ideas"
            : "Deck empty"}
        </button>
        <button
          type="button"
          onClick={() => {
            onCloseReader();
            onCollect();
            requestAnimationFrame(() => dealRef.current?.focus({ preventScroll: true }));
          }}
          disabled={handEmpty}
          className="inline-flex min-h-11 items-center rounded-full border border-border-strong px-4 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40"
        >
          Collect all
        </button>
        <p role="status" aria-live="polite" className="text-xs text-muted-foreground">
          {status}
        </p>
      </div>

      <AnimatePresence initial={false} mode="wait">
        {activeId ? (
          <motion.div
            key={activeId}
            ref={readerRef}
            tabIndex={-1}
            role="region"
            aria-label="Selected card"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.99 }}
            transition={reduce ? { duration: 0.1 } : STAGE_INSPECT}
            onKeyDown={(event: ReactKeyboardEvent) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                onCloseReader();
              }
            }}
            className="mt-4 rounded-[22px] border border-border-strong bg-background/90 p-4 outline-none shadow-[0_1px_0_0_rgb(255_255_255/0.05)_inset,0_18px_40px_-30px_rgb(0_0_0/0.7)] focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                Reading the card
              </p>
              <button
                type="button"
                onClick={onCloseReader}
                aria-label="Back to the hand"
                className="-m-2 grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            {reader}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function CardFrame({
  pose,
  slot,
  reduce,
  width,
  height,
  children,
}: {
  pose: Pose;
  slot: number;
  reduce: boolean | null;
  width: number;
  height: number;
  children: ReactNode;
}) {
  const [frame, animateFrame] = useAnimate<HTMLDivElement>();
  const running = useRef<AnimationPlaybackControls | null>(null);
  const placed = useRef(false);

  // Imperative so a new move cancels the last one: a declarative arc keeps
  // running when its target changes and would write a stale end point back.
  //
  // Travel is read from the distance the card actually has to cover, not from
  // a diff of zones. A card crossing the tray arcs and staggers; a card lifting
  // under the pointer hops. That keeps the effect depending on the pose alone,
  // so a re-render never restarts a move already under way.
  useLayoutEffect(() => {
    const element = frame.current;
    if (!element) return;
    running.current?.stop();

    if (!placed.current) {
      placed.current = true;
      animateFrame(
        element,
        { x: pose.x, y: pose.y, rotate: pose.rotate },
        { duration: 0 },
      );
      return;
    }

    if (reduce) {
      animateFrame(
        element,
        { x: pose.x, y: pose.y, rotate: pose.rotate },
        { duration: 0.1 },
      );
      return;
    }

    const matrix = new DOMMatrixReadOnly(
      element.style.transform && element.style.transform !== "none"
        ? element.style.transform
        : "",
    );
    const travel = Math.hypot(pose.x - matrix.m41, pose.y - matrix.m42) > 56;
    const transition: Transition = travel
      ? {
          ...STAGE_FLIGHT,
          delay: Math.min(slot * STAGGER, MAX_STAGGER_WINDOW),
          path: arc({ strength: FLIGHT_STRENGTH }),
        }
      : { ...STAGE_HOP, path: arc({ strength: HOP_STRENGTH }) };
    running.current = animateFrame(
      element,
      { x: pose.x, y: pose.y, rotate: pose.rotate },
      transition,
    );
  }, [animateFrame, frame, pose.rotate, pose.x, pose.y, reduce, slot]);

  useLayoutEffect(() => () => running.current?.stop(), []);

  return (
    <div
      ref={frame}
      className="absolute left-0 top-0"
      style={{ width, height, zIndex: pose.z }}
    >
      {children}
    </div>
  );
}

function CardFace({ card, compact }: { card: DealerCard; compact: boolean }) {
  const accent =
    card.kind === "principle"
      ? "text-primary"
      : card.kind === "caveat"
        ? "text-warning"
        : "text-muted-foreground";
  const rule =
    card.kind === "principle"
      ? "bg-primary/70"
      : card.kind === "caveat"
        ? "bg-warning/70"
        : "bg-border-strong";
  return (
    <span className="flex size-full flex-col justify-between rounded-[18px] border border-foreground/15 bg-card p-3 shadow-[0_1px_0_0_rgb(255_255_255/0.08)_inset,0_10px_22px_-18px_rgb(0_0_0/0.8)]">
      <span>
        <span aria-hidden="true" className={cn("mb-2 block h-0.5 w-6 rounded-full", rule)} />
        <span className={cn("block font-mono text-[9px] uppercase tracking-[0.14em]", accent)}>
          {card.eyebrow}
        </span>
        <span className="mt-1.5 block text-[12px] font-medium leading-[1.25] tracking-tight text-foreground">
          {card.title}
        </span>
      </span>
      {!compact ? (
        <span className="mt-2 line-clamp-3 text-[10px] leading-[1.4] text-muted-foreground">
          {card.preview}
        </span>
      ) : null}
      <span aria-hidden="true" className="mt-2 block h-px w-full bg-border-strong" />
    </span>
  );
}

function CardBack() {
  return (
    <span className="relative flex size-full flex-col justify-between overflow-hidden rounded-[18px] border border-border-strong bg-[linear-gradient(145deg,color-mix(in_oklch,var(--primary)_16%,var(--card)),var(--card))] p-2.5">
      <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-primary/80">
        Hansa
      </span>
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/30"
      />
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25"
      />
      <span className="font-mono text-[7px] uppercase tracking-[0.14em] text-muted-foreground">
        Knowledge
      </span>
    </span>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
