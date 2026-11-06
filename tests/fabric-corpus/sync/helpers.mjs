// FC09/W3-C — shared fixture builder for the sync machinery tests.
//
// Builds a tiny synthetic corpus in a temp directory that carries the same
// mutation-target paths the simulator hardcodes (fabric-trial.md,
// building-reports.md, canadian-time-zone-changes.md, product-name.md,
// onelake-capacity-consumption.md) plus synthetic base receipts whose blob
// shas are computed from the actual fixture files. This exercises the full
// simulate -> diff -> release-candidate pipeline without the real corpus.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

import { PINNED_CORPUS_REVISION } from '../../../tools/fabric-corpus/sync/lib.mjs';

export function sha256Hex(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

const FABRIC_TRIAL = `---
title: "Try the Fabric trial"
description: "Mini fixture article for the sync machinery."
ms.topic: concept-article
---

# Try the Fabric trial

See [building reports](building-reports.md) after you sign up.

[!INCLUDE [prereq](includes/prereq.md)]
`;

const PREREQ_FRAGMENT = `---
ms.topic: include
---

Prerequisite fragment. It includes the shared product-name fragment one level
deeper, which makes the include chain two hops long.

[!INCLUDE [product-name](../../includes/product-name.md)]
`;

const BUILDING_REPORTS = `---
title: "Building reports"
description: "Rename target article."
---

# Building reports

Body of the rename target.
`;

const CANADIAN = `---
title: "Canadian time zone changes"
description: "Removal target article."
---

# Canadian time zone changes

Body of the removal target.
`;

const ANALYZE_TRAIN = `---
title: "Analyze and train data"
description: "Article that links to the rename target."
---

# Analyze and train data

Read more about [building reports](building-reports.md).
`;

const PLAIN = `---
title: "Plain unrelated article"
description: "Unchanged article with no dependency edges."
---

# Plain unrelated article

No includes, no links. Must stay in the keep set.
`;

const PLAIN_TWO = `---
title: "Second plain article"
description: "Unchanged article with no dependency edges (keep set witness)."
---

# Second plain article

No includes, no links either.
`;

const PLAIN_ONELAKE = `---
title: "Plain onelake article"
description: "Unchanged onelake-family article with no dependency edges."
---

# Plain onelake article

No includes, no links. Must stay in the keep set.
`;

const DECISION_GUIDE_MINI = `---
title: "Decision guide mini"
description: "Article whose only dependency on the shared fragment is transitive."
---

# Decision guide mini

[!INCLUDE [prereq](includes/prereq.md)]
`;

const APPLY_LABELS = `---
title: "Apply sensitivity labels"
description: "Rights-withdrawal fixture target."
---

# Apply sensitivity labels

Body of the withdrawal fixture target.
`;

const CAPACITY = `---
title: OneLake capacity consumption example
description: "Title-flip fixture target (title line must match the simulator's M6 expectation)."
ms.topic: how-to
---

# OneLake capacity consumption example

Body of the title-flip target.
`;

const PRODUCT_NAME = `---
ms.topic: include
---
Microsoft Fabric
`;

/**
 * Build the mini corpus under <root>/base/docs and synthetic base receipts
 * under <root>/receipts. Returns the absolute paths the tests need.
 */
export function buildMiniCorpus(root) {
  const base = join(root, 'base', 'docs');
  const receiptsRoot = join(root, 'receipts');
  for (const dir of [
    join(base, 'fundamentals', 'includes'),
    join(base, 'onelake'),
    join(base, 'includes'),
  ]) {
    mkdirSync(dir, { recursive: true });
  }
  const files = {
    'fundamentals/fabric-trial.md': FABRIC_TRIAL,
    'fundamentals/includes/prereq.md': PREREQ_FRAGMENT,
    'fundamentals/building-reports.md': BUILDING_REPORTS,
    'fundamentals/canadian-time-zone-changes.md': CANADIAN,
    'fundamentals/analyze-train-data.md': ANALYZE_TRAIN,
    'fundamentals/plain-article.md': PLAIN,
    'fundamentals/plain-article-2.md': PLAIN_TWO,
    'onelake/plain-onelake-article.md': PLAIN_ONELAKE,
    'fundamentals/decision-guide-mini.md': DECISION_GUIDE_MINI,
    'fundamentals/apply-sensitivity-labels.md': APPLY_LABELS,
    'onelake/onelake-capacity-consumption.md': CAPACITY,
    'includes/product-name.md': PRODUCT_NAME,
  };
  for (const [rel, content] of Object.entries(files)) {
    writeFileSync(join(base, ...rel.split('/')), content, 'utf8');
  }

  // Synthetic base receipts whose shas are computed from the written bytes.
  const shaOf = (rel) => sha256Hex(readFileSync(join(base, ...rel.split('/'))));
  const includeEdge = (fromRel, href) => ({
    kind: 'include',
    href,
    resolved: resolveRel(fromRel, href),
    exists: true,
    blocked: false,
  });
  const linkEdge = (fromRel, href) => ({
    kind: 'link',
    href,
    resolved: resolveRel(fromRel, href),
    exists: true,
  });
  const receipts = {
    fundamentals: {
      schema: 'hansa.fabric-compiler/receipt',
      family: 'fundamentals',
      corpusRevision: PINNED_CORPUS_REVISION,
      files: [
        {
          path: 'fundamentals/fabric-trial.md',
          sha256: shaOf('fundamentals/fabric-trial.md'),
          edges: [includeEdge('fundamentals/fabric-trial.md', 'includes/prereq.md')],
        },
        {
          path: 'fundamentals/includes/prereq.md',
          sha256: shaOf('fundamentals/includes/prereq.md'),
          edges: [],
        },
        {
          path: 'fundamentals/building-reports.md',
          sha256: shaOf('fundamentals/building-reports.md'),
          edges: [],
        },
        {
          path: 'fundamentals/canadian-time-zone-changes.md',
          sha256: shaOf('fundamentals/canadian-time-zone-changes.md'),
          edges: [],
        },
        {
          path: 'fundamentals/analyze-train-data.md',
          sha256: shaOf('fundamentals/analyze-train-data.md'),
          edges: [linkEdge('fundamentals/analyze-train-data.md', 'building-reports.md')],
        },
        { path: 'fundamentals/plain-article.md', sha256: shaOf('fundamentals/plain-article.md'), edges: [] },
        { path: 'fundamentals/plain-article-2.md', sha256: shaOf('fundamentals/plain-article-2.md'), edges: [] },
        {
          path: 'fundamentals/decision-guide-mini.md',
          sha256: shaOf('fundamentals/decision-guide-mini.md'),
          edges: [includeEdge('fundamentals/decision-guide-mini.md', 'includes/prereq.md')],
        },
        {
          path: 'fundamentals/apply-sensitivity-labels.md',
          sha256: shaOf('fundamentals/apply-sensitivity-labels.md'),
          edges: [],
        },
      ],
    },
    onelake: {
      schema: 'hansa.fabric-compiler/receipt',
      family: 'onelake',
      corpusRevision: PINNED_CORPUS_REVISION,
      files: [
        {
          path: 'onelake/onelake-capacity-consumption.md',
          sha256: shaOf('onelake/onelake-capacity-consumption.md'),
          edges: [],
        },
        {
          path: 'onelake/plain-onelake-article.md',
          sha256: shaOf('onelake/plain-onelake-article.md'),
          edges: [],
        },
      ],
    },
  };
  for (const [family, receipt] of Object.entries(receipts)) {
    mkdirSync(join(receiptsRoot, family), { recursive: true });
    writeFileSync(join(receiptsRoot, family, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n', 'utf8');
  }

  return {
    baseDocsRoot: base,
    receiptsRoot,
    families: ['fundamentals', 'onelake'],
    withdrawalSidecar: null, // written by the tests that need one
  };
}

function resolveRel(fromRel, href) {
  const baseDir = fromRel.includes('/') ? fromRel.slice(0, fromRel.lastIndexOf('/')) : '';
  const combined = baseDir === '' ? href : `${baseDir}/${href}`;
  const parts = [];
  for (const part of combined.split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') parts.pop();
    else parts.push(part);
  }
  return parts.join('/');
}

/** Write a withdrawal sidecar for the mini corpus (apply-sensitivity-labels). */
export function writeMiniWithdrawalSidecar(root) {
  const sidecar = {
    schema: 'hansa.fabric-sync/withdrawal-sidecar/1',
    label: 'mini',
    corpusRevision: PINNED_CORPUS_REVISION,
    entries: [
      {
        sourcePath: 'fundamentals/apply-sensitivity-labels.md',
        rightsState: 'withdrawn',
        reason: 'Mini-fixture rights withdrawal',
        effectiveRevision: 'sim:mini',
      },
    ],
  };
  const p = join(root, 'withdrawals-mini.json');
  writeFileSync(p, JSON.stringify(sidecar, null, 2) + '\n', 'utf8');
  return p;
}

/** Write a mutation-manifest-shaped placeholder for tests that need the
 *  successor revision on the plan without running the simulator. */
export function miniMutationManifest(label, mutationRevision) {
  return {
    schema: 'hansa.fabric-sync/mutation-manifest/1',
    label,
    baseCorpusRevision: PINNED_CORPUS_REVISION,
    mutationScript: 'tools/fabric-corpus/sync/simulate-upstream.mjs',
    families: ['fundamentals', 'onelake'],
    mutations: [],
    mutationRevision,
    stats: { mutations: 0 },
  };
}
