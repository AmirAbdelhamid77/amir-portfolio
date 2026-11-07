// Render-normalized text for locating passages split across inline markup.
export function sourceText(value) {
 if(typeof value==='string')return value;
 if(Array.isArray(value))return value.map(sourceText).join(' ');
 if(!value||typeof value!=='object')return '';
 if(Array.isArray(value.inline))return value.inline.map(x=>x.text??x.math??'').join('');
 return Object.values(value).map(sourceText).join(' ');
}
// Preserve SQL inequalities while removing actual presentation markup.
export const normalizedText = value => sourceText(value).replace(/<\/?(?:code|b|strong|em|i|p|br|span|div|a|ul|ol|li|h[1-6])(?:\s+[^<>]*?)?\/?>/gi,'').replace(/\s+/g,' ').trim();
export function locateEvidence(value,excerpt,pointer='') {
 if(!normalizedText(value).includes(normalizedText(excerpt)))return null;
 if(value&&typeof value==='object')for(const [key,child] of Object.entries(value)){
  const match=locateEvidence(child,excerpt,pointer+'/'+key.replace(/~/g,'~0').replace(/\//g,'~1'));
  if(match)return match;
 }
 return {pointer,excerpt,matching:'render-normalized local text'};
}
