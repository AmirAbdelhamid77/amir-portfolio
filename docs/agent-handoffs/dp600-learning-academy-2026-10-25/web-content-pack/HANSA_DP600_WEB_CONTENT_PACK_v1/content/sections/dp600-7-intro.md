---
id: "dp600-7-intro"
title: "Design and build semantic models"
chapter: "7"
kind: "chapter-intro"
source_start_page: 38
source_end_page: 43
content_status: "raw-extracted-needs-scientific-and-layout-review"
source_type: "user-provided-pdf"
---

# Design and build semantic models

> Original PDF pages: 38, 39, 40, 41, 43. Source text is preserved below; table, diagrams and code styling require editorial conversion and QA.

```text
Chapter 7 — Implement and manage semantic models,
part 1: design and build
EXAM FOCUS
Design and build semantic models — choose a storage mode · implement a star schema for a
semantic model · implement relationships, such as bridge tables and many-to-many relationships ·
write calculations that use DAX variables and functions, such as iterators, table filtering, windowing,
and information functions · implement calculation groups, dynamic format strings, and field parameters
· identify use cases for and configure large semantic model storage format · design and build
composite models.
KNOW THE DIFFERENCE
Dual is not a fourth independent mode — it is a property you set on a table (usually a dimension)
inside a composite model so the engine can satisfy a query from memory when possible and push
down to the source when a DirectQuery fact table is involved. Setting dimensions to Dual is the
standard fix for slow DirectQuery slicers.
Margin % =
VAR Sales = SUM ( FactSales[SalesAmount] )
VAR Cost  = SUM ( FactSales[TotalProductCost] )
RETURN DIVIDE ( Sales - Cost, Sales )
Iterators ( SUMX , AVERAGEX , MAXX , RANKX , CONCATENATEX ) evaluate an expression row by row over a
table and then aggregate:
Sales Amount = SUMX ( FactSales, FactSales[Quantity] * FactSales[UnitPrice] )
Table filtering — pass a table expression to CALCULATE :
High Value Sales =
CALCULATE ( [Total Sales], FILTER ( VALUES ( FactSales[OrderValue] ), FactSales[OrderValue] 
> 1000 ) )
Windowing functions ( INDEX , OFFSET , WINDOW , RANK , ROWNUMBER ) operate over an ordered result set
— much simpler than the old EARLIER  patterns:
Sales vs Previous Month =
VAR Prior = CALCULATE ( [Total Sales], OFFSET ( -1, , ORDERBY ( DimDate[MonthKey] ) ) )
RETURN [Total Sales] - Prior
Information functions answer "what is the current state?" — ISBLANK , ISFILTERED , ISCROSSFILTERED ,
ISINSCOPE , HASONEVALUE , SELECTEDVALUE , USERPRINCIPALNAME , USERNAME :
Selected Region Label =
IF ( HASONEVALUE ( DimRegion[Region] ), SELECTEDVALUE ( DimRegion[Region] ), "All regions" )
Dynamic format strings let one measure change its own format — percentage for a ratio item, currency for
an amount item, or a currency that follows the selected country:
-- Format string expression on a measure or calculation item
SELECTEDVALUE ( DimCurrency[FormatString], "#,##0.00" )
Reference: dynamic format strings.
Field parameters let the user choose which measure or which dimension a visual shows, from a slicer,
without bookmarks:
Measure selection = {
    ("Sales",   NAMEOF('Measures'[Total Sales]),  0),
    ("Margin",  NAMEOF('Measures'[Margin]),       1),
    ("Quantity",NAMEOF('Measures'[Total Qty]),    2)
}
Reference: field parameters.
KNOW THE DIFFERENCE
Calculation group vs field parameter. A calculation group changes how a measure is evaluated
(YTD, PY, YoY) and is authored by the modeller. A field parameter changes which field or measure a
visual displays and is driven by the report user. They are frequently combined.
Large semantic model storage format · calculated tables
Training: Design semantic models for scale · Design and manage semantic models in Fabric
```
