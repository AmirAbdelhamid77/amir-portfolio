/** Framework-agnostic TypeScript interfaces for the static JSON content pack. */
export type ChapterId = number | 'a' | 'b';
export type SourceSection = {
  id: string;
  title: string;
  chapter: ChapterId | 'front';
  type: 'lesson' | 'reference' | 'chapter-intro';
  source_pages: number[];
  content_file: string;
  qa_status: 'unverified-source' | 'approved' | string;
};
export type LearningNode = {
  step: number;
  chapter: ChapterId;
  name: string;
  prerequisites: ChapterId[];
  core: boolean;
};

// Import /data/sections.json as a content registry, not as the primary user-visible reading UI.
// Render reviewed educational content using Hansa components, backed by immutable source IDs.
// Do not publish raw extraction as scientifically verified lessons.
