import type { Concept, Edge } from "./model.ts";

// Text, not graph degree or selection, determines size. Keep canonical data intact.
export function circleLabel(concept: Concept) {
  const words = concept.mapLabel.join(" ").split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  for (const word of words) {
    // Split unusually long tokens without silently dropping any label characters.
    for (const part of word.match(/.{1,15}/gu) ?? []) {
      const last = lines.length - 1;
      if (last >= 0 && lines[last].length + part.length + 1 <= 15) lines[last] += " " + part;
      else lines.push(part);
    }
  }
  const fontSize = lines.length > 3 ? 14 : 16;
  const halfWidth = Math.max(0, ...lines.map(line => line.length)) * fontSize * .32;
  const halfHeight = (lines.length - 1) / 2 * 19 + 18;
  const radius = Math.max(62, Math.ceil(Math.hypot(halfWidth, halfHeight)) + 8);
  return { lines, fontSize, radius };
}

export function circleLayout(concepts: Concept[], availableWidth: number) {
  const width = Math.max(280, Math.floor(availableWidth));
  const columns = Math.max(1, Math.min(4, Math.floor(width / 210)));
  const rowHeight = 220;
  const nodes = concepts.map((concept, index) => ({
    ...concept, ...circleLabel(concept),
    position: [width / columns * (index % columns + .5), 110 + Math.floor(index / columns) * rowHeight],
  }));
  return { nodes, width, height: Math.max(280, Math.ceil(nodes.length / columns) * rowHeight) };
}

export function circleEndpoints(a: { position: number[]; radius: number }, b: { position: number[]; radius: number }) {
  const dx = b.position[0] - a.position[0], dy = b.position[1] - a.position[1];
  const distance = Math.hypot(dx, dy) || 1;
  return { x1: a.position[0] + dx / distance * (a.radius + 5), y1: a.position[1] + dy / distance * (a.radius + 5),
    x2: b.position[0] - dx / distance * (b.radius + 10), y2: b.position[1] - dy / distance * (b.radius + 10) };
}

export function circleState(id: string, selected: string, edges: Edge[]) {
  if (id === selected) return "Selected";
  if (edges.some(edge => edge.from === selected && edge.to === id && edge.relationType === "requires_understanding_of")) return "Prerequisite";
  if (edges.some(edge => (edge.from === selected && edge.to === id) || (edge.to === selected && edge.from === id))) return "Related";
  return "Context";
}
