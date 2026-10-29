"use client";
import { useEffect, useState } from "react";
export function AtlasReturnLink() {
  const [href,setHref]=useState("");
  useEffect(()=>{const v=new URLSearchParams(location.search).get("atlasReturn");if(v?.startsWith("/learn/dp-600/atlas/?")&&!v.includes("\\")&&v.length<2048)Promise.resolve().then(()=>setHref(v));},[]);
  return href?<a className="my-4 inline-block min-h-11 rounded-xl border border-border-strong p-3 text-sm text-primary" href={href}>Return to your Atlas view</a>:null;
}
