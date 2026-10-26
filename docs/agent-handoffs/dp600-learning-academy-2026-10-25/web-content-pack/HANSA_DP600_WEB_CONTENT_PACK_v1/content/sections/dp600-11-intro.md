---
id: "dp600-11-intro"
title: "Exam-day quick reference"
chapter: "11"
kind: "chapter-intro"
source_start_page: 52
source_end_page: 55
content_status: "raw-extracted-needs-scientific-and-layout-review"
source_type: "user-provided-pdf"
---

# Exam-day quick reference

> Original PDF pages: 52, 53, 55. Source text is preserved below; table, diagrams and code styling require editorial conversion and QA.

```text
Chapter 11 — Exam-day checklist and quick reference
Topic
The one line
Workspace roles
Admin > Member > Contributor > Viewer; Viewer ≠ file access
Item permissions
Read · ReadData (SQL) · ReadAll (Spark/OneLake) · Build (new content)
Security scope
OneLake security = every engine; SQL GRANT = SQL endpoint only
RLS ignored for
Workspace Admin/Member/Contributor and anyone with model Write
Endorsement
Promoted (anyone with Write) · Certified / Master data (nominated reviewers)
Lakehouse vs warehouse
T-SQL writes and multi-table transactions → warehouse; files and Spark →
lakehouse
SQL analytics endpoint
Read-only. No stored procedures, no MERGE
No IDENTITY  in warehouse
Use ROW_NUMBER()  for surrogate keys
Shortcut vs mirroring vs copy
Reference · replicate · duplicate
Direct Lake refresh
Framing = metadata; columns page in on first use
Fallback
Automatic → DirectQuery; DirectLakeOnly  to fail loudly
DL on OneLake
No fallback; multiple sources; OneLake security
Incremental refresh
RangeStart / RangeEnd , must fold, Import only
Calculation group vs field
parameter
How a measure is evaluated vs which field is shown
Dual storage mode
Dimensions in a composite model with a DirectQuery fact
Git vs deployment pipeline
History and review vs promotion between stages
.pbix  / .pbip  / .pbit
Binary · project folder for Git · template with no data
take  vs top  in KQL
Arbitrary rows vs actual top N
Keep current with the Microsoft Fabric blog and what's new in Fabric — the exam is refreshed regularly,
and the skills outline carries a change log.
Ask questions in the Fabric Community and Microsoft Q&A.
KEY TAKEAWAY
You do not need to memorise every menu. You need to be able to say, for any scenario: which store,
which engine, which security layer, which storage mode, and which lifecycle tool — and to justify the
choice in one sentence. That is what 700 points looks like.
```
