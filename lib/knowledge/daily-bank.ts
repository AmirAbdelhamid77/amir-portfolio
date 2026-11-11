// Freeze membership and version for each released bank.
export type BankEntry = {
  id: string;
  reviewStatus: string;
  sourceReviewed: boolean;
  scientificallyVerified: boolean;
  publicationApproved: boolean;
};
export type BankRelease<T extends BankEntry> = {
  version: string;
  startsOn: string; // YYYY-MM-DD in the product's chosen civil timezone.
  items: readonly T[];
};
function dayNumber(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error('Expected YYYY-MM-DD');
  const time = Date.parse(day + 'T00:00:00Z');
  if (!Number.isFinite(time) || new Date(time).toISOString().slice(0,10) !== day)
    throw new Error('Invalid civil date');
  return time / 86400000;
}
const cairoDateFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit',
});
export function cairoDay(instant: Date) {
  const parts = cairoDateFormat.formatToParts(instant);
  const get = (name: string) => parts.find(p => p.type === name)!.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
function seedHash(text: string) {
  let value = 2166136261;
  for (let i=0;i<text.length;i++) value = Math.imul(value ^ text.charCodeAt(i),16777619);
  return value >>> 0;
}
export function shuffleDailyBank<T extends { id: string }>(version: string, items: readonly T[]): T[] {
  if (!version.trim()) throw new Error('A frozen bank version is required');
  const ids = items.map(x=>x.id);
  if (ids.some(id=>!id.trim()) || new Set(ids).size!==ids.length) throw new Error('Invalid or duplicate insight ID');
  const deck = [...items].sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
  // Deterministic Fisher-Yates: stable across reloads and input ordering.
  // Repeating this same shuffled deck prevents repeats in any N-day window.
  let state=seedHash(version+'\n'+deck.map(x=>x.id).join('\n'));
  const random=()=>{state=(state+0x6D2B79F5)|0;let t=state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
  for(let i=deck.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
  return deck;
}

export function dailyBankEntry<T extends BankEntry>(release: BankRelease<T>, day: string): T | undefined {
  const offset = dayNumber(day) - dayNumber(release.startsOn);
  // Validate all IDs even when a record is outside the published deck.
  const ids = release.items.map(item => item.id);
  if (ids.some(id => !id.trim()) || new Set(ids).size !== ids.length) throw new Error('Invalid or duplicate insight ID');
  const deck = shuffleDailyBank(release.version, release.items.filter(item =>
    item.reviewStatus === 'published' && item.sourceReviewed === true && item.scientificallyVerified === true && item.publicationApproved === true,
  ));
  return offset >= 0 && deck.length ? deck[offset % deck.length] : undefined;
}

export const LIVE_DAILY_START = '2026-11-11';

export function liveDailyGroup<T>(deck: readonly T[], date: string): T[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  const time = new Date(date + 'T00:00:00Z');
  if (!Number.isFinite(time.valueOf()) || time.toISOString().slice(0, 10) !== date) return [];
  const offset = dayNumber(date) - dayNumber(LIVE_DAILY_START);
  if (offset < 0 || deck.length < 6) return [];
  const first = (offset * 3) % deck.length;
  return [deck[first], deck[(first + 1) % deck.length], deck[(first + 2) % deck.length]];
}
