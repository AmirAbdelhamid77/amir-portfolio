import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { HubHeader } from "@/components/fabric/ui";
import { AtlasExplorer } from "@/components/atlas/explorer";
import { getAtlas } from "@/lib/atlas/server";
export const metadata: Metadata = { title: "Knowledge Atlas — Fabric decisions", description: "Explore documented semantic connections between Fabric data access and movement concepts.", alternates: { canonical: "/learn/dp-600/atlas/" } };
export default function AtlasPage() { return <><HubHeader eyebrow="DP-600 · Knowledge Atlas" title="Follow the idea. Understand the connection." description="A focused map of ingestion concepts, with the conditions and sources behind every relationship. Start with a concept; the ordinary lesson stays one step away."/><Container className="max-w-[1500px] py-8"><AtlasExplorer atlas={getAtlas()}/></Container></>; }
