// Pure scheduling preparation; not imported by the live homepage.
// Freeze approved membership and version for each released bank.
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
export function cairoDay(instant: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(instant);
  const get = (name: string) => parts.find(p => p.type === name)!.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
function seedHash(text: string) {
  let value = 2166136261;
  for (let i=0;i<text.length;i++) value = Math.imul(value ^ text.charCodeAt(i),16777619);
  return value >>> 0;
}
export function dailyBankEntry<T extends BankEntry>(release: BankRelease<T>, day: string): T | undefined {
  if (!release.version.trim()) throw new Error('A frozen bank version is required');
  const offset = dayNumber(day) - dayNumber(release.startsOn);
  const ids = release.items.map(x=>x.id);
  if (ids.some(id=>!id.trim()) || new Set(ids).size!==ids.length) throw new Error('Invalid or duplicate insight ID');
  const deck = release.items.filter(x=>x.reviewStatus==='published' && x.sourceReviewed===true && x.scientificallyVerified===true && x.publicationApproved===true)
    .sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
  if (!deck.length || offset<0) return undefined;
  // Deterministic Fisher-Yates: stable across reloads and input ordering.
  // Repeating this same shuffled deck prevents repeats in any N-day window.
  let state=seedHash(release.version+'\n'+deck.map(x=>x.id).join('\n'));
  const random=()=>{state=(state+0x6D2B79F5)|0;let t=state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
  for(let i=deck.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
  return deck[offset % deck.length];
}
