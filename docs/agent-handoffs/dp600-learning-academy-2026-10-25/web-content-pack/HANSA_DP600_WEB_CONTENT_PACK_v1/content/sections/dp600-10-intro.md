---
id: "dp600-10-intro"
title: "Practice questions"
chapter: "10"
kind: "chapter-intro"
source_start_page: 50
source_end_page: 51
content_status: "raw-extracted-needs-scientific-and-layout-review"
source_type: "user-provided-pdf"
---

# Practice questions

> Original PDF pages: 50, 51. Source text is preserved below; table, diagrams and code styling require editorial conversion and QA.

```text
Chapter 10 — Practice questions
Answer these closed-book. Full explanations follow the last question.
1. Analysts must query warehouse tables with T-SQL but must never read the underlying Parquet files with
Spark. Which combination do you grant?
2. You must hide the Salary  column from all roles except HR, enforced identically for Spark, T-SQL, and a
Direct Lake model. Which feature?
3. A lakehouse table is 900 GB and grows daily. Reports must be near real time and fast. Which storage
mode?
4. A Direct Lake report worked for months and is now consistently slow. Queries are hitting the SQL
analytics endpoint. What happened?
5. You need YTD, PY, and YoY variants of 20 measures without writing 60 measures. What do you
implement?
6. A business user must switch a chart between three different measures from a slicer. What do you
implement?
7. Which two objects can you create in a lakehouse SQL analytics endpoint: view, stored procedure, inline
TVF, MERGE  statement?
8. A dataflow suddenly takes ten times longer after adding a step. What is the most likely cause?
9. You must promote a tested set of items from Test to Production and re-point them at the Production
lakehouse. Which two features?
10. What exactly happens when a Direct Lake semantic model is "refreshed"?
11. Sales must be analysed by both order date and ship date against a single date dimension. How?
12. You need to know every report that breaks if you drop a column from a Gold warehouse table. Which
feature?
13. Which endorsement level can only be applied by reviewers the tenant admin nominates?
14. A KQL query must return the ten devices with the most errors. Which operator?
15. An Import model refresh takes 6 hours; only the last 7 days of data ever change. What do you configure?
16. A slicer over a small dimension on a DirectQuery model is slow. What is the standard fix?
17. Which Fabric store supports multi-table transactions with T-SQL writes?
18. What does turning on OneLake availability for an eventhouse achieve?
19. Which file format lets a report and its semantic model be code-reviewed in a pull request?
20. A measure divides two measures and errors when the denominator is zero. What do you use?
▸ Answers and explanations
1. Workspace Viewer + ReadData  item permission. ReadAll  would grant Spark/OneLake file access,
which the requirement forbids. Contributor would grant far too much.
2. OneLake security data access roles. T-SQL DENY  only covers callers through the SQL endpoint; a
Spark notebook would bypass it. OneLake security is enforced at the lake layer for every engine.
3. Direct Lake. Import would need a huge refresh, and DirectQuery would be slow. Direct Lake gives
Import-class speed with near-real-time data through framing.
4. The table outgrew a Direct Lake guardrail, so queries fall back to DirectQuery. Verify with the
model's fallback behaviour, then reduce the table, move to a larger SKU, or set DirectLakeOnly  to
surface the problem.
5. A calculation group with three calculation items using SELECTEDMEASURE() .
6. A field parameter. A calculation group changes how a measure is evaluated, not which measure is
shown.
7. View and inline TVF. The endpoint is read-only: no stored procedures, no MERGE .
8. Query folding broke at that step. Everything downstream now runs in the mashup engine instead of
the source.
9. A deployment pipeline (to promote) plus deployment rules or a variable library (to re-point the data
source per stage).
10. Framing — metadata is updated to the current Delta version and affected cached columns are
invalidated; no rows are imported. The next query pages the new data in.
11. Two relationships: one active on order date, one inactive on ship date, activated inside a measure with
USERELATIONSHIP .
12. Impact analysis (with lineage view) from the warehouse item.
13. Certified (and Master data). Promoted can be applied by anyone with Write on the item.
14. top 10 by ErrorCount desc . take 10  returns an arbitrary ten rows.
15. Incremental refresh with RangeStart / RangeEnd , archiving history and refreshing the last 7–10 days,
ideally with Detect data changes.
16. Set the dimension table's storage mode to Dual in a composite model.
17. Warehouse (and Fabric SQL database for OLTP). The lakehouse SQL endpoint is read-only.
18. It writes a Delta copy of the KQL data into OneLake, so Spark, T-SQL, shortcuts, and Direct Lake
models can read it while KQL performance is unaffected.
19. .pbip  — the Power BI project format, with the model in TMDL text files.
20. DIVIDE() , which returns blank (or a supplied alternate) instead of erroring.
```
