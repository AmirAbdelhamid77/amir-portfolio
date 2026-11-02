// The about strip of the canonical landing. Two variants, same verified facts
// from lib/site.ts — nothing here is invented:
//
//   compact (landing default) — a one-line identity strip in the footer
//     context, after the gates.
//   full — the standing presentation for any page that wants the whole
//     positioning block (kept reusable; the landing does not render it).
//
// Both render plain text when motion is reduced or JavaScript is off.

import { Reveal } from "@/components/cinematic/reveal";
import { SITE } from "@/lib/site";

export function StageAbout({ variant = "compact" }: { variant?: "compact" | "full" }) {
  if (variant === "full") {
    return (
      <section aria-labelledby="stage-about-title" className="stage-about py-16">
        <div className="mx-auto w-full max-w-[1320px] px-5 md:px-8">
          <Reveal pattern="mask">
            <p className="stage-kicker">The practice</p>
            <h2 id="stage-about-title" className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
              Amir Abdelhamid
            </h2>
          </Reveal>

          <Reveal pattern="rise" order={1} className="mt-5 max-w-[56ch]">
            <p className="text-lg leading-8">
              is a data analyst and BI developer turning messy operational data
              into modelled, decision-ready systems — Power BI, SQL, Python and
              Excel, built to be audited rather than admired.
            </p>
            <p className="mt-3 text-lg leading-8 text-muted-foreground">
              The same rigor runs the teaching side of this site: every claim
              carries its source, every dashboard states its limits, and the
              Data Lab turns exam practice into actual understanding.
            </p>
          </Reveal>

          <Reveal pattern="rise" order={2}>
            <p className="stage-status mt-6">
              <span>{SITE.availability}</span>
              <span>{SITE.location}</span>
            </p>
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 md:px-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 py-8">
        <p className="text-sm leading-7">
          <span className="font-semibold">{SITE.name}</span>
          <span className="text-muted-foreground">
            {" "}
            is a data analyst and BI developer building decision-ready
            dashboards — and teaching the craft with every claim sourced.
          </span>
        </p>
        <p className="stage-status">
          <span>{SITE.availability}</span>
          <span>{SITE.location}</span>
        </p>
      </div>
    </div>
  );
}
