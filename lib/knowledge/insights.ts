export type Insight = {
  id: string; date: string; topic: string; title: string; scenario: string;
  prediction: string; takeaway: string; caveat: string; cardTitle: string;
  conceptId: string; lessonHref: string; practiceHref: string;
  sourceId: string; sourceUrl: string; sourceLocator: string; checkedAt: string;
  reviewStatus: string; reviewer: string; questionIds: string[];
};
// Public feed is fail-closed. Preview is an explicit caller decision, never a
// URL parameter or a mutation of Atlas/question-bank review status.
export function eligibleInsights(items: Insight[], preview = false): Insight[] {
  return items.filter(item =>
    (item.reviewStatus === "published" || (preview && item.reviewStatus === "technical_review")) &&
    /^hansa-insight-[a-z0-9-]+$/.test(item.id) &&
    /^\d{4}-\d{2}-\d{2}$/.test(item.date) && item.checkedAt && item.reviewer &&
    item.sourceUrl.startsWith("https://learn.microsoft.com/") &&
    item.sourceLocator && item.scenario && item.takeaway && item.caveat
  ).sort((a,b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}
export function searchInsights(items: Insight[], query: string, topic = "all") {
  const q = query.trim().toLocaleLowerCase();
  return items.filter(item => (topic === "all" || item.topic === topic) &&
    [item.title,item.scenario,item.takeaway,item.caveat,item.topic,item.cardTitle].join(" ").toLocaleLowerCase().includes(q));
}
export function selectedInsight(items: Insight[], id: string | null) {
  return items.find(item => item.id === id) ?? items[0];
}
