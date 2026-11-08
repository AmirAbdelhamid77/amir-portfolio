"use client";

// The Level 3 host for the existing decision instrument. State lives here so
// InsightScene itself is reused with its logic unchanged (redesign plan §10);
// the experiment state model is the existing one — nothing about the decision
// models, question banks or progress storage changed.

import { useState } from "react";
import { InsightScene } from "@/components/knowledge/insight-scene";
import {
  INITIAL_EXPERIMENT,
  type ExperimentId,
  type ExperimentState,
} from "@/lib/knowledge/models";
import type { Insight } from "@/lib/knowledge/insights";

export function InsightDetailScene({
  insight,
  experimentId,
}: {
  insight: Insight;
  experimentId: ExperimentId | null;
}) {
  const [scene, setScene] = useState({ revealed: false, evidenceOpen: false });
  const [experiment, setExperiment] = useState<ExperimentState>(INITIAL_EXPERIMENT);
  return (
    <div className="mt-8">
      <InsightScene
        insight={insight}
        scene={scene}
        experimentId={experimentId}
        experiment={experiment}
        onExperimentChange={(patch) => setExperiment((value) => ({ ...value, ...patch }))}
        onToggleReveal={() => setScene((value) => ({ ...value, revealed: !value.revealed }))}
        onToggleEvidence={() => setScene((value) => ({ ...value, evidenceOpen: !value.evidenceOpen }))}
        direction="forward"
      />
    </div>
  );
}
