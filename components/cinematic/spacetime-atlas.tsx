"use client";
// Act II — the field renderer.
//
// This is a real world-space scene, not a tilted DOM grid: every vertex has a
// 3D position, a perspective camera dollies through the field as the page
// scrolls, depth sorts the draw order, depth fog carries atmospheric
// perspective, and pointer picking uses the projected coordinates. It is drawn
// with the 2D canvas API rather than WebGL on purpose — the graph is small
// (tens of vertices), so a software-projected renderer costs less than a WebGL
// context, has no shader-compilation stall, no context-loss path, and works on
// a device with WebGL disabled. No dependency was added for it.
//
// Hard rules this file inherits from lib/atlas/field.ts and the Atlas spec:
//   - the canvas is never the only carrier of content (the inspector, the node
//     list and the pending-state panel are real DOM with real links);
//   - wheel is never intercepted, so the page always scrolls;
//   - vertical touch scrolling stays native (`touch-action: pan-y`);
//   - nothing is drawn for a semantic relation that the projection removed.

import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "motion/react";
import {
  cameraFor,
  clamp,
  clamp01,
  DEFAULT_ORBIT,
  dust,
  type Field,
  type FieldNode,
  type Orbit,
  type RenderFrame,
  pickNode,
  project,
  renderField,
} from "@/lib/atlas/field";
import { cn } from "@/lib/utils";
import type { ScrollReading } from "@/components/cinematic/use-scroll-progress";
import "./spacetime.css";

type Palette = {
  primary: string;
  foreground: string;
  background: string;
  warning: string;
  muted: string;
};

const PALETTE_FALLBACK: Palette = {
  primary: "#0b62b5",
  foreground: "#262626",
  background: "#ffffff",
  warning: "#b4791a",
  muted: "#7a7a7a",
};

function rgba(color: string, alpha: number) {
  const numbers = color.match(/[\d.]+/g);
  if (!numbers || numbers.length < 3) return `rgba(0, 0, 0, ${clamp01(alpha)})`;
  return `rgba(${numbers[0]}, ${numbers[1]}, ${numbers[2]}, ${clamp01(alpha)})`;
}

const WORLD_RADIUS: Record<FieldNode["kind"], number> = {
  edition: 1.15,
  concept: 1.35,
  semantic: 0.95,
  lesson: 0.72,
  practice: 0.72,
  source: 0.5,
};

export function SpacetimeAtlas({
  field,
  progress,
  selectedEditionId,
  onSelectEdition,
  conceptLabel,
}: {
  field: Field;
  progress: ScrollReading;
  selectedEditionId: string | null;
  onSelectEdition: (id: string) => void;
  conceptLabel: string;
}) {
  const reduce = useReducedMotion() ?? false;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const probeRef = useRef<HTMLDivElement | null>(null);
  const paletteRef = useRef<Palette>(PALETTE_FALLBACK);
  const frameRef = useRef<RenderFrame | null>(null);
  const sizeRef = useRef({ width: 1, height: 1 });
  const orbitRef = useRef<Orbit>({ ...DEFAULT_ORBIT });
  const selectedRef = useRef<string | null>(null);
  const hoverRef = useRef<string | null>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const dirtyRef = useRef(true);
  const readyRef = useRef(false);
  const trailRef = useRef<{ x: number; y: number; at: number }[]>([]);
  const dragRef = useRef({ active: false, x: 0, y: 0, travel: 0 });
  const dustRef = useRef(dust(96));
  const reduceRef = useRef(reduce);
  const nodesRef = useRef(field.nodes);
  const nodeById = useMemo(() => new Map(field.nodes.map((node) => [node.id, node])), [field.nodes]);
  const nodeByIdRef = useRef(nodeById);

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [selection, setSelection] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [zoom, setZoom] = useState(1);
  const [listOpen, setListOpen] = useState(false);
  const [hud, setHud] = useState({ yaw: 0, depth: 0 });

  const currentEditionNodeId = selectedEditionId ? `edition:${selectedEditionId}` : null;
  // Selection is derived, not synchronised: the edition chosen in Act I is the
  // resting selection, and a click on another vertex overrides it until the
  // edition changes. No effect copies a prop into state.
  const selectedId = selection ?? currentEditionNodeId;

  useEffect(() => {
    reduceRef.current = reduce;
    dirtyRef.current = true;
  }, [reduce]);

  useEffect(() => {
    selectedRef.current = selectedId;
    dirtyRef.current = true;
  }, [selectedId]);

  useEffect(() => {
    hoverRef.current = hoveredId;
    dirtyRef.current = true;
  }, [hoveredId]);

  useEffect(() => {
    // The canvas reads `progress.current` in its own loop; this only marks the
    // frame dirty so a still field repaints after a scroll jump.
    return progress.subscribe(() => {
      dirtyRef.current = true;
    });
  }, [progress]);

  useEffect(() => {
    orbitRef.current = { ...orbitRef.current, zoom };
    dirtyRef.current = true;
  }, [zoom]);

  useEffect(() => {
    nodesRef.current = field.nodes;
    nodeByIdRef.current = nodeById;
    dirtyRef.current = true;
  }, [field.nodes, nodeById]);

  // ------------------------------------------------------------------ render
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      setFailed(true);
      return;
    }

    let raf = 0;
    let visible = true;
    let pageVisible = document.visibilityState !== "hidden";

    // The site palette is authored in oklch(), which the 2D context cannot be
    // trusted to parse (and color-mix() it cannot parse at all). Paint one pixel
    // and read it back, so every colour handed to the canvas is plain sRGB.
    const scratch = document.createElement("canvas");
    scratch.width = 1;
    scratch.height = 1;
    const scratchContext = scratch.getContext("2d", { willReadFrequently: true });

    const readPalette = () => {
      const probe = probeRef.current;
      if (!probe) return;
      const read = (variable: string) => {
        probe.style.color = `var(${variable})`;
        const value = getComputedStyle(probe).color;
        probe.style.color = "";
        if (!value) return PALETTE_FALLBACK.foreground;
        if (!scratchContext) return value;
        scratchContext.clearRect(0, 0, 1, 1);
        scratchContext.fillStyle = "#000";
        scratchContext.fillStyle = value;
        scratchContext.fillRect(0, 0, 1, 1);
        const pixel = scratchContext.getImageData(0, 0, 1, 1).data;
        return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
      };
      paletteRef.current = {
        primary: read("--primary"),
        foreground: read("--foreground"),
        background: read("--background"),
        warning: read("--warning"),
        muted: read("--muted-foreground"),
      };
      dirtyRef.current = true;
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      const cap = width < 640 ? 1.5 : 2;
      const dpr = Math.min(window.devicePixelRatio || 1, cap);
      sizeRef.current = { width, height };
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      dustRef.current = dust(width < 640 ? 44 : 96);
      dirtyRef.current = true;
    };

    const draw = (time: number) => {
      const { width, height } = sizeRef.current;
      const palette = paletteRef.current;
      const orbit = orbitRef.current;
      const pointer = pointerRef.current;
      const calm = reduceRef.current;
      // A slow breathing orbit keeps the environment alive without moving any
      // reading surface; it is removed entirely under reduced motion.
      const drift = calm ? 0 : Math.sin(time / 6400) * 0.018;
      const camera = cameraFor(
        calm ? 1 : progress.current,
        { ...orbit, yaw: orbit.yaw + drift },
        nodeByIdRef.current.get(selectedRef.current ?? "")?.position ?? null,
      );
      const frame = renderField(field, camera, { width, height }, {
        pointer,
        lensStrength: pointer && !calm ? 0.05 : 0,
      });
      frameRef.current = frame;

      context.clearRect(0, 0, width, height);

      // Nebula behind the field: the environment the camera travels through.
      const core = project([0, 0, 0], camera, { width, height });
      const glow = context.createRadialGradient(
        core.x,
        core.y,
        0,
        core.x,
        core.y,
        Math.max(width, height) * 0.72,
      );
      glow.addColorStop(0, rgba(palette.primary, 0.16));
      glow.addColorStop(0.42, rgba(palette.primary, 0.05));
      glow.addColorStop(1, rgba(palette.primary, 0));
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      // Spacetime fabric: world-space rings, so camera rotation reads as
      // rotation rather than a background image sliding.
      context.lineWidth = 1;
      for (const [radius, alpha, dashed] of [
        [32, 0.2, false],
        [52, 0.15, true],
        [68, 0.1, true],
      ] as const) {
        context.beginPath();
        context.setLineDash(dashed ? [2, 6] : []);
        context.strokeStyle = rgba(palette.foreground, alpha);
        for (let step = 0; step <= 96; step += 1) {
          const angle = (step / 96) * Math.PI * 2;
          const point = project(
            [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
            camera,
            { width, height },
          );
          if (!point.visible) continue;
          if (step === 0) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        }
        context.stroke();
      }
      context.setLineDash([]);

      // Dust never carries meaning, so it is drawn first and left faint.
      for (const mote of dustRef.current) {
        const point = project([mote.x, mote.y, mote.z], camera, { width, height });
        if (!point.visible) continue;
        context.fillStyle = rgba(palette.foreground, 0.06);
        context.beginPath();
        context.arc(point.x, point.y, Math.min(1.4, Math.max(0.25, mote.size * point.scale * 0.012)), 0, Math.PI * 2);
        context.fill();
      }

      // Connections.
      for (const entry of frame.links) {
        const alpha = entry.alpha;
        if (alpha <= 0.01) continue;
        const touching =
          selectedRef.current === entry.link.from ||
          selectedRef.current === entry.link.to ||
          hoverRef.current === entry.link.from ||
          hoverRef.current === entry.link.to;
        const semantic = entry.link.kind === "semantic";
        context.beginPath();
        context.setLineDash(semantic ? [] : [3, 5]);
        context.strokeStyle = rgba(
          semantic ? palette.primary : palette.foreground,
          (touching ? 0.7 : semantic ? 0.36 : 0.15) * alpha,
        );
        context.lineWidth = touching ? 1.6 : semantic ? 1.2 : 0.9;
        entry.points.forEach((point, index) => {
          if (index === 0) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        });
        context.stroke();
      }
      context.setLineDash([]);

      // Temporal trail behind the focused vertex.
      const trail = trailRef.current;
      for (let index = 0; index < trail.length; index += 1) {
        const point = trail[index];
        const life = (index + 1) / trail.length;
        context.beginPath();
        context.fillStyle = rgba(palette.primary, 0.14 * life);
        context.arc(point.x, point.y, 1.5 + life * 5, 0, Math.PI * 2);
        context.fill();
      }

      const labelled: {
        node: FieldNode;
        x: number;
        y: number;
        radius: number;
        size: number;
      }[] = [];

      for (const entry of frame.nodes) {
        const node = entry.node;
        const alpha = entry.alpha;
        if (alpha <= 0.02) continue;
        const strong = node.kind === "edition" || node.kind === "concept";
        const radius = clamp(
          WORLD_RADIUS[node.kind] * entry.scale,
          strong ? 3.4 : 3,
          strong ? 18 : 13,
        );
        const active = selectedRef.current === node.id;
        const hot = hoverRef.current === node.id;
        const inside = entry.x > 4 && entry.x < width - 4 && entry.y > 4 && entry.y < height - 4;
        const colour =
          node.kind === "source"
            ? palette.warning
            : node.kind === "edition" || node.kind === "concept" || node.kind === "semantic"
              ? palette.primary
              : palette.foreground;

        if (active || hot) {
          const halo = context.createRadialGradient(entry.x, entry.y, 0, entry.x, entry.y, radius * 4.4);
          halo.addColorStop(0, rgba(colour, 0.42 * alpha));
          halo.addColorStop(1, rgba(colour, 0));
          context.fillStyle = halo;
          context.beginPath();
          context.arc(entry.x, entry.y, radius * 4.4, 0, Math.PI * 2);
          context.fill();
        }

        // Each kind has its own glyph, so the field is legible before the
        // labels resolve: an edition is a card (the object Act I dealt), a
        // concept is a ringed core, a source is a diamond, a destination is a
        // dot. The size is the projection's scale — nearer means bigger.
        if (node.kind === "edition" && radius > 4.5) {
          const cardWidth = radius * 2.1;
          const cardHeight = radius * 2.75;
          const x = entry.x - cardWidth / 2;
          const y = entry.y - cardHeight / 2;
          context.beginPath();
          context.roundRect(x, y, cardWidth, cardHeight, Math.min(7, radius * 0.4));
          context.fillStyle = rgba(colour, 0.9 * alpha);
          context.fill();
          context.beginPath();
          context.strokeStyle = rgba(palette.foreground, 0.35 * alpha);
          context.lineWidth = 1;
          context.roundRect(x, y, cardWidth, cardHeight, Math.min(7, radius * 0.4));
          context.stroke();
          if (radius > 12 && node.badge) {
            context.fillStyle = rgba(palette.background, 0.86 * alpha);
            context.font = "600 8px ui-monospace, SFMono-Regular, Menlo, monospace";
            context.textAlign = "center";
            context.fillText(node.badge, entry.x, entry.y + 3);
            context.textAlign = "start";
          }
        } else if (node.kind === "concept" || node.kind === "semantic") {
          context.beginPath();
          context.fillStyle = rgba(colour, 0.94 * alpha);
          context.arc(entry.x, entry.y, radius, 0, Math.PI * 2);
          context.fill();
          context.beginPath();
          context.strokeStyle = rgba(colour, 0.55 * alpha);
          context.lineWidth = 1.2;
          context.arc(entry.x, entry.y, radius + 5, 0, Math.PI * 2);
          context.stroke();
          context.beginPath();
          context.strokeStyle = rgba(colour, 0.28 * alpha);
          context.arc(entry.x, entry.y, radius + 11, 0, Math.PI * 2);
          context.stroke();
        } else if (node.kind === "source") {
          const size = radius * 1.45;
          context.beginPath();
          context.moveTo(entry.x, entry.y - size);
          context.lineTo(entry.x + size, entry.y);
          context.lineTo(entry.x, entry.y + size);
          context.lineTo(entry.x - size, entry.y);
          context.closePath();
          context.fillStyle = rgba(colour, 0.9 * alpha);
          context.fill();
        } else {
          context.beginPath();
          context.fillStyle = rgba(colour, 0.82 * alpha);
          context.arc(entry.x, entry.y, radius, 0, Math.PI * 2);
          context.fill();
          context.beginPath();
          context.strokeStyle = rgba(colour, 0.4 * alpha);
          context.lineWidth = 1;
          context.arc(entry.x, entry.y, radius + 3.5, 0, Math.PI * 2);
          context.stroke();
        }

        if (active) trailRef.current.push({ x: entry.x, y: entry.y, at: time });
        // Every vertex in frame is a candidate for a label; the collision pass
        // below decides which ones actually get room.
        if (inside) {
          const halfWidth = node.kind === "edition" && radius > 4.5 ? radius * 1.15 : radius;
          labelled.push({ node, x: entry.x, y: entry.y, radius: halfWidth, size: radius });
        }
      }

      trailRef.current = trailRef.current.filter((point) => time - point.at < 700);
      if (trailRef.current.length > 26) trailRef.current.splice(0, trailRef.current.length - 26);

      // Labels last, so nothing is painted over them. A greedy rectangle test
      // keeps the field legible: the first label wins the space, and a vertex
      // that cannot be labelled is still selectable and still in the list.
      context.textBaseline = "middle";
      context.textAlign = "start";
      const placed: { left: number; top: number; right: number; bottom: number }[] = [];
      labelled
        .sort((a, b) => {
          const rank = (entry: { node: FieldNode }) =>
            selectedRef.current === entry.node.id || hoverRef.current === entry.node.id ? 1 : 0;
          return rank(b) - rank(a) || b.size - a.size;
        })
        .slice(0, 18)
        .forEach(({ node, x, y, radius }) => {
          const active = selectedRef.current === node.id || hoverRef.current === node.id;
          const text = node.short;
          context.font = `${active ? 600 : 500} ${active ? 12 : 10.5}px ui-sans-serif, system-ui, sans-serif`;
          const textWidth = context.measureText(text).width;
          // Prefer the right of the vertex, but flip to its left when the label
          // would be clipped by the canvas edge. A clamped label would otherwise
          // lose its first or last characters.
          const preferred = x + radius + 7;
          const flipped = preferred + textWidth > width - 6;
          const boxX = flipped
            ? Math.max(6, x - radius - 7 - textWidth)
            : preferred;
          const boxY = clamp(y, 8, height - 24) + 9;
          const box = {
            left: boxX - 2,
            top: boxY - 8,
            right: boxX + textWidth + 2,
            bottom: boxY + 8,
          };
          const collides = placed.some(
            (entry) =>
              box.left < entry.right &&
              box.right > entry.left &&
              box.top < entry.bottom &&
              box.bottom > entry.top,
          );
          if (collides && !active) return;
          placed.push(box);
          context.fillStyle = rgba(palette.foreground, active ? 0.94 : 0.62);
          context.fillText(text, boxX, boxY);
        });

      // The semantic layer is honestly labelled when nothing is published.
      if (field.pending) {
        context.font = "500 10px ui-monospace, SFMono-Regular, Menlo, monospace";
        context.fillStyle = rgba(palette.muted, 0.9);
        context.textAlign = "center";
        context.fillText(
          "semantic relations · awaiting human publication review",
          width / 2,
          height - 16,
        );
        context.textAlign = "start";
      }

      if (!readyRef.current) {
        readyRef.current = true;
        setReady(true);
      }
    };

    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || !pageVisible) return;
      // Without animation the field only redraws when something changed.
      if (reduceRef.current && !dirtyRef.current) return;
      dirtyRef.current = false;
      draw(time);
    };

    const resizeObserver = new ResizeObserver(() => resize());
    const intersection = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible = entry.isIntersecting;
        dirtyRef.current = true;
      },
      { threshold: 0.01 },
    );
    const theme = new MutationObserver(() => readPalette());
    const visibility = () => {
      pageVisible = document.visibilityState !== "hidden";
      dirtyRef.current = true;
    };

    resize();
    readPalette();
    resizeObserver.observe(wrap);
    intersection.observe(wrap);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    document.addEventListener("visibilitychange", visibility);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersection.disconnect();
      theme.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      trailRef.current = [];
    };
  }, [field, reduce, progress]);

  // The HUD is decorative and must not drive renders on every frame: it follows
  // the reading but only re-renders when the integer percentage changes.
  useEffect(() => {
    const sync = () =>
      setHud((previous) => {
        const depth = progress.current;
        if (Math.round(previous.depth * 100) === Math.round(depth * 100)) {
          return previous;
        }
        return { yaw: orbitRef.current.yaw, depth };
      });
    sync();
    return progress.subscribe(sync);
  }, [progress, zoom]);

  // --------------------------------------------------------------- selection
  const selectNode = useCallback(
    (node: FieldNode) => {
      setSelection(node.id);
      setMessage(`${node.label}. ${node.meta}.`);
      if (node.kind === "edition") onSelectEdition(node.id.slice("edition:".length));
    },
    [onSelectEdition],
  );

  const nodeAt = useCallback((clientX: number, clientY: number) => {
    const wrap = wrapRef.current;
    const frame = frameRef.current;
    if (!wrap || !frame) return null;
    const rect = wrap.getBoundingClientRect();
    return pickNode(frame, { x: clientX - rect.left, y: clientY - rect.top });
  }, []);

  const onPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = { active: true, x: event.clientX, y: event.clientY, travel: 0 };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (rect) pointerRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    dirtyRef.current = true;
    if (dragRef.current.active) {
      const dx = event.clientX - dragRef.current.x;
      const dy = event.clientY - dragRef.current.y;
      dragRef.current.x = event.clientX;
      dragRef.current.y = event.clientY;
      dragRef.current.travel += Math.abs(dx) + Math.abs(dy);
      const orbit = orbitRef.current;
      orbitRef.current = {
        ...orbit,
        yaw: orbit.yaw - dx * 0.006,
        pitch: clamp(orbit.pitch + dy * 0.005, -0.45, 1.05),
      };
      return;
    }
    if (event.pointerType === "mouse") {
      const hit = nodeAt(event.clientX, event.clientY);
      setHoveredId((previous) => (previous === (hit?.node.id ?? null) ? previous : hit?.node.id ?? null));
    }
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const dragged = dragRef.current.travel > 6;
    dragRef.current.active = false;
    if (dragged) return;
    const hit = nodeAt(event.clientX, event.clientY);
    if (hit) selectNode(hit.node);
    else setSelection(null);
  };

  const onPointerLeave = () => {
    pointerRef.current = null;
    dragRef.current.active = false;
    setHoveredId(null);
    dirtyRef.current = true;
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const orbit = orbitRef.current;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      orbitRef.current = { ...orbit, yaw: orbit.yaw + (event.key === "ArrowLeft" ? 0.12 : -0.12) };
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      orbitRef.current = {
        ...orbit,
        pitch: clamp(orbit.pitch + (event.key === "ArrowUp" ? 0.08 : -0.08), -0.45, 1.05),
      };
    } else if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      setZoom((value) => clamp(Number((value + 0.12).toFixed(2)), 0.65, 1.9));
    } else if (event.key === "-") {
      event.preventDefault();
      setZoom((value) => clamp(Number((value - 0.12).toFixed(2)), 0.65, 1.9));
    } else {
      return;
    }
    dirtyRef.current = true;
  };

  const reset = () => {
    orbitRef.current = { ...DEFAULT_ORBIT };
    setZoom(1);
    setSelection(null);
    dirtyRef.current = true;
    setMessage("View reset to the opening camera.");
  };

  const shown =
    (hoveredId ? field.nodes.find((node) => node.id === hoveredId) : null) ??
    field.nodes.find((node) => node.id === selectedId) ??
    null;
  const link = shown?.href ?? null;

  const description = `Spatial field of ${field.nodes.length} knowledge vertices and ${field.links.length} connections, centred on ${conceptLabel}. The field list below repeats every vertex as a real control.`;

  return (
    <div className="atlas-field" data-pending={field.pending ? "true" : "false"}>
      <div
        ref={wrapRef}
        className="atlas-field-canvas"
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="group"
        aria-label="Spatial knowledge field"
        aria-describedby="atlas-field-help"
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={description}
          className={cn("atlas-canvas", !ready && "opacity-0")}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerLeave}
        />
        <div ref={probeRef} aria-hidden="true" className="atlas-probe" />

        {!ready && !failed ? (
          <div aria-hidden="true" className="atlas-boot">
            <span />
            <span />
            <span />
          </div>
        ) : null}

        {failed ? (
          <p className="atlas-failed">
            This browser could not open a drawing surface, so the field is shown as
            the list below. Every vertex, link and destination is still available.
          </p>
        ) : null}

        <div className="atlas-hud" aria-hidden="true">
          <span>camera dolly {Math.round(hud.depth * 100)}%</span>
          <span>orbit {Math.round((hud.yaw * 180) / Math.PI)}°</span>
          <span>zoom {zoom.toFixed(2)}×</span>
        </div>
      </div>

      <div className="atlas-side">
        <div className="atlas-controls" role="group" aria-label="Atlas view controls">
          <button type="button" onClick={() => setZoom((value) => clamp(Number((value - 0.12).toFixed(2)), 0.65, 1.9))} aria-label="Zoom out of the field">−</button>
          <button type="button" onClick={() => setZoom((value) => clamp(Number((value + 0.12).toFixed(2)), 0.65, 1.9))} aria-label="Zoom into the field">+</button>
          <button type="button" onClick={() => { orbitRef.current = { ...orbitRef.current, yaw: orbitRef.current.yaw - 0.35 }; dirtyRef.current = true; setHud({ yaw: orbitRef.current.yaw, depth: progress.current }); }} aria-label="Rotate the field left">↺</button>
          <button type="button" onClick={() => { orbitRef.current = { ...orbitRef.current, yaw: orbitRef.current.yaw + 0.35 }; dirtyRef.current = true; setHud({ yaw: orbitRef.current.yaw, depth: progress.current }); }} aria-label="Rotate the field right">↻</button>
          <button type="button" onClick={reset}>Reset view</button>
          <button type="button" onClick={() => setListOpen((open) => !open)} aria-expanded={listOpen} aria-controls="atlas-node-list">
            {listOpen ? "Hide node list" : "List the vertices"}
          </button>
        </div>

        <p id="atlas-field-help" className="atlas-help">
          Drag to orbit, or use the arrow keys while the field is focused. The page
          keeps scrolling: the wheel is never captured. Scroll position drives the
          camera dolly.
        </p>
      </div>

      <div className="atlas-inspector" aria-live="polite">
        {shown ? (
          <>
            <p className="atlas-inspector-kind">
              {shown.kind === "edition"
                ? "Edition"
                : shown.kind === "concept"
                  ? "Concept named by the edition"
                  : shown.kind === "semantic"
                    ? "Published concept"
                    : shown.kind === "source"
                      ? "Source"
                      : shown.kind === "practice"
                        ? "Practice"
                        : "Lesson"}{" "}
              · {shown.meta}
            </p>
            <p className="atlas-inspector-title">{shown.label}</p>
            <p className="atlas-inspector-detail">{shown.detail}</p>
            <div className="atlas-inspector-actions">
              {link ? (
                <a
                  href={link}
                  {...(shown.external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                >
                  {shown.kind === "edition"
                    ? "Open this edition"
                    : shown.kind === "source"
                      ? "Open the Microsoft Learn source"
                      : shown.kind === "practice"
                        ? "Open practice"
                        : "Open the lesson"}
                </a>
              ) : null}
              {shown.kind === "edition" ? (
                <button
                  type="button"
                  onClick={() => {
                    onSelectEdition(shown.id.slice("edition:".length));
                    document.getElementById("today")?.scrollIntoView({
                      behavior: reduce ? "auto" : "smooth",
                      block: "start",
                    });
                  }}
                >
                  Read its situation
                </button>
              ) : null}
            </div>
          </>
        ) : (
          <p className="atlas-inspector-detail">
            Select a vertex to read what it is and where it goes. Connections are
            drawn only from records that are already public.
          </p>
        )}
        <p role="status" className="sr-only">
          {message}
        </p>
      </div>

      <div id="atlas-node-list" className="atlas-list" hidden={!listOpen}>
        <ul aria-label="Knowledge field vertices">
          {field.nodes.map((node) => (
            <li key={node.id}>
              <button
                type="button"
                aria-current={selectedId === node.id ? "true" : undefined}
                onClick={() => selectNode(node)}
              >
                <span className="atlas-list-kind">{node.kind}</span>
                <span>{node.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <p>
          {field.pending
            ? "The semantic relation layer is not published, so this list carries no claim about how concepts depend on each other. It carries the editions, the concept each one states, and the real lesson, practice and source destinations."
            : "Every vertex and every connection below comes from the published Atlas projection."}
        </p>
      </div>
    </div>
  );
}
