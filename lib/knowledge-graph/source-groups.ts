/**
 * Source grouping derived only from the cited URL.
 *
 * The tree cannot hang one source under every unit that cites it, so sources
 * are collected into one bucket per subject. A flat bucket is a poor browsing
 * surface (Fabric has 198 sources), so this module adds one navigational layer:
 * host + documentation area. The layer is synthetic — it is not a declared
 * corpus taxonomy — and the raw URL is preserved on the source node and in the
 * side card.
 */

export interface SourceGroup {
  key: string;
  id: string;
  host: string;
  hostLabel: string;
  area: string;
  areaLabel: string;
  label: string;
  sortKey: string;
}

const HOST_LABEL: Record<string, string> = {
  "learn.microsoft.com": "Microsoft Learn",
  "docs.delta.io": "Delta Lake docs",
  "youtube.com": "YouTube",
  "app.notion.com": "Notion",
};

const SEGMENT_LABEL: Record<string, string> = {
  "data-factory": "Data Factory",
  "data-warehouse": "Data Warehouse",
  "data-engineering": "Data Engineering",
  "real-time-intelligence": "Real-Time Intelligence",
  "onelake": "OneLake",
  "cicd": "CI/CD",
  "power-bi": "Power BI",
  "sql": "SQL",
  "t-sql": "T-SQL",
  "kusto": "Kusto",
  "rest": "REST",
  "api": "API",
  "admin": "Admin",
  "fundamentals": "Fundamentals",
  "governance": "Governance",
  "get-started": "Get Started",
  "enterprise": "Enterprise",
  "security": "Security",
  "credentials": "Credentials",
  "certifications": "Certifications",
  "support": "Support",
  "azure": "Azure",
  "architecture": "Architecture",
  "guidance": "Guidance",
  "connect-data": "Connect Data",
  "collaborate-share": "Collaborate & Share",
  "concurrency-control": "Concurrency Control",
  "delta-deletion-vectors": "Deletion Vectors",
  "delta-batch": "Batch",
  "best-practices": "Best Practices",
  "overview": "Overview",
  "watch": "Videos",
};

function humanizeSegment(segment: string): string {
  if (SEGMENT_LABEL[segment]) return SEGMENT_LABEL[segment];
  return segment
    .split(/[-_]+/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function safeId(value: string): string {
  return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "root";
}

/**
 * `null` only when the href is not an absolute URL. The build treats that as a
 * data error; it never silently drops a source.
 */
export function sourceGroupFor(href: string | undefined): SourceGroup | null {
  if (!href) return null;
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./i, "").toLowerCase();
  const hostLabel = HOST_LABEL[host] ?? host;
  let segments = url.pathname.split("/").filter(Boolean);
  if (/^(en|fr|de|es|it|ja|ko|pt|zh|nl|pl|ru|sv|tr)$/i.test(segments[0] ?? "")) {
    segments = segments.slice(1);
  }
  if (/^[a-z]{2}-[a-z]{2}$/i.test(segments[0] ?? "")) {
    segments = segments.slice(1);
  }

  let area: string;
  if (host === "learn.microsoft.com") {
    area = segments.slice(0, 2).join("/") || "overview";
  } else if (host === "docs.delta.io") {
    area = segments[0] || "overview";
  } else if (host === "youtube.com") {
    area = "videos";
  } else if (host === "app.notion.com") {
    area = "pages";
  } else {
    area = segments.slice(0, 2).join("/") || "overview";
  }

  const areaLabel = area
    .split("/")
    .filter(Boolean)
    .map(humanizeSegment)
    .join(" / ") || "Overview";
  const label = area === "videos" || area === "pages" ? hostLabel : `${hostLabel} · ${areaLabel}`;

  return {
    key: `${host}|${area}`,
    id: `group:source:${safeId(host)}:${safeId(area)}`,
    host,
    hostLabel,
    area,
    areaLabel,
    label,
    sortKey: `${hostLabel} · ${areaLabel}`,
  };
}
