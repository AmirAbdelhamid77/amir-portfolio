import {Fragment,type ReactNode} from 'react';
import Image from 'next/image';
import index from '@/content/sql/index.json';

export type SqlBlock={type:string;text?:string;level?:number;anchor?:string;language?:string;href?:string;source?:string;path?:string|null;ordered?:boolean;items?:string[];rows?:string[][]};
export function sourceHref(url:string){
 if(!/^(?:https?:\/\/|\/[^/]|#)/i.test(url))return null;
 const id=url.match(/(?:notion\.com\/p\/|notion\.so\/)([a-f0-9-]{32,36})/i)?.[1]?.replace(/-/g,'');
 // A Notion block fragment has no exported local anchor mapping. Keep the
 // original deep link instead of silently dropping the requested block.
 if(url.includes('#'))return url;
 return index.pages.find(p=>p.id===id)?.href??url;
}
export function SqlInline({text}:{text:string}){
 const tokens=text.split(/(<code>[\s\S]*?<\/code>|<b>[\s\S]*?<\/b>|<i>[\s\S]*?<\/i>|\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g);
 return <>{tokens.map((t,i)=>{let node:ReactNode=t.replace(/\\([_*])/g,'$1');if(t.startsWith('<code>'))node=<code dir="ltr">{t.slice(6,-7)}</code>;else if(t.startsWith('<b>'))node=<strong><SqlInline text={t.slice(3,-4)}/></strong>;else if(t.startsWith('<i>'))node=<em><SqlInline text={t.slice(3,-4)}/></em>;else if(t.startsWith('**'))node=<strong>{t.slice(2,-2)}</strong>;else if(t.startsWith('`'))node=<code dir="ltr">{t.slice(1,-1)}</code>;else {const m=t.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);if(m){const href=sourceHref(m[2]);node=href?<a href={href}>{m[1]}</a>:m[1];}}return <Fragment key={i}>{node}</Fragment>;})}</>;
}
const language=(text:string)=>/[\u0600-\u06ff]/.test(text)?'ar':undefined;
export function SqlSource({blocks}:{blocks:SqlBlock[]}){return <div className="sql-source">{blocks.map((b,i)=>{
 const props={dir:'auto' as const,lang:language(b.text??'')};
 if(b.type==='heading'){const Tag=(b.level===2?'h2':b.level===3?'h3':'h4');return <Tag key={i} id={b.anchor} {...props}><SqlInline text={b.text??''}/></Tag>;}
 if(b.type==='code'){const code=<pre dir="ltr" tabIndex={0}><code>{b.text}</code></pre>;return b.language==='mermaid'?<details key={i} className="sql-diagram-source"><summary>Source diagram notation — text alternative</summary>{code}</details>:<figure key={i}><figcaption>{b.language||'Source trace'} · Source example; no execution claimed</figcaption>{code}</figure>;}
 if(b.type==='table')return <div key={i} className="sql-table-scroll" role="region" aria-label={'Source table '+(i+1)} tabIndex={0}><table><caption>Source comparison</caption><thead><tr>{b.rows?.[0]?.map((c,j)=><th scope="col" key={j}><SqlInline text={c}/></th>)}</tr></thead><tbody>{b.rows?.slice(1).map((row,j)=><tr key={j}>{row.map((c,k)=><td key={k} dir="auto"><SqlInline text={c}/></td>)}</tr>)}</tbody></table></div>;
 if(b.type==='list'){const Tag=b.ordered?'ol':'ul';return <Tag key={i}>{b.items?.map((t,j)=><li key={j} dir="auto" lang={language(t)}><SqlInline text={t}/></li>)}</Tag>;}
 if(b.type==='quote')return <blockquote key={i} {...props}><SqlInline text={b.text??''}/></blockquote>;
 if(b.type==='link'){const href=sourceHref(b.href??'');return href?<p key={i}><a href={href}>{index.pages.find(p=>p.href===href)?.title??b.text} ↗</a></p>:<p key={i}>{b.text}</p>;}
  if(b.type==='image'){
   const original=b.path?<a href={b.path}><Image src={b.path} alt={b.path.endsWith('sql-window-frame.jpg')?'Original window-frame figure with an incorrect bracket spanning all seven rows; use the corrected table.':'Original SQL teaching figure; the adjacent source explanation and diagram notation provide its text alternative.'} width={1792} height={1008} loading="lazy"/></a>:<p>Source image unavailable locally. <code>{b.source}</code></p>;
   if(b.path?.endsWith('sql-window-frame.jpg'))return <figure key={i}><div className="sql-table-scroll" role="region" aria-label="Corrected window frame" tabIndex={0}><table><caption>Corrected source fixture: current row day 5; ROWS 2 PRECEDING through CURRENT ROW</caption><thead><tr><th scope="col">Day</th><th scope="col">Sales</th><th scope="col">Frame membership</th></tr></thead><tbody>{[10,20,15,30,25,40,35].map((sales,j)=><tr key={j}><td>Day {j+1}{j===4?' (current)':''}</td><td>{sales}</td><td>{j>=2&&j<=4?'Included':'Outside frame'}</td></tr>)}</tbody></table></div><figcaption>Days 3–5 contribute 15 + 30 + 25 = 70. This is a source illustrative example.</figcaption><details><summary>Original source figure — incorrect frame bracket</summary>{original}</details></figure>;
   return <figure key={i}>{original}<figcaption>Original source figure. Use the accompanying explanation for the concept.</figcaption></figure>;
  }
 if(b.type==='rule')return <hr key={i}/>;
 return <p key={i} {...props}><SqlInline text={b.text??''}/></p>;
 })}</div>;}
