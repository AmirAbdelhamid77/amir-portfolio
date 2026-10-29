export type AddedQuestion = {
  id: string; sourceId: string; sourceRecords: string[]; exam: string;
  stemHtml: string; contextHtml: string; explanationHtml: string;
  mode: string; options: { id: string; text: string }[];
  controls: { id: string; label: string; options: string[]; answer: string }[];
  answers: string[]; images: { src: string; caption: string }[];
  revealImages?: { src: string; caption: string }[];
  refs: { title: string; url: string }[]; blockers: string[]; review: string;
};
export const ADDITIONS_KEY = "hansa-question-additions-v1";
export type AddedProgress = Record<string, { values: Record<string, string>; checked: boolean }>;
export function parseAddedProgress(raw: string | null): AddedProgress | null {
  if (raw === null) return {};
  if (raw.length > 500000) return null;
  try {
    const d = JSON.parse(raw);
    if (d.version !== 1 || !d.questions || typeof d.questions !== "object" || Array.isArray(d.questions) || Object.keys(d.questions).length > 600) return null;
    const result: AddedProgress = {};
    for (const [id, value] of Object.entries(d.questions)) {
      const v = value as { values: Record<string, string>; checked: boolean };
      if (!/^new-[a-z0-9-]{1,100}$/.test(id) || !v || typeof v.checked !== "boolean" || !v.values || Array.isArray(v.values) || typeof v.values !== "object" || Object.keys(v.values).length > 100 || Object.entries(v.values).some(([k,s]) => !/^[a-zA-Z0-9_-]{1,100}$/.test(k) || typeof s !== "string" || s.length > 3000)) return null;
      result[id] = { values: { ...v.values }, checked: v.checked };
    }
    return result;
  } catch { return null; }
}
export function gradeAdded(q: AddedQuestion, values: Record<string, string>) {
  if (q.blockers.length) return null;
  if (q.mode === "controls") {
    if (!q.controls.length || q.controls.some(c => !values[c.id] || !c.options.includes(values[c.id]))) return null;
    return q.controls.every(c => values[c.id] === c.answer);
  }
  const ids = q.options.filter(o => values[o.id] === "1").map(o => o.id);
  if (!ids.length || (q.mode === "single" && ids.length !== 1)) return null;
  return ids.length === q.answers.length && ids.every(id => q.answers.includes(id));
}
export function additionSource(id: string) {
  return id.startsWith("new-json-") ? "Reviewed source export" : id.startsWith("new-litware-") ? "Litware case study" : id.startsWith("new-mixed-") ? "Fabric scenarios" : "Study Hub";
}
