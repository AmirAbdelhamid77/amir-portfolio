import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { circleLayout, circleEndpoints, circleState } from '../../lib/atlas/circle-layout.ts';
const layers = ['editorial','dp600-extension','dp600-continuation'].map(name => JSON.parse(readFileSync('content/atlas/'+name+'.json','utf8')));
const concepts = layers.flatMap(layer => layer.concepts), edges = layers.flatMap(layer => layer.semanticEdges);
test('all 42 labels fit nonoverlapping circles at narrow and wide widths without mutating source positions', () => {
  const before = JSON.stringify(concepts);
  for (const width of [280,320,390,500,800,1200]) {
    const layout = circleLayout(concepts,width);
    for (const node of layout.nodes) {
      assert.ok(node.position[0] - node.radius - 12 >= 0);
      assert.ok(node.position[0] + node.radius + 12 <= layout.width);
      // Conservative text envelope including the state label, inside the circle.
      const halfWidth = Math.max(...node.lines.map(line=>line.length)) * node.fontSize * .32;
      const halfHeight = (node.lines.length - 1)/2 * 19 + 18;
      assert.ok(Math.hypot(halfWidth,halfHeight) < node.radius, node.title);
      for (const other of layout.nodes) if (other !== node) assert.ok(Math.hypot(node.position[0]-other.position[0],node.position[1]-other.position[1]) > node.radius + other.radius + 24);
    }
  }
  assert.equal(JSON.stringify(concepts),before);
});
test('edge endpoints terminate outside each circle for horizontal, vertical and diagonal links', () => {
  for(const position of [[220,0],[0,220],[220,220]]) {
    const a={position:[0,0],radius:62},b={position,radius:84};
    const line=circleEndpoints(a,b);
    assert.ok(Math.abs(Math.hypot(line.x1,line.y1)-67)<1e-8);
    assert.ok(Math.abs(Math.hypot(line.x2-b.position[0],line.y2-b.position[1])-94)<1e-8);
  }
});
test('prerequisite state uses explicit outgoing understanding edges only, with selection precedence', () => {
  const edge=edges.find(e=>e.relationType==='requires_understanding_of'); assert.ok(edge);
  assert.equal(circleState(edge.from,edge.from,edges),'Selected');
  assert.equal(circleState(edge.to,edge.from,edges),'Prerequisite');
  assert.notEqual(circleState(edge.from,edge.to,[edge]),'Prerequisite');
  assert.equal(circleState('unconnected',edge.from,edges),'Context');
});
