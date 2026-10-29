// Geometry and honesty of the Act II field.
//
// These tests check the two things a canvas cannot check itself: that the
// projection maths is a camera (not a decorative transform), and that the graph
// only contains vertices and links that exist in public records.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  buildField,
  cameraFor,
  clamp01,
  clamp,
  DEFAULT_ORBIT,
  dust,
  lens,
  pickNode,
  project,
  renderField,
  smoothstep,
} from "../../lib/atlas/field.ts";
import { projectAtlas } from "../../lib/atlas/model.ts";
import { eligibleInsights } from "../../lib/knowledge/insights.ts";

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));

const editorial = readJson("content/atlas/editorial.json");
const extension = readJson("content/atlas/dp600-extension.json");
const continuation = readJson("content/atlas/dp600-continuation.json");
const dataset = {
  ...editorial,
  buildVersion: "test",
  concepts: [...editorial.concepts, ...extension.concepts, ...continuation.concepts],
  semanticEdges: [...editorial.semanticEdges, ...extension.semanticEdges, ...continuation.semanticEdges],
  sources: [...editorial.sources, ...extension.sources, ...continuation.sources],
  catalog: [...editorial.catalog, ...extension.catalog, ...continuation.catalog],
};
const feed = readJson("content/knowledge/insights.json");
const items = eligibleInsights(feed.items, true);

test("the public projection is still fail-closed, so the field carries no semantic edge", () => {
  const atlas = projectAtlas(dataset, false);
  assert.equal(atlas.semanticEdges.length, 0);
  const field = buildField(atlas, items);
  assert.equal(field.pending, true);
  assert.equal(field.links.filter((link) => link.kind === "semantic").length, 0);
  assert.equal(field.nodes.filter((node) => node.kind === "semantic").length, 0);
});

test("every vertex is an edition, a stated concept, or a real destination", () => {
  const field = buildField(projectAtlas(dataset, false), items);
  assert.equal(field.editions.length, items.length);
  assert.equal(field.nodes.filter((node) => node.kind === "edition").length, items.length);

  const realHrefs = new Set(
    items.flatMap((item) => [item.lessonHref, item.practiceHref, item.sourceUrl]),
  );
  const editionLinks = field.links.filter((link) => link.kind === "edition");
  assert.equal(editionLinks.length, 0, "no placeholder link kind");

  for (const node of field.nodes) {
    if (node.href === null) {
      assert.ok(
        node.kind === "concept" || node.kind === "semantic",
        `${node.id} has no destination and is not a concept`,
      );
      continue;
    }
    if (node.kind === "edition") {
      assert.match(node.href, /^\/\?insight=hansa-insight-[a-z0-9-]+#today$/);
    } else {
      assert.ok(realHrefs.has(node.href), `${node.id} points at ${node.href}, which no edition owns`);
    }
  }

  // Every link joins two vertices that exist.
  const ids = new Set(field.nodes.map((node) => node.id));
  for (const link of field.links) {
    assert.ok(ids.has(link.from), `${link.id} starts outside the field`);
    assert.ok(ids.has(link.to), `${link.id} ends outside the field`);
    assert.notEqual(link.from, link.to);
  }

  // Each edition reaches the concept it states and all three destinations.
  for (const item of items) {
    const mine = field.links.filter((link) => link.from === `edition:${item.id}`);
    assert.deepEqual(
      mine.map((link) => link.kind).sort(),
      ["concept", "lesson", "practice", "source"],
      `${item.id} is missing one of its real connections`,
    );
  }
});

test("shared destinations collapse into one vertex with several visitors", () => {
  const field = buildField(projectAtlas(dataset, false), items);
  const lessons = field.nodes.filter((node) => node.kind === "lesson");
  assert.equal(lessons.length, 1, "all three editions open the same lesson, so it is one vertex");
  const visitors = field.links.filter((link) => link.to === lessons[0].id);
  assert.equal(visitors.length, items.length);

  const sources = field.nodes.filter((node) => node.kind === "source");
  assert.equal(sources.length, 1);
  assert.equal(sources[0].href, "https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcuts");
});

test("the field is deterministic: two builds are identical", () => {
  const atlas = projectAtlas(dataset, false);
  const first = buildField(atlas, items);
  const second = buildField(atlas, items);
  assert.deepEqual(first, second);
  assert.ok(first.nodes.every((node) => node.position.every(Number.isFinite)));
});

test("a published projection would add its semantic layer instead of being invented", () => {
  // This uses the documented review projection — an explicit local argument,
  // not the landing's default — to prove the renderer is graph-driven.
  const reviewed = projectAtlas(dataset, true);
  assert.ok(reviewed.semanticEdges.length > 0);
  const field = buildField(reviewed, items);
  assert.equal(field.pending, false);
  assert.ok(field.links.some((link) => link.kind === "semantic"));
  const ids = new Set(field.nodes.map((node) => node.id));
  for (const edge of reviewed.semanticEdges) {
    if (!ids.has(edge.from) || !ids.has(edge.to)) continue;
    assert.ok(
      field.links.some((link) => link.id === edge.id),
      `published edge ${edge.id} was dropped`,
    );
  }
  // Concepts keep their authored map position rather than a random one.
  const concept = reviewed.concepts[0];
  const vertex = field.nodes.find((node) => node.id === concept.id);
  assert.ok(vertex);
  assert.equal(vertex.position[0], concept.position[0] * 0.34);
  assert.equal(vertex.position[2], concept.position[1] * 0.34);
});

test("the camera is a camera: dolly, orbit and perspective behave", () => {
  const viewport = { width: 1200, height: 800 };
  const near = cameraFor(0, DEFAULT_ORBIT);
  const far = cameraFor(1, DEFAULT_ORBIT);
  const distance = (camera) =>
    Math.hypot(
      camera.eye[0] - camera.target[0],
      camera.eye[1] - camera.target[1],
      camera.eye[2] - camera.target[2],
    );
  assert.ok(distance(near) < distance(far), "scrolling pulls the camera back");

  // A point at the target lands in the centre of the frame.
  const centre = project(far.target, far, viewport);
  assert.ok(Math.abs(centre.x - viewport.width / 2) < 0.001);
  assert.ok(Math.abs(centre.y - viewport.height / 2) < 0.001);

  // Depth makes nearer objects larger, and the ordering is strict. Both sample
  // points sit on the eye→target axis, so only depth differs.
  const toEye = Math.hypot(far.eye[0], far.eye[1], far.eye[2]);
  const unit = [far.eye[0] / toEye, far.eye[1] / toEye, far.eye[2] / toEye];
  const at = (k) => [unit[0] * k, unit[1] * k, unit[2] * k];
  const close = project(at(toEye * 0.72), far, viewport);
  const distant = project(at(toEye * 0.14), far, viewport);
  assert.ok(close.visible && distant.visible);
  assert.ok(close.scale > distant.scale);

  // Behind the camera is culled, not mirrored into the frame.
  const behind = project([near.eye[0] * 2, near.eye[1] * 2, near.eye[2] * 2], near, viewport);
  assert.equal(behind.visible, false);

  // Orbiting changes the eye without changing the distance.
  const orbited = cameraFor(1, { ...DEFAULT_ORBIT, yaw: 1.1 });
  assert.ok(Math.abs(distance(orbited) - distance(far)) < 1e-6);
  assert.notEqual(orbited.eye[0], far.eye[0]);

  // Zoom is distance, not scale.
  const zoomed = cameraFor(1, { ...DEFAULT_ORBIT, zoom: 2 });
  assert.ok(distance(zoomed) < distance(far));
});

test("render order, fog, lensing and picking are consistent", () => {
  const field = buildField(projectAtlas(dataset, false), items);
  const camera = cameraFor(0.6, DEFAULT_ORBIT);
  const viewport = { width: 1200, height: 800 };
  const frame = renderField(field, camera, viewport);
  assert.ok(frame.nodes.length > 0);
  assert.ok(frame.links.length > 0);

  for (let index = 1; index < frame.nodes.length; index += 1) {
    assert.ok(
      frame.nodes[index - 1].depth >= frame.nodes[index].depth,
      "nodes are painted far to near",
    );
  }
  for (const node of frame.nodes) {
    assert.ok(Number.isFinite(node.x) && Number.isFinite(node.y));
  }

  // Picking finds the vertex that was drawn in that place.
  const target = frame.nodes[0];
  const hit = pickNode(frame, { x: target.x, y: target.y });
  assert.equal(hit?.node.id, target.node.id);
  assert.equal(pickNode(frame, { x: -9999, y: -9999 }), null);

  // Lensing moves a point toward the pointer, and only near it.
  const point = { x: 100, y: 100 };
  const focus = { x: 140, y: 120 };
  const warped = lens(point, focus, 0.2, 300);
  assert.ok(warped.x > point.x && warped.y > point.y);
  const untouched = lens({ x: 1e6, y: 1e6 }, focus, 0.2, 300);
  assert.ok(Math.hypot(untouched.x - 1e6, untouched.y - 1e6) < 0.1);
});

test("helpers are bounded", () => {
  assert.equal(clamp(5, 0, 1), 1);
  assert.equal(clamp01(0.4), 0.4);
  assert.equal(smoothstep(0), 0);
  assert.equal(smoothstep(1), 1);
  assert.ok(smoothstep(0.5) > 0.4 && smoothstep(0.5) < 0.6);
  const first = dust(20, 3);
  const second = dust(20, 3);
  assert.deepEqual(first, second);
  assert.equal(first.length, 20);
});
