---
id: "dp600-1-intro"
title: "The Microsoft Fabric platform"
chapter: "1"
kind: "chapter-intro"
source_start_page: 8
source_end_page: 11
content_status: "raw-extracted-needs-scientific-and-layout-review"
source_type: "user-provided-pdf"
---

# The Microsoft Fabric platform

> Original PDF pages: 8, 10, 11. Source text is preserved below; table, diagrams and code styling require editorial conversion and QA.

```text
Chapter 1 — The Microsoft Fabric platform in one chapter
Every other chapter assumes the vocabulary in this one. If you can explain the picture below out loud, you
are ready to move on.
Concept
Data movement
Freshness
Typical use
Shortcut
None — read in place
Always
current
Reuse a Gold table across workspaces; read
S3/ADLS without ETL
Mirroring
Managed replication into
OneLake
Near real
time
Bring Azure SQL, Cosmos DB, Snowflake into
Fabric with no ETL
Copy
(pipeline/dataflow)
Physical copy
As of last run
You need to reshape, cleanse, or land history
COMMON EXAM TRAP
A shortcut does not carry the source's permissions into Fabric automatically. Access through a shortcut
is evaluated by the shortcut's own connection and by OneLake security in the target workspace.
Shortcuts to external clouds use the stored credential of the connection, not the caller's identity (unless
the connection uses a pass-through identity). Expect a question that hinges on "who can see this data
after I create the shortcut?"
What is the workload?
Lakehouse
Spark / files
unstructured +
Delta tables
read-only SQL
Warehouse
Full T-SQL
multi-table
transactions
writes via SQL
Eventhouse
High-volume
telemetry, logs
KQL, seconds
time series
SQL database
OLTP app data
low latency
auto-mirrored
to OneLake
All four persist to OneLake in Delta/Parquet, so any engine can read the result
The four analytical stores. All of them land data in OneLake in Delta/Parquet.
Lakehouse
Warehouse
Eventhouse (KQL)
SQL database
Primary
language
PySpark, Spark
SQL
T-SQL
KQL (T-SQL subset for
reads)
T-SQL
Writes
Spark, pipelines,
Dataflows Gen2
T-SQL
INSERT / UPDATE / DE
LETE / MERGE , COPY
INTO
Streaming ingestion,
.ingest
Full OLTP
transactions
Multi-table
transactions
No
Yes
No
Yes
Unstructured
files
Yes (Files area)
No
No
No
Best at
Data engineering,
ML, mixed file
types
Dimensional models,
SQL-first teams,
complex joins
Telemetry, logs, IoT, time
series, sub-second over
huge volumes
Operational apps,
low-latency point
reads
SQL endpoint
Read-only
Read/write
—
Read/write
Auto-mirrors to
OneLake
Native
Native
Yes, via OneLake
availability
Yes, automatically
KNOW THE DIFFERENCE
Lakehouse vs Warehouse is the single most common "choose a store" question. Decide with two
questions: (1) Does the team need to write with T-SQL, including multi-table transactions? →
Warehouse. (2) Does the workload involve files, Spark, or ML? → Lakehouse. If both, use both: a
lakehouse for Bronze/Silver and a warehouse for Gold, joined through shortcuts or cross-database
queries.
Full decision guidance: choose a data store and choose between pipeline, dataflow, and Spark.
```
