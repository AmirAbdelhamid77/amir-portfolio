import {StudyDirectory} from '@/components/study/directory';import {SUBJECTS} from '@/lib/study/taxonomy';
export const dynamicParams=false;export function generateStaticParams(){return SUBJECTS.map(s=>({subject:s.id}));}
export async function generateMetadata({params}:{params:Promise<{subject:string}>}){const {subject}=await params;const s=SUBJECTS.find(s=>s.id===subject)!;return {title:s.title+' — learning topics',description:s.goal,alternates:{canonical:`/study/${subject}/`}};}
export default async function Page({params}:{params:Promise<{subject:string}>}){return <StudyDirectory subject={(await params).subject}/>;}
