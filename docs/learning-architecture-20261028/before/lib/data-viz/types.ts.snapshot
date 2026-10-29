// Types for the content produced by scripts/import-notion-data-viz.mjs.
// The JSON is generated, sanitised source material; it is never rendered as raw
// HTML. Everything reaches the page through React elements.

export type LinkKind =
  | "page"
  | "route"
  | "anchor"
  | "asset"
  | "notion"
  | "external"
  | "external-or-unknown"
  | "missing-page"
  | "missing-asset";

export interface LinkTarget {
  kind: LinkKind;
  href: string;
  targetFile?: string;
  targetSlug?: string | null;
  anchor?: string;
  notionId?: string;
}

export interface Inline {
  text: string;
  strong?: boolean;
  em?: boolean;
  code?: boolean;
  link?: LinkTarget;
}

export type Block =
  | { type: "heading"; level: 2 | 3 | 4; text: string; anchor: string }
  | { type: "paragraph"; inline: Inline[] }
  | { type: "list"; ordered: boolean; items: Inline[][] }
  | { type: "quote"; inline: Inline[] }
  | { type: "callout"; tone: string; icon: string; blocks: Block[] }
  | { type: "code"; language: string; text: string }
  | { type: "table"; headers: Inline[][]; rows: Inline[][][] }
  | {
      type: "figure";
      src: string;
      alt: string;
      caption: string;
      width?: number;
      height?: number;
      asset?: { file: string; sha256: string } | null;
    }
  | { type: "equation"; tex: string }
  | { type: "toggle"; summary: string; blocks: Block[] }
  | { type: "divider" };

export interface SourcePage {
  slug: string;
  title: string;
  lang: "en" | "ar";
  direction: "ltr" | "rtl";
  icon: string;
  description: string;
  notionId: string | null;
  canonicalUrl: string | null;
  source: {
    file: string;
    sha256: string;
    bytes: number;
    observedModified: string;
  };
  counts: {
    paragraphs: number;
    lists: number;
    listItems: number;
    tables: number;
    tableRows: number;
    figures: number;
    equations: number;
    callouts: number;
    toggles: number;
    code: number;
    blocks: number;
    headings: number;
    links: number;
  };
  textLength: number;
  language: { arabicChars: number; latinChars: number; arabicShare: number };
  headings: { level: number; text: string; anchor: string }[];
  blocks: Block[];
}

export type Coverage =
  | "COVERED"
  | "COMBINED"
  | "ARCHIVED"
  | "OUT_OF_SCOPE"
  | "MISSING"
  | "REVIEW_NEEDED";

export interface Chapter {
  number: string;
  slug: string;
  title: string;
  question: string;
  summary: string;
  lessons: string[];
  lab: { href: string; label: string };
}

export interface Lesson {
  slug: string;
  /** `null` for the library map, which sits above the ten chapters. */
  chapter: string | null;
  section: "en" | "ar";
  /** Source page slug, or null for editorial synthesis. */
  source: string | null;
  title: string;
  kind: "source" | "editorial";
  coverage: Coverage;
  intro: string | null;
  takeaways: string[];
}

export interface Curriculum {
  version: number;
  source: {
    label: string;
    exportFolder: string;
    hubPageIncluded: boolean;
    note: string;
  };
  chapters: Chapter[];
  lessons: Lesson[];
}
