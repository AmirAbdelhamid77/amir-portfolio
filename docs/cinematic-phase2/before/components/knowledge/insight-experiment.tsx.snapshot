"use client";
// The interactive half of the Daily Insight. Every verdict is computed from
// lib/knowledge/models.ts, which only restates the edition's reviewed fields —
// no new domain claim is authored here.

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  deriveVerdict,
  type ExperimentId,
  type ExperimentState,
} from "@/lib/knowledge/models";
import { STAGE_LABEL } from "@/lib/knowledge/motion";
import { cn } from "@/lib/utils";

type Props = {
  id: ExperimentId;
  state: ExperimentState;
  onChange: (patch: Partial<ExperimentState>) => void;
};

export function InsightExperiment({ id, state, onChange }: Props) {
  const verdict = deriveVerdict(id, state);
  const reduce = useReducedMotion() ?? false;

  return (
    <div className="mt-6 rounded-[20px] border border-border-strong bg-background/70 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Try the decision
        </p>
        <span className="rounded-full border border-border-strong px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Reasoning model
        </span>
      </div>

      <div className="mt-4">
        <ExperimentFigure id={id} state={state} tone={verdict.tone} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] sm:items-start">
        <div>
          {id === "retention" ? (
            <Choice
              legend="What does the second team need?"
              name="retention-need"
              options={[
                { value: "no", label: "Read the existing table", checked: !state.retained, onChange: () => onChange({ retained: false }) },
                { value: "yes", label: "Its own retained result", checked: state.retained, onChange: () => onChange({ retained: true }) },
              ]}
            />
          ) : null}

          {id === "deletion" ? (
            <Choice
              legend="Which action are you taking?"
              name="deletion-action"
              options={[
                { value: "shortcut", label: "Remove the shortcut object", checked: state.action === "remove-shortcut", onChange: () => onChange({ action: "remove-shortcut" }) },
                { value: "through", label: "Delete a file through it", checked: state.action === "delete-through", onChange: () => onChange({ action: "delete-through" }) },
              ]}
            />
          ) : null}

          {id === "discovery" ? (
            <div className="space-y-4">
              <Choice
                legend="Where is the shortcut created?"
                name="discovery-location"
                options={[
                  { value: "tables", label: "Under Tables", checked: state.location === "tables", onChange: () => onChange({ location: "tables" }) },
                  { value: "files", label: "Under Files", checked: state.location === "files", onChange: () => onChange({ location: "files" }) },
                ]}
              />
              <Choice
                legend="What does it point at?"
                name="discovery-data"
                options={[
                  { value: "delta", label: "A Delta table", checked: state.data === "delta", onChange: () => onChange({ data: "delta" }) },
                  { value: "files", label: "Arbitrary files", checked: state.data === "files", onChange: () => onChange({ data: "files" }) },
                ]}
              />
            </div>
          ) : null}
        </div>

        <div aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={verdict.headline}
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={reduce ? { duration: 0.1 } : STAGE_LABEL}
            >
              <p className="text-sm font-medium tracking-tight">
                {verdict.headline}
              </p>
              <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                {verdict.detail}
              </p>
              <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                {verdict.rows.map((row) => (
                  <div key={row.label} className="flex items-baseline gap-1.5">
                    <dt className="text-muted-foreground/70">{row.label}</dt>
                    <dd className="text-foreground/80">{row.state}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <p className="mt-4 border-t border-border pt-3 text-[11px] leading-5 text-muted-foreground">
        A reasoning model for this scenario, not company data. It changes as you
        change the assumption.
      </p>
    </div>
  );
}

function Choice({
  legend,
  name,
  options,
}: {
  legend: string;
  name: string;
  options: {
    value: string;
    label: string;
    checked: boolean;
    onChange: () => void;
  }[];
}) {
  return (
    <fieldset>
      <legend className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {legend}
      </legend>
      <div className="mt-2 flex flex-col gap-1.5">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "group flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border px-3 text-[13px] transition-colors",
              "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary",
              option.checked
                ? "border-primary/45 bg-primary/10 text-foreground"
                : "border-border-strong bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.checked}
              onChange={option.onChange}
              className="size-3.5 shrink-0 accent-[var(--primary)]"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/* ---------------------------------------------------------------------------
   Figures. Each drawing is derived from the same state as the verdict, so the
   picture cannot disagree with the words. aria-hidden: the verdict text beside
   it is the accessible version.
--------------------------------------------------------------------------- */

function ExperimentFigure({
  id,
  state,
  tone,
}: {
  id: ExperimentId;
  state: ExperimentState;
  tone: "plain" | "caution" | "positive";
}) {
  return (
    <div
      aria-hidden="true"
      className="mx-auto h-[118px] w-full max-w-[560px]"
    >
      {id === "retention" ? <RetentionFigure retained={state.retained} /> : null}
      {id === "deletion" ? (
        <DeletionFigure action={state.action} tone={tone} />
      ) : null}
      {id === "discovery" ? <DiscoveryFigure state={state} tone={tone} /> : null}
    </div>
  );
}

function Node({
  x,
  y,
  width,
  height,
  label,
  sub,
  tone = "plain",
  dashed = false,
  flag,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  sub?: string;
  tone?: "plain" | "active" | "muted" | "danger";
  dashed?: boolean;
  flag?: string;
}) {
  const stroke =
    tone === "active"
      ? "var(--primary)"
      : tone === "danger"
        ? "var(--danger)"
        : "currentColor";
  return (
    <g opacity={tone === "muted" ? 0.45 : 1}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={9}
        fill="var(--card)"
        stroke={stroke}
        strokeOpacity={tone === "plain" || tone === "muted" ? 0.3 : 0.8}
        strokeDasharray={dashed ? "4 4" : undefined}
      />
      <text
        x={x + 12}
        y={y + 20}
        fontSize="12"
        fill="var(--foreground)"
        fillOpacity={tone === "muted" ? 0.6 : 0.95}
        fontWeight="500"
      >
        {label}
      </text>
      {sub ? (
        <text x={x + 12} y={y + 34} fontSize="10" fill="var(--muted-foreground)">
          {sub}
        </text>
      ) : null}
      {flag ? (
        <g>
          <rect
            x={x + width - 22}
            y={y + 9}
            width={13}
            height={13}
            rx={6.5}
            fill="var(--danger)"
            fillOpacity="0.18"
            stroke="var(--danger)"
            strokeOpacity="0.7"
          />
          <path
            d={`M${x + width - 18.5} ${y + 12.5} L${x + width - 12.5} ${y + 18.5} M${x + width - 12.5} ${y + 12.5} L${x + width - 18.5} ${y + 18.5}`}
            stroke="var(--danger)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </g>
      ) : null}
    </g>
  );
}

function ArrowDefs() {
  return (
    <defs>
      <marker
        id="stage-arrow"
        viewBox="0 0 8 8"
        refX="7"
        refY="4"
        markerWidth="6"
        markerHeight="6"
        orient="auto"
      >
        <path d="M0 0 8 4 0 8z" fill="currentColor" fillOpacity="0.45" />
      </marker>
    </defs>
  );
}

function RetentionFigure({ retained }: { retained: boolean }) {
  return (
    <svg viewBox="0 0 520 120" className="size-full text-foreground" role="presentation">
      <ArrowDefs />
      <Node x={6} y={12} width={122} height={40} label="Team A" sub="read access" />
      <Node x={6} y={64} width={122} height={40} label="Team B" sub="read access" />
      <path d="M132 32 H170" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" markerEnd="url(#stage-arrow)" />
      <path d="M132 84 H170" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" markerEnd="url(#stage-arrow)" />
      <text x={151} y={62} fontSize="10" fill="var(--muted-foreground)" textAnchor="middle">
        {retained ? "copy" : "reference"}
      </text>
      <Node x={172} y={38} width={138} height={40} label="Existing table" sub="source of truth" tone="active" />
      <path d="M314 58 H372" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" markerEnd="url(#stage-arrow)" />
      <Node
        x={374}
        y={36}
        width={140}
        height={44}
        label={retained ? "New snapshot" : "No copy"}
        sub={retained ? "kept in step" : "reference only"}
        tone={retained ? "danger" : "muted"}
        dashed={!retained}
      />
    </svg>
  );
}

function DeletionFigure({
  action,
  tone,
}: {
  action: ExperimentState["action"];
  tone: "plain" | "caution" | "positive";
}) {
  const removing = action === "remove-shortcut";
  return (
    <svg viewBox="0 0 520 120" className="size-full text-foreground" role="presentation">
      <ArrowDefs />
      <Node
        x={20}
        y={28}
        width={168}
        height={46}
        label="Shortcut object"
        sub="the reference"
        tone={removing ? "danger" : "active"}
        flag={removing ? "removed" : undefined}
      />
      <path d="M192 51 H288" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" markerEnd="url(#stage-arrow)" />
      <text x={240} y={42} fontSize="10" fill="var(--muted-foreground)" textAnchor="middle">
        points at
      </text>
      <Node
        x={292}
        y={28}
        width={208}
        height={46}
        label="Target data"
        sub={removing ? "unchanged" : "write permission decides"}
        tone={removing ? "plain" : "danger"}
        flag={removing ? undefined : "at risk"}
      />
      <text x={260} y={104} fontSize="11" fill="var(--muted-foreground)" textAnchor="middle">
        {removing
          ? "The reference goes; the target is left intact."
          : tone === "caution"
            ? "Deletion can reach through to the target."
            : ""}
      </text>
    </svg>
  );
}

function DiscoveryFigure({
  state,
  tone,
}: {
  state: ExperimentState;
  tone: "plain" | "caution" | "positive";
}) {
  const discovered = tone === "positive";
  const inTables = state.location === "tables";
  return (
    <svg viewBox="0 0 520 120" className="size-full text-foreground" role="presentation">
      <ArrowDefs />
      <rect x={6} y={6} width={508} height={108} rx={12} fill="none" stroke="currentColor" strokeOpacity="0.22" strokeDasharray="4 5" />
      <text x={18} y={22} fontSize="9.5" fill="var(--muted-foreground)" letterSpacing="0.12em">
        LAKEHOUSE
      </text>
      <Node x={18} y={30} width={196} height={44} label="Files" sub="file browsing" tone={inTables ? "muted" : "active"} />
      <Node x={238} y={30} width={196} height={44} label="Tables" sub="table discovery" tone={inTables ? "active" : "muted"} />
      <g transform={inTables ? "translate(300,80)" : "translate(80,80)"}>
        <rect width={72} height={24} rx={6} fill="var(--card)" stroke="var(--primary)" strokeOpacity="0.6" />
        <text x={36} y={16} fontSize="10" fill="var(--foreground)" textAnchor="middle">
          shortcut
        </text>
      </g>
      <text x={448} y={98} fontSize="10" fill={discovered ? "var(--primary)" : "var(--muted-foreground)"} textAnchor="end">
        {discovered ? "table can surface" : "no table appears"}
      </text>
    </svg>
  );
}
