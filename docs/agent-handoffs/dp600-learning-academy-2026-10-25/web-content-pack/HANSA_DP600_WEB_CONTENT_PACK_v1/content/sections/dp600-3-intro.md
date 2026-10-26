---
id: "dp600-3-intro"
title: "Development lifecycle"
chapter: "3"
kind: "chapter-intro"
source_start_page: 19
source_end_page: 23
content_status: "raw-extracted-needs-scientific-and-layout-review"
source_type: "user-provided-pdf"
---

# Development lifecycle

> Original PDF pages: 19, 20, 21, 23. Source text is preserved below; table, diagrams and code styling require editorial conversion and QA.

```text
Chapter 3 — Maintain a data analytics solution, part 2:
the development lifecycle
EXAM FOCUS
Maintain the analytics development lifecycle — configure version control for a workspace · create
and manage a Power BI Desktop project (.pbip) · create and configure deployment pipelines · perform
impact analysis of downstream dependencies from lakehouses, warehouses, dataflows, and semantic
models · deploy and manage semantic models by using the XMLA endpoint · create and update
reusable assets, including Power BI template (.pbit) files, Power BI data source (.pbids) files, and
shared semantic models.
Azure DevOps /
GitHub repo
(branches, PRs)
Dev workspace
feature branches
deploy
Test workspace
UAT + rules
deploy
Prod workspace
end users
sync
commit
Deployment rules & Variable library: repoint connections, lakehouse IDs and parameters per stage
Compare stages → select items → deploy · backward deployment allowed · history kept
Git holds the source of truth; deployment pipelines move content between stages; rules and variable libraries re-point it at the right
data for each stage.
Rule
Detail
One branch per
workspace
A workspace connects to exactly one branch at a time
Identity
The commit is made with the identity of the person who clicks Commit
Not everything is
supported
Supported item types expand over time; unsupported items stay in the workspace but
are not serialised
Conflicts
Resolved in the Source control pane, or in Git before updating
COMMON EXAM TRAP
Git integration syncs item definitions, not data. Committing a lakehouse commits its metadata and
shortcuts — not the Delta files. A question describing "we need the tables and their rows in the test
workspace" is describing a data-loading pipeline, not a Git update.
Deployment compares stages and shows what is new, different, or missing; you choose which items to
deploy.
Backward deployment is allowed (Production → Test) when the target stage's workspace is empty of
that item.
Deploying does not move data; it moves item definitions. A warehouse deploys as an empty schema
unless you also run a load.
Deployment rules re-point content per stage, so a report in Test does not read Development data:
Rule type
Typical use
Data source rule
Swap the lakehouse or SQL endpoint a semantic model reads
Parameter rule
Change a Power Query parameter such as a server or database name
Default lakehouse rule
Point a notebook at the stage's own lakehouse
For values shared by many items, a variable library holds one named variable with a different value per
stage — cleaner than repeating rules item by item.
For fully automated releases, drive the same operations through the Fabric REST APIs from Azure DevOps
or GitHub Actions. See CI/CD in Fabric and CI/CD best practices.
COMMON EXAM TRAP
Git integration and deployment pipelines solve different problems and are frequently confused. Git =
version history, branching, code review, and recovery. Deployment pipelines = promoting a tested set
of items to the next environment with stage-specific bindings. Enterprise answers usually use both: Git
for Dev, pipelines for Dev → Test → Prod.
{
  "version": "0.1",
  "connections": [
    {
      "details": {
        "protocol": "tds",
        "address": { "server": "<workspace>.datawarehouse.fabric.microsoft.com", "database": 
"SalesDW" }
      },
      "mode": "DirectQuery"
    }
  ]
}
```
