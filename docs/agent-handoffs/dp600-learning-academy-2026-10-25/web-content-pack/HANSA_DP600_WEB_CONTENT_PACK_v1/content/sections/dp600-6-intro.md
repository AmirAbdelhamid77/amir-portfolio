---
id: "dp600-6-intro"
title: "Query and analyse"
chapter: "6"
kind: "chapter-intro"
source_start_page: 34
source_end_page: 37
content_status: "raw-extracted-needs-scientific-and-layout-review"
source_type: "user-provided-pdf"
---

# Query and analyse

> Original PDF pages: 34, 37. Source text is preserved below; table, diagrams and code styling require editorial conversion and QA.

```text
Chapter 6 — Prepare data, part 3: query and analyse
EXAM FOCUS
Query and analyze data — select, filter, and aggregate data by using the Visual query editor · by
using SQL · by using KQL · by using DAX.
DP-600 expects you to read and write four query surfaces. You will not be asked to write 50 lines of
anything, but you will be asked to pick the correct expression out of four plausible ones.
-- T-SQL
SELECT TOP (5) c.CategoryName, SUM(f.SalesAmount) AS Sales
FROM dbo.FactSales f
JOIN dbo.DimProduct c ON c.ProductKey = f.ProductKey
JOIN dbo.DimDate d    ON d.DateKey    = f.DateKey
WHERE d.CalendarYear = 2026
GROUP BY c.CategoryName
ORDER BY Sales DESC;
// KQL
Sales
| where Year == 2026
| summarize Sales = sum(SalesAmount) by CategoryName
| top 5 by Sales desc
// DAX
Top5Categories2026 =
TOPN (
    5,
    SUMMARIZECOLUMNS (
        DimProduct[CategoryName],
        TREATAS ( { 2026 }, DimDate[CalendarYear] ),
        "Sales", [Total Sales]
    ),
    [Sales], DESC
)
```
