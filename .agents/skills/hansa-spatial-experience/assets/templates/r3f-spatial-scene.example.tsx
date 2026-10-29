/**
 * EDUCATIONAL ARCHITECTURE EXAMPLE, NOT DROP-IN Hansa code.
 * Requires audited, compatible dependencies: react, three, @react-three/fiber and @react-three/drei.
 * This file has NOT been compiled or browser tested in Hansa.
 */
'use client';
import { useEffect, useMemo, useState } from 'react';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { GraphModel } from './semantic-graph-model.example';
import { seedPosition, validateGraph } from './semantic-graph-model.example';

function SceneObjects({model, selectedId, onSelect}: {
  model: GraphModel;
  selectedId: string|null;
  onSelect: (id:string)=>void;
}) {
  // Example only: a high-node-count graph should use instancing and explicit
  // overlap/label/edge/LOD strategies rather than a mesh for every item.
  const positions=useMemo(()=>new Map(model.concepts.map(c=>[c.id,seedPosition(c.id)] as const)),[model]);
  return <>
    <ambientLight intensity={0.55}/>
    <directionalLight position={[5,7,5]} intensity={1.2}/>
    {model.concepts.map(concept => {
      const selected=selectedId===concept.id;
      const position=positions.get(concept.id)!;
      return <mesh key={concept.id} position={position}
        onClick={(ev:ThreeEvent<MouseEvent>)=>{ev.stopPropagation();onSelect(concept.id)}}>
        <sphereGeometry args={[selected ? 0.33 : 0.25,24,16]}/>
        <meshStandardMaterial color={selected?'#68d9c2':'#5b9da5'} roughness={0.5} metalness={0.1}/>
      </mesh>;
    })}
    <OrbitControls enablePan={false} minDistance={3.5} maxDistance={13}/>
  </>;
}

export function SpatialGraphExample({model}: {model:GraphModel}) {
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [useVisual,setUseVisual]=useState(false);
  const [reduced,setReduced]=useState(true);
  const errors=useMemo(()=>validateGraph(model),[model]);
  useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync=()=>setReduced(media.matches);
    sync();media.addEventListener('change',sync);
    return ()=>media.removeEventListener('change',sync);
  },[]);
  const selected=model.concepts.find(c=>c.id===selectedId);
  // Real app must also add WebGL failure/context-loss fallback and SSR/client boundary.
  return <section aria-label="Knowledge model">
    {errors.length>0 ? <p role="alert">Graph needs source verification: {errors.join('; ')}</p> : <>
      <button type="button" onClick={()=>setUseVisual(v=>!v)}>{useVisual?'Hide spatial view':'Explore spatial view'}</button>
      {useVisual&&!reduced&&<div aria-hidden="true" style={{height:340}}>
        <Canvas frameloop="demand" camera={{position:[0,0,10],fov:50}}>
          <SceneObjects model={model} selectedId={selectedId} onSelect={setSelectedId}/>
        </Canvas>
      </div>}
      <nav aria-label="Concepts"><ul>{model.concepts.map(c=><li key={c.id}>
        <button type="button" aria-pressed={selectedId===c.id} onClick={()=>setSelectedId(c.id)}>{c.label}</button>
      </li>)}</ul></nav>
      {selected&&<section aria-live="polite"><h3>{selected.label}</h3><p>{selected.summary}</p>
        <p>Source references: {selected.sourceRefs.join(', ')}</p></section>}
    </>}
  </section>;
}
