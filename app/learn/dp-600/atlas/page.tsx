import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { HubHeader } from "@/components/fabric/ui";
import { AtlasExplorer } from "@/components/atlas/explorer";
import { AtlasPendingDesk } from "@/components/atlas/pending-desk";
import { CollectionShelf } from "@/components/learn/collection-shelf";
import { getAtlas, getAtlasReadingSources } from "@/lib/atlas/server";
export const metadata: Metadata = { title: "Knowledge Atlas — Fabric decisions", description: "Explore documented semantic connections between Fabric data access and movement concepts.", alternates: { canonical: "/learn/dp-600/atlas/" } };
export default function AtlasPage() { const atlas=getAtlas();return <><HubHeader eyebrow="DP-600 · Knowledge Atlas" title="Follow the idea. Understand the connection." description="Explore the evidence and keep each claim attached to its conditions. The reading room remains open while semantic publication is reviewed."/><Container className="max-w-[1500px] py-8">{atlas.concepts.length?<AtlasExplorer atlas={atlas}/>:<AtlasPendingDesk sources={getAtlasReadingSources()} notice={atlas.notice}/>}<CollectionShelf context="atlas" /></Container></>; }
