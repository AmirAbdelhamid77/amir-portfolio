import {notFound} from 'next/navigation';
import {SQL_CANONICAL} from '@/lib/sql/registry';
import {SqlLesson} from '@/components/sql/lesson';
export const dynamicParams=false;
export function generateStaticParams(){return SQL_CANONICAL.map(p=>({module:String(p.module).padStart(2,'0')}));}
export async function generateMetadata({params}:{params:Promise<{module:string}>}){const {module}=await params,p=SQL_CANONICAL.find(p=>String(p.module).padStart(2,'0')===module);return {title:p?.title,description:p?.objective,alternates:{canonical:p?.href}};}
export default async function Page({params}:{params:Promise<{module:string}>}){const {module}=await params,p=SQL_CANONICAL.find(p=>String(p.module).padStart(2,'0')===module);if(!p)notFound();return <SqlLesson id={p.id}/>;}
