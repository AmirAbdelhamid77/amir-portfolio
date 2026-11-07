// The prototype graph's dataset, derived at build time from registries the site
// already ships. Nothing here is typed by hand: if a journey names a section
// that does not exist, or a dependency points at a note outside this corpus,
// the build fails instead of drawing a plausible-looking edge.
//
// Contracts used, all pre-existing:
//   content/statistics/content.ts  JOURNEYS[].sections  explicit sequence membership
//                                  SECTIONS[]          note identity, objectives, caveat
//   lib/curriculum/model.ts        curriculum()        positions + reviewed prerequisites
//
// Deliberately NOT used: the Atlas dataset. The public Atlas projection carries
// zero published concepts and zero published connections; this prototype must
// not invent any. The two edge types it draws are named in the UI:
//   member      sequence -> note, from JOURNEYS[].sections (navigational)
//   dependency  note -> note, from the reviewed curriculum prerequisites
//               (editorial teaching order, explicitly not an Atlas assertion)
import {
  JOURNEYS,
  SECTIONS,
  journeyHref,
  sectionHref,
  type SectionMeta,
} from "@/lib/statistics/content";
import { curriculum } from "@/lib/curriculum/model";

export type GraphNote = {
  id: string;
  section: number;
  title: string;
  objectives: string[];
  misconception: string;
  coverage: string;
  sourceNote: string;
  href: string;
  sequenceId: string;
  /** 1-based position inside its sequence, from JOURNEYS[].sections order. */
  index: number;
  /** Note ids, in the order the curriculum data records them. */
  prerequisites: string[];
};

export type GraphSequence = {
  id: string;
  number: number;
  title: string;
  question: string;
  summary: string;
  href: string;
  accent: string;
  noteIds: string[];
};

export type GraphData = {
  sequences: GraphSequence[];
  notes: GraphNote[];
  stats: {
    sequences: number;
    notes: number;
    membership: number;
    dependencies: number;
    crossSequenceDependencies: number;
  };
  provenance: string[];
};

const noteId = (section: number) => `stats-section-s${section}`;

export function prototypeGraph(): GraphData {
  const model = curriculum();
  const sections = new Map<number, SectionMeta>(SECTIONS.map((section) => [section.number, section]));
  const notes: GraphNote[] = [];
  const sequences: GraphSequence[] = [];
  const seen = new Set<string>();

  for (const journey of JOURNEYS) {
    const sequenceId = `seq:statistics:${journey.slug}`;
    const noteIds: string[] = [];
    journey.sections.forEach((number, index) => {
      const section = sections.get(number);
      if (!section) throw new Error(`Journey ${journey.slug} names unknown section ${number}`);
      if (section.journey !== journey.slug)
        throw new Error(`Section ${number} is declared under ${section.journey}, not ${journey.slug}`);
      const id = noteId(number);
      if (seen.has(id)) throw new Error(`Section ${number} belongs to more than one journey`);
      seen.add(id);
      const unit = model.byId.get(id);
      if (!unit) throw new Error(`Curriculum has no unit for section ${number} (${id})`);
      notes.push({
        id,
        section: number,
        title: section.titleEn,
        objectives: [...section.objectives],
        misconception: section.misconception,
        coverage: section.coverage,
        sourceNote: section.sourceNote ?? "",
        href: sectionHref(section),
        sequenceId,
        index: index + 1,
        prerequisites: unit.prerequisites.filter((prerequisite) => prerequisite.startsWith("stats-section-")),
      });
      noteIds.push(id);
    });
    sequences.push({
      id: sequenceId,
      number: journey.number,
      title: journey.title,
      question: journey.question,
      summary: journey.summary,
      href: journeyHref(journey.slug),
      accent: journey.accent,
      noteIds,
    });
  }

  const ids = new Set(notes.map((note) => note.id));
  for (const note of notes) {
    for (const prerequisite of note.prerequisites) {
      if (!ids.has(prerequisite))
        throw new Error(`${note.id} requires ${prerequisite}, which is not in this corpus`);
    }
  }

  const dependencies = notes.reduce((total, note) => total + note.prerequisites.length, 0);
  const crossSequenceDependencies = notes.reduce((total, note) => {
    const sequence = sequences.find((candidate) => candidate.id === note.sequenceId)!;
    return (
      total +
      note.prerequisites.filter((prerequisite) => {
        const other = notes.find((candidate) => candidate.id === prerequisite)!;
        return !sequence.noteIds.includes(other.id);
      }).length
    );
  }, 0);

  return {
    sequences,
    notes,
    stats: {
      sequences: sequences.length,
      notes: notes.length,
      membership: sequences.reduce((total, sequence) => total + sequence.noteIds.length, 0),
      dependencies,
      crossSequenceDependencies,
    },
    provenance: [
      "content/statistics/content.ts — JOURNEYS (sequence membership and order), SECTIONS (note titles, objectives, caveats)",
      "lib/curriculum/model.ts — curriculum() positions and reviewed prerequisites",
      "content/statistics/source.json — the original Notion sections behind every note",
    ],
  };
}
