---
id: "dp600-5-intro"
title: "Transform data"
chapter: "5"
kind: "chapter-intro"
source_start_page: 28
source_end_page: 33
content_status: "raw-extracted-needs-scientific-and-layout-review"
source_type: "user-provided-pdf"
---

# Transform data

> Original PDF pages: 28, 29, 30, 32, 33. Source text is preserved below; table, diagrams and code styling require editorial conversion and QA.

```text
Chapter 5 — Prepare data, part 2: transform data
EXAM FOCUS
Transform data — create views, functions, and stored procedures · enrich data by adding new
columns or tables · implement a star schema for a lakehouse or warehouse · denormalize data ·
aggregate data · merge or join data · identify and resolve duplicate data, missing data, or null values ·
convert column data types · filter data.
DimDate
DateKey (PK)
DimProduct
ProductKey (PK)
DimCustomer
CustomerKey (PK)
DimStore
StoreKey (PK)
FactSales
— — — — —
DateKey · ProductKey
CustomerKey · StoreKey
Quantity · SalesAmount
1:*
1:*
1:*
1:*
One-to-many, single-direction filters flowing from dimensions to the fact table
One fact table surrounded by dimensions, joined by surrogate keys. Filters flow one way: dimension to fact.
Rules worth memorising:
Fact tables hold measurements plus foreign keys. Keep them narrow and long; store the key, not the
description.
Dimension tables hold descriptive attributes and one surrogate key. Keep them wide and short.
Grain is declared first. "One row per order line per day" determines everything else.
Surrogate keys (integer, meaningless) beat natural/business keys: they survive source system changes
and make SCD Type 2 possible.
Conformed dimensions (a single DimDate , a single DimCustomer ) let two fact tables be analysed side
by side.
A date dimension is mandatory for time intelligence. Mark it as a date table in the semantic model.
Creating a dimension with a surrogate key in a warehouse:
CREATE TABLE dbo.DimProduct (
    ProductKey      INT           NOT NULL,   -- surrogate
    ProductId       VARCHAR(20)   NOT NULL,   -- natural/business key
    ProductName     VARCHAR(200)  NULL,
    Category        VARCHAR(100)  NULL,
    ListPrice       DECIMAL(10,2) NULL
);
-- Generate surrogate keys with a window function (Fabric Warehouse has no IDENTITY)
INSERT INTO dbo.DimProduct
SELECT ROW_NUMBER() OVER (ORDER BY s.ProductId) + COALESCE((SELECT MAX(ProductKey) FROM 
dbo.DimProduct), 0),
       s.ProductId, s.ProductName, s.Category, s.ListPrice
FROM   stg.Product AS s
WHERE  NOT EXISTS (SELECT 1 FROM dbo.DimProduct d WHERE d.ProductId = s.ProductId);
The same idea in PySpark for a lakehouse:
from pyspark.sql import functions as F
from pyspark.sql.window import Window
stg = spark.read.table("bronze.product")
w   = Window.orderBy("ProductId")
dim = (stg.dropDuplicates(["ProductId"])
          .withColumn("ProductKey", F.row_number().over(w))
          .select("ProductKey", "ProductId", "ProductName", "Category", "ListPrice"))
dim.write.mode("overwrite").format("delta").saveAsTable("silver.DimProduct")
COMMON EXAM TRAP
Fabric Warehouse does not support IDENTITY  columns, and it does not enforce PRIMARY
KEY / FOREIGN KEY  constraints — they can be declared as NOT ENFORCED  for metadata and optimiser
hints only. Your load process is responsible for key uniqueness and referential integrity. Expect a
question where the "obvious" IDENTITY  answer is wrong.
CREATE VIEW dbo.vSalesCurrentYear AS
SELECT f.*, d.CalendarYear
FROM   dbo.FactSales AS f
JOIN   dbo.DimDate   AS d ON d.DateKey = f.DateKey
WHERE  d.CalendarYear = YEAR(GETDATE());
GO
CREATE PROCEDURE dbo.usp_LoadDimProduct
AS
BEGIN
    MERGE dbo.DimProduct AS tgt
    USING stg.Product     AS src ON tgt.ProductId = src.ProductId
    WHEN MATCHED AND tgt.ListPrice <> src.ListPrice
        THEN UPDATE SET tgt.ListPrice = src.ListPrice
    WHEN NOT MATCHED BY TARGET
        THEN INSERT (ProductId, ProductName, ListPrice)
             VALUES (src.ProductId, src.ProductName, src.ListPrice);
END;
Call the procedure from a pipeline with a Stored procedure activity, or from a notebook. Check the
supported surface area before you assume a T-SQL feature exists: T-SQL surface area in Fabric.
COMMON EXAM TRAP
The lakehouse SQL analytics endpoint is read-only. Any scenario requiring MERGE , a stored
procedure, or a multi-table transaction over lakehouse tables must either move the logic into a Spark
notebook ( MERGE INTO  in Spark SQL works on Delta tables) or move the Gold layer into a warehouse.
The Spark equivalent of an upsert:
%%sql
MERGE INTO silver.DimProduct AS tgt
USING bronze.product          AS src
   ON tgt.ProductId = src.ProductId
WHEN MATCHED AND tgt.ListPrice <> src.ListPrice THEN UPDATE SET tgt.ListPrice = 
src.ListPrice
WHEN NOT MATCHED THEN INSERT *;
Answers. 1. Query folding broke at that step, so all downstream work moved to the mashup engine. 2.
ROW_NUMBER()  (or a hash/sequence pattern) — there is no IDENTITY  in Fabric Warehouse. 3. Stored
procedure. 4. ROW_NUMBER() OVER (PARTITION BY key ORDER BY timestamp DESC) = 1 . 5.
TRY_CAST  and route the NULL  results to a quarantine table.
```
