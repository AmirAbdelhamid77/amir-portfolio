'use client';
import Link from 'next/link';import {useEffect,useState,type ReactNode} from 'react';
/** Carry an activity choice through the static subject page without a dynamic server. */
export function StudyIntentLink({href,practice=false,className,children}:{href:string;practice?:boolean;className?:string;children:ReactNode}){const [inherited,setInherited]=useState(false);useEffect(()=>{queueMicrotask(()=>setInherited(new URL(location.href).searchParams.get('mode')==='question'));},[]);return <Link className={className} href={practice||inherited?href+(href.includes('?')?'&':'?')+'mode=question':href}>{children}</Link>;}
