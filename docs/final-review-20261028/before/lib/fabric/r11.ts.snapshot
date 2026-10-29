// R11 is a separate scientific overlay, never an overwrite of imported source keys.
export type R11Block = {
  kind: string; title?: string; headers?: string[]; rows?: (string | number)[][];
  content?: string; description?: string; labels?: Record<string, string>; language?: string;
};
export type R11Answer = string | string[];
export type R11Question = {
  id: string; hansaId: string; sourceId: string; type: string; stem: string;
  options?: { letter: string; text: string; code?: string }[];
  blanks?: { label: string; options: string[]; answer: string }[];
  statements?: { text: string; answer: string }[];
  drag?: { items: string[]; reuse: boolean; targets: { label: string; answer: string }[] };
  semanticVisuals: R11Block[]; caseStudy?: string | null;
  gradingEnabled: boolean; scientificStatus: string; r10Status: string;
  reviewNote: string; remaining: string; explanation: string; answer?: string | null;
  officialAnswer: string; refs: { title: string; url: string }[];
  original: { type: string; officialAnswer: string; answer?: string; stem: string;
    blanks?: { label: string; options: string[]; answer: string }[];
    statements?: { text: string; answer: string }[];
    drag?: { targets: { label: string; answer: string }[] }; explanation: string };
};
export type R11Study = { id: string; name: string; text: string; semanticVisuals?: R11Block[] };
export const R11_STORAGE_KEY = "hansa-dp600-r11-progress-v1";
export const R11_REVISION = "r11-20261026.1";
export type R11Progress = Record<string, { answer: R11Answer; revealed: boolean; checked: boolean }>;
export function r11Approved(q: R11Question) {
  return q.gradingEnabled === true && q.scientificStatus === "APPROVED_CORRECTED";
}
export function r11Expected(q: R11Question): R11Answer {
  if (q.type === "hotspot-dropdown") return (q.blanks ?? []).map(b => b.answer);
  if (q.type === "hotspot-yesno") return (q.statements ?? []).map(b => b.answer);
  if (q.type === "dragdrop") return (q.drag?.targets ?? []).map(t => t.answer);
  if (q.type === "multi") return (q.answer ?? "").replace(/[^A-Za-z]/g, "").split("");
  return q.answer ?? "";
}
export function r11Complete(q: R11Question, answer: R11Answer) {
  if (["mcq", "mcq-image", "yesno"].includes(q.type)) return typeof answer === "string" && !!q.options?.some(o => o.letter === answer);
  if (!Array.isArray(answer)) return false;
  if (q.type === "multi") return answer.length > 0 && new Set(answer).size === answer.length && answer.every(v => q.options?.some(o => o.letter === v));
  if (q.type === "hotspot-dropdown") return !!q.blanks?.length && answer.length === q.blanks.length && q.blanks.every((b, i) => b.options.includes(answer[i]));
  if (q.type === "hotspot-yesno") return !!q.statements?.length && answer.length === q.statements.length && q.statements.every((_, i) => answer[i] === "Yes" || answer[i] === "No");
  if (q.type === "dragdrop") return !!q.drag?.targets.length && answer.length === q.drag.targets.length && q.drag.targets.every((_, i) => q.drag!.items.includes(answer[i])) && (q.drag.reuse || new Set(answer).size === answer.length);
  return false;
}
export function gradeR11(q: R11Question, answer: R11Answer): boolean | null {
  if (!r11Approved(q) || !r11Complete(q, answer)) return null;
  const expected = r11Expected(q);
  if (typeof expected === "string") return answer === expected;
  if (!Array.isArray(answer) || answer.length !== expected.length) return false;
  return q.type === "multi" ? expected.every(v => answer.includes(v)) : expected.every((v, i) => answer[i] === v);
}
export function parseR11Progress(raw: string | null): R11Progress | null {
  if (raw === null) return {};
  if (raw.length > 500000) return null;
  try {
    const d = JSON.parse(raw);
    if (!d || d.version !== 1 || d.revision !== R11_REVISION || !d.questions || typeof d.questions !== "object" || Array.isArray(d.questions) || Object.keys(d.questions).length > 222) return null;
    const result: R11Progress = {};
    for (const [id, value] of Object.entries(d.questions)) {
      const n = Number(id.slice(3));
      if (!/^T1Q[1-9]\d{0,2}$/.test(id) || n > 222 || !value || typeof value !== "object") return null;
      const v = value as R11Progress[string];
      if (typeof v.revealed !== "boolean" || typeof v.checked !== "boolean") return null;
      if (typeof v.answer === "string" ? v.answer.length > 5000 : !Array.isArray(v.answer) || v.answer.length > 60 || v.answer.some(s => typeof s !== "string" || s.length > 5000)) return null;
      result[id] = { answer: Array.isArray(v.answer) ? [...v.answer] : v.answer, revealed: v.revealed, checked: v.checked };
    }
    return result;
  } catch { return null; }
}
