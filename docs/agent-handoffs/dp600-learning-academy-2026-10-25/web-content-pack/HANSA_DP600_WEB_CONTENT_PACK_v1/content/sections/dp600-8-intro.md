---
id: "dp600-8-intro"
title: "Optimise semantic models"
chapter: "8"
kind: "chapter-intro"
source_start_page: 44
source_end_page: 48
content_status: "raw-extracted-needs-scientific-and-layout-review"
source_type: "user-provided-pdf"
---

# Optimise semantic models

> Original PDF pages: 44, 46, 48. Source text is preserved below; table, diagrams and code styling require editorial conversion and QA.

```text
Chapter 8 — Implement and manage semantic models,
part 2: optimise at enterprise scale
EXAM FOCUS
Optimize enterprise-scale semantic models — implement performance improvements in queries
and report visuals · improve DAX performance · configure Direct Lake, including default fallback and
refresh behavior · choose between Direct Lake on OneLake and Direct Lake on SQL analytics
endpoint · implement incremental refresh for semantic models.
Framing (the "refresh"). A Direct Lake model has no data refresh in the Import sense. A refresh performs
framing: it updates model metadata to point at the current version of each Delta table and invalidates
cached columns whose files changed. The next query re-pages the new data. Framing is fast because it
moves metadata, not rows.
Set the model to update automatically when source data changes, or frame on a schedule, or frame from
a pipeline at the end of a load.
Running OPTIMIZE  on a Delta table rewrites files, so the next query must re-page those columns —
expect a cold-ish first query after maintenance.
Fallback. If a query cannot be served from Direct Lake, the engine silently falls back to DirectQuery
against the SQL analytics endpoint. Common triggers: the table exceeds the per-SKU guardrails (row
counts and file sizes scale with the F SKU), the object is a SQL view rather than a table, or an unsupported
construct is used.
Control it with the DirectLakeBehavior  model property:
Value
Behaviour
Automatic  (default)
Use Direct Lake where possible, fall back to DirectQuery silently
DirectLakeOnly
Never fall back — raise an error instead, so you find out that you exceeded a guardrail
DirectQueryOnly
Always use DirectQuery, useful for comparison testing
COMMON EXAM TRAP
"The report was fast yesterday and slow today, and nothing changed in the model" is the classic
fallback symptom: the table grew past a guardrail and every query is now DirectQuery. Set
DirectLakeOnly  in development so a guardrail breach fails loudly instead of silently degrading in
production.
3. In the model, set the policy: **Archive data starting n years before refresh date and Incrementally refresh
data starting m days before refresh date**.
4. Publish and run the first refresh — that one is long, because it builds all the partitions.
Options that matter:
Detect data changes — nominate a LastModified  column so a partition is only reprocessed when
something in it actually changed.
Only refresh complete periods — avoids publishing a half-finished day or month.
The source query must fold, otherwise every partition scans the whole source and you have made
things worse.
COMMON EXAM TRAP
Incremental refresh is not a Direct Lake feature — a Direct Lake table is never "refreshed" row by row,
it is framed. If a question sets up a Direct Lake model and asks how to reduce refresh time, the answer
involves framing, table maintenance, and partitioned Delta writes, not RangeStart / RangeEnd .
```
