import {notFound} from 'next/navigation';
import {SQL_INDEX} from '@/lib/sql/registry';
import {SqlLesson} from '@/components/sql/lesson';
export const dynamicParams=false;
export function generateStaticParams(){return SQL_INDEX.pages.filter(p=>p.module===null).map(p=>({id:p.id}));}
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params,p=SQL_INDEX.pages.find(p=>p.id===id&&p.module===null);return {title:p?.title,alternates:{canonical:p?.href}};}
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params,p=SQL_INDEX.pages.find(p=>p.id===id&&p.module===null);if(!p)notFound();return <SqlLesson id={p.id}/>;}
