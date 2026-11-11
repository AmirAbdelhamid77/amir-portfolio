// One label source for every surface that shows an insight's review state.
// The value is a presentation of the stored status, never a promotion: the
// record keeps `reviewStatus` verbatim and this module only expands it.
export const REVIEW_STATUS_LABEL: Record<string, string> = {
  draft: "Draft — unverified",
  technical_review: "Technical review",
  reviewed: "Reviewed",
  published: "Published",
};

export function reviewStatusLabel(status: string): string {
  return REVIEW_STATUS_LABEL[status] ?? status.replace(/_/g, " ");
}
