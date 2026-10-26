---
id: "dp600-2-intro"
title: "Security and governance"
chapter: "2"
kind: "chapter-intro"
source_start_page: 13
source_end_page: 17
content_status: "raw-extracted-needs-scientific-and-layout-review"
source_type: "user-provided-pdf"
---

# Security and governance

> Original PDF pages: 13, 14, 15, 16, 17. Source text is preserved below; table, diagrams and code styling require editorial conversion and QA.

```text
Chapter 2 — Maintain a data analytics solution, part 1:
security and governance
EXAM FOCUS
Implement security and governance — implement workspace-level access controls · implement
item-level access controls · implement row-level, column-level, object-level, and file-level access
control · apply sensitivity labels to items · endorse items.
Capability
Admin
Member
Contributor
Viewer
Delete the workspace, change its capacity
✔
Add or remove people in any role
✔
Add people as Contributor or Viewer
✔
✔
Share items and re-share with others
✔
✔
Publish and update an app
✔
✔
Create, edit, delete items
✔
✔
✔
Schedule and run refreshes and jobs
✔
✔
✔
View and interact with items, read data through the SQL endpoint
✔
✔
✔
✔
Read raw files through Spark / OneLake APIs
✔
✔
✔
COMMON EXAM TRAP
Viewer does not mean "can read all the data." A Viewer can query a warehouse or lakehouse
through the SQL analytics endpoint and open reports, but cannot read the underlying files with Spark
or OneLake APIs. If a scenario says "analysts must query tables with SQL but must not read the raw
files," Viewer plus ReadData  is the answer — not Contributor.
COMMON EXAM TRAP
Build is not Read. A user with Read on a semantic model can open existing reports; a user needs
Build to create a new report, connect from Excel, or use Analyze in Excel. "Users can see the
published report but cannot create their own" almost always means Build is missing.
▸ RLS in a warehouse or SQL analytics endpoint (T-SQL)
A security predicate function plus a security policy, exactly as in SQL Server:
CREATE SCHEMA Security;
GO
CREATE FUNCTION Security.fn_SalesRepPredicate(@SalesRep AS varchar(100))
    RETURNS TABLE
    WITH SCHEMABINDING
AS
    RETURN SELECT 1 AS granted
           WHERE @SalesRep = USER_NAME()
              OR IS_ROLEMEMBER('SalesManagers') = 1;
GO
CREATE SECURITY POLICY Security.SalesRepFilter
    ADD FILTER PREDICATE Security.fn_SalesRepPredicate(SalesRep) ON dbo.FactSales
    WITH (STATE = ON);
Details: row-level security in Fabric Data Warehouse.
▸ RLS in an Eventhouse (KQL)
KQL databases enforce row level security with a policy on the table that rewrites the query:
.alter table Telemetry policy row_level_security enable
"Telemetry | where Region == current_principal_details()['UserPrincipalName']"
COMMON EXAM TRAP
Semantic-model RLS is ignored for a user who has Admin, Member, or Contributor on the workspace,
and for anyone with Write permission on the model. Always test with View as role, and put report
consumers in Viewer.
// TMSL fragment: hide a table from the "Standard" role
{
  "name": "Standard",
  "tablePermissions": [
    { "name": "Payroll", "metadataPermission": "none" }
  ]
}
KNOW THE DIFFERENCE
CLS hides a column's values, OLS hides the object's existence. With CLS the user still sees the
column name and gets an error or a blank; with OLS the table or column is not in the model at all for
that role — a visual referencing it breaks rather than showing blanks.
```
