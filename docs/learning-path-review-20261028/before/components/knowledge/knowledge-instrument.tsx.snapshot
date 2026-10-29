"use client";

import { motion, useReducedMotion } from "motion/react";
import { memo } from "react";
import { deriveVerdict, INITIAL_EXPERIMENT, type ExperimentId, type ExperimentState } from "@/lib/knowledge/models";

/** A categorical conceptual instrument, never a quantitative chart or Atlas graph.
 * Geometry and words read the SAME model as the scenario below. Decorative
 * aperture rings carry no data. The DOM readout is the accessible equivalent. */
export const KnowledgeInstrument = memo(function KnowledgeInstrument({ id, state, onChange }: {
  id: ExperimentId | null;
  state: ExperimentState;
  onChange: (patch: Partial<ExperimentState>) => void;
}) {
  const reduce = useReducedMotion();
  if (!id) return null;
  const verdict = deriveVerdict(id, state);
  const changed = id === "retention" ? state.retained : id === "deletion" ? state.action === "delete-through" : state.location === "files";
  const toggle = () => onChange(id === "retention" ? { retained: !state.retained } : id === "deletion" ? { action: state.action === "remove-shortcut" ? "delete-through" : "remove-shortcut" } : { location: state.location === "tables" ? "files" : "tables" });
  const sourceLabel = id === "deletion" ? "Target data" : id === "discovery" ? (state.data === "delta" ? "Delta table" : "Arbitrary files") : "Existing Delta table";
  const topLabel = id === "retention" ? (changed ? "Retained result required" : "Reference · no new copy") : id === "deletion" ? (changed ? "Delete through shortcut" : "Remove shortcut object") : (state.location === "tables" ? "Tables placement" : "Files placement");
  return (
    <div className="observatory-instrument" data-tone={verdict.tone}>
      <div className="instrument-coordinate" aria-hidden="true"><span>FIG. 01</span><span>DECISION / OPTICS</span></div>
      <motion.div className="instrument-assembly" initial={reduce ? false : { y: 20, rotate: -5 }} animate={{ y: 0, rotate: 0 }} transition={{type:"spring", stiffness:75, damping:20}}>
        <svg viewBox="0 0 560 440" aria-hidden="true" className="instrument-svg">
          <defs>
            <linearGradient id="instrument-slab" x1="0" y1="0" x2="1" y2="1"><stop stopColor="var(--obs-slab-light)"/><stop offset="1" stopColor="var(--obs-slab)"/></linearGradient>
            <linearGradient id="instrument-edge"><stop stopColor="var(--primary)"/><stop offset="1" stopColor="var(--accent)"/></linearGradient>
          </defs>
          {/* An optical aperture, not invented semantic connections. */}
          <g fill="none" stroke="currentColor" className="instrument-aperture">
            <circle cx="280" cy="210" r="185" strokeOpacity=".14"/>
            <circle cx="280" cy="210" r="173" strokeOpacity=".1" strokeDasharray="1 9"/>
            <path d="M95 210a185 185 0 0 1 185-185" stroke="var(--primary)" strokeWidth="2"/>
            <path d="M280 395a185 185 0 0 0 185-185" strokeOpacity=".3"/>
            <path d="M75 210h24m362 0h24M280 4v25m0 362v25" strokeOpacity=".4"/>
          </g>
          <ellipse cx="286" cy="335" rx="157" ry="29" fill="var(--foreground)" opacity=".06"/>
          {/* Solid side faces and several visible strata make volume legible at rest. */}
          {[36,24,12,0].map((offset,i)=>(
            <g key={offset} transform={`translate(0 ${offset})`}>
              <path d="M125 223 280 145 435 223v13L280 314 125 236Z" fill="var(--obs-slab)" stroke="var(--obs-edge)"/>
              <path d="M125 223 280 145 435 223 280 301Z" fill="url(#instrument-slab)" stroke="var(--obs-edge)"/>
              {i===3?<><path d="M151 223 280 158 409 223 280 288Z" fill="none" stroke="var(--primary)" strokeOpacity=".45"/><path d="M180 222 280 172 380 222 280 272Z" fill="none" stroke="var(--primary)" strokeOpacity=".25"/></>:null}
            </g>
          ))}
          <text x="280" y="240" textAnchor="middle" fill="var(--foreground)" fontSize="13" fontWeight="600">{sourceLabel}</text>
          <text x="280" y="259" textAnchor="middle" fill="var(--muted-foreground)" fontSize="10">{id==="deletion"&&changed ? "Write permission required" : "Source-backed conceptual model"}</text>
          <motion.g animate={{y:changed?-12:0}} transition={reduce?{duration:0}:{type:"spring",stiffness:130,damping:22}}>
            <path d="M169 136 280 81 391 136 280 192Z" fill="var(--obs-panel)" stroke="url(#instrument-edge)" strokeWidth="1.5"/>
            <path d="M169 136v7l111 56 111-56v-7" fill="none" stroke="var(--primary)" strokeOpacity=".5"/>
            <text x="280" y="137" textAnchor="middle" fill="var(--foreground)" fontSize="11" fontWeight="600">{id==="retention"?"Team A + Team B":id==="deletion"?"Shortcut object":"Shortcut location"}</text>
            <text x="280" y="155" textAnchor="middle" fill="var(--primary)" fontSize="10">{id==="retention"?"Read access":id==="discovery"?state.location.toUpperCase():changed?"Remains":"Removed"}</text>
          </motion.g>
          <motion.path d="M280 194v20" fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray={changed?"3 4":undefined} animate={{pathLength:id==="deletion"&&!changed?0:1}} transition={reduce?{duration:0}:{duration:.28}}/>
          <path d="m275 207 5 7 5-7" stroke="var(--primary)" fill="none" opacity={id==="deletion"&&!changed?0:1}/>
          {id === "retention" ? (
            <motion.g initial={false} animate={{opacity:state.retained?1:0,y:state.retained?0:18}} transition={reduce?{duration:0}:{duration:.32}}>
              <path d="M398 246 438 266" stroke="var(--primary)" strokeDasharray="3 4" fill="none"/>
              <path d="M368 302 439 267 510 302v8l-71 35-71-35Z" fill="var(--obs-slab)" stroke="var(--obs-edge)"/>
              <path d="M368 302 439 267 510 302 439 337Z" fill="var(--obs-panel)" stroke="var(--primary)" strokeDasharray="3 4"/>
              <text x="439" y="299" textAnchor="middle" fill="var(--foreground)" fontSize="10">Retained result</text>
              <text x="439" y="315" textAnchor="middle" fill="var(--primary)" fontSize="10">REQUIRED</text>
            </motion.g>
          ) : null}
          <g fill="var(--muted-foreground)" fontFamily="monospace" fontSize="9" letterSpacing="1"><text x="28" y="372">SOURCE</text><text x="460" y="66">ASSUMPTION</text></g>
          <path d="m76 367 45-47m332-249-37 45" stroke="currentColor" strokeOpacity=".25"/>
        </svg>
      </motion.div>
      <div className="instrument-readout">
        <p className="instrument-state" aria-live="polite">{topLabel}</p>
        <button type="button" aria-pressed={changed} onClick={toggle} className="instrument-switch"><span aria-hidden="true" className="switch-dot"/>{id==="retention"?"Change the requirement":id==="deletion"?"Change the action":"Change the placement"}<span aria-hidden="true">↗</span></button>
        <button type="button" onClick={()=>onChange(INITIAL_EXPERIMENT)} className="instrument-reset">Reset model</button>
      </div>
    </div>
  );
});
