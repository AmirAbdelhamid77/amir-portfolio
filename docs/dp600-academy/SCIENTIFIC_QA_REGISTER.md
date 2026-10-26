# Scientific QA register — 25 October 2026

Only the ingestion pilot's derived claims were documentation-reviewed in this slice. No SQL, DAX, KQL or Fabric workload executed. Original PDF/page extracts/hashes remain untouched. Official URLs live in lib/academy/ingestion.ts and are visible in the lesson. The Arabic audit is editorial evidence, not independent verification; damaged text not reconstructed.

| Issue | Preserved source statement/location | Derived teaching decision | Evidence | Status |
|---|---|---|---|---|
| ING-01 | “Always current” (p10); diagram p9 | No separately maintained ingestion replica; caching/consumer behavior qualify freshness. Bytes can move during reads. | MS-SHORTCUT, https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcuts | PASS documentation review; tenant test NOT RUN |
| ING-02 | General permission trap p10 | Verify shortcut/target permissions and connection identity; no universal automatic access claim. | MS-SECURITY, https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcut-security | PASS documentation review; identity matrix outside pilot |
| ING-03 | Database replication examples p25 | Explicitly scope Database Mirroring; supported source/prerequisites required. Metadata mirroring may reference via shortcuts. | MS-MIRROR, https://learn.microsoft.com/en-us/fabric/mirroring/overview | PASS documentation review; tenant NOT RUN |
| ING-04 | Batch-copy versus near-real-time table p10 | Copy job can support CDC where connector/source allows it; freshness alone cannot uniquely select Mirroring. | MS-COPY and MS-DECISION, https://learn.microsoft.com/en-us/fabric/data-factory/what-is-copy-job and https://learn.microsoft.com/en-us/fabric/data-factory/decision-guide-data-movement | PASS documentation review; connector test NOT RUN |
| ING-05 | Copy/reshaping simplification p10, tools p25 | Separate Copy/orchestration from complex joins/cleansing; materialized history needs append/version policy. | Same Microsoft decision guide, plus explicit hypothetical architecture requirement | PASS conceptual/decision tests; engine execution NOT RUN |

Assessment scope: original conceptual questions; explicit requirements and why alternatives fail. Replica question asks for direct managed database replication, not an assertion that CDC Copy jobs cannot replicate. Constraint explorer returns no match for cases outside its bounded architecture; not evidence of a Fabric platform limitation. Conditional availability/access assumptions shown.

## Deferred full-book queue — not published as verified material

Default semantic models p12/47; BIGINT IDENTITY p29/30/33/53; missing ProductKey MERGE p32; trial capacity p7; sensitivity-label inheritance p17; classic/calendar time intelligence p29; Eventhouse data location/availability; OneLake/SQL identity modes; Direct Lake framing/transcoding/fallback p38/44–48; PySpark/MERGE idempotence; exam-score heuristics. Each requires new current official evidence and original-versus-derived record before its lesson ships. Source questions/keys remain archived separately; no scientific endorsement of all 834 historical questions.

Review validity: retrieved live Microsoft Learn articles on 25 October 2026. Current-doc content can change; revisit before public release. No paid/runtime services introduced. Study-guide redistribution rights remain unresolved, and no guide PDF/raw text/previews are exposed by these routes.
