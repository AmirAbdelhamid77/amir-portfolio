"use client";

// The review-only neighbourhood is lazy on purpose: the public Home must not
// download its CSS or JS. `ssr: false` keeps the field out of the static HTML of
// the public export; in the review build it mounts after hydration.

import dynamic from "next/dynamic";

export const EditionNeighbourhoodLazy = dynamic(
  () => import("./edition").then((module) => module.EditionNeighbourhood),
  {
    ssr: false,
    loading: () => (
      <p className="mt-8 text-sm leading-7 text-muted-foreground" role="status">
        Opening the candidate neighbourhood&hellip;
      </p>
    ),
  },
);
