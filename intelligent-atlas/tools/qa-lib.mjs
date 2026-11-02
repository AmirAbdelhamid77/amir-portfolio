// Shared helpers for the recovered Knowledge Stage review prototype.
//
// These scripts drive the locally installed Microsoft Edge through
// playwright-core against the file:// prototype. No network, no build and no
// deployment. Raw frames and receipts stay under intelligent-atlas/.
import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";
import sharp from "sharp";

export const TOOLS_DIR = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(TOOLS_DIR, "..");
export const PROTOTYPE_URL = pathToFileURL(path.join(ROOT, "prototype", "index.html")).href;
export const PUBLIC_URL = pathToFileURL(path.join(ROOT, "public", "index.html")).href;
export const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
export const EVIDENCE = path.join(ROOT, "evidence", "recovery");
export const ANALYSIS = path.join(ROOT, "analysis");

export const nowIso = () => new Date().toISOString();

export const ensureDir = (directory) => mkdir(directory, { recursive: true });

export const writeJson = async (file, value) => {
  await ensureDir(path.dirname(file));
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

export const launchBrowser = () => chromium.launch({ executablePath: EDGE, headless: true });

export const newContext = (browser, options = {}) =>
  browser.newContext({
    viewport: options.viewport ?? { width: 1440, height: 960 },
    reducedMotion: options.reducedMotion ?? "no-preference",
    colorScheme: options.colorScheme ?? "light",
    hasTouch: options.hasTouch ?? false,
  });

export const attachErrors = (page, sink, label = "") => {
  page.on("console", (message) => {
    if (message.type() === "error") sink.push(`${label}${message.text()}`);
  });
  page.on("pageerror", (error) => sink.push(`${label}${error.message}`));
};

export const openPrototype = async (page, query = "?theme=light") => {
  await page.goto(`${PROTOTYPE_URL}${query}`, { waitUntil: "load" });
  await page.waitForFunction(() => Boolean(window.__ATLAS_STAGE__), { timeout: 15000 });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });
  await page.waitForTimeout(260);
};

export const settle = async (page, ms = 320) => {
  await page.evaluate(() => document.getElementById("toast")?.classList.remove("is-visible"));
  await page.waitForTimeout(ms);
};

export const state = (page) => page.evaluate(() => window.__ATLAS_STAGE__.getState());

export const api = (page, fn, ...args) =>
  page.evaluate(({ fn, args }) => window.__ATLAS_STAGE__[fn](...args), { fn, args });

export const setProgress = async (page, progress) => {
  await page.evaluate((value) => {
    const track = document.getElementById("journey-track");
    const stage = document.getElementById("stage");
    const top = track.getBoundingClientRect().top + window.scrollY;
    const travel = Math.max(1, track.offsetHeight - stage.offsetHeight);
    window.scrollTo(0, Math.round(top + value * travel));
  }, progress);
  await page.waitForTimeout(140);
};

export const sceneOpacity = (page) =>
  page.evaluate(() => {
    const read = (id) => Number(getComputedStyle(document.querySelector(`#${id} .stage-inner`)).opacity);
    const veil = (id) => Number(getComputedStyle(document.querySelector(`#${id}`), "::before").opacity);
    return {
      progress: window.__ATLAS_STAGE__.getProgress(),
      scene: window.__ATLAS_STAGE__.getScene(),
      timeline: read("scene-timeline"),
      knowledge: read("scene-knowledge"),
      closing: read("scene-closing"),
      timelineVeil: veil("scene-timeline"),
      knowledgeVeil: veil("scene-knowledge"),
      closingVeil: veil("scene-closing"),
    };
  });

export const layoutSnapshot = (page) =>
  page.evaluate(() => {
    const canvas = document.getElementById("field-canvas").getBoundingClientRect();
    const nodes = [...document.querySelectorAll(".nb-node")].map((node) => {
      const r = node.getBoundingClientRect();
      return {
        label: node.querySelector(".nb-node-label")?.textContent ?? "",
        x: r.x,
        y: r.y,
        right: r.right,
        bottom: r.bottom,
        w: r.width,
        h: r.height,
      };
    });
    const center = document.querySelector(".nb-center")?.getBoundingClientRect();
    const overlaps = [];
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        if (a.x < b.right && b.x < a.right && a.y < b.bottom && b.y < a.bottom) {
          overlaps.push(`${a.label}/${b.label}`);
        }
      }
      if (
        center &&
        nodes[i].x < center.right &&
        center.x < nodes[i].right &&
        nodes[i].y < center.bottom &&
        center.y < nodes[i].bottom
      ) {
        overlaps.push(`${nodes[i].label}/center`);
      }
    }
    const clipped = nodes
      .filter((n) => n.x < canvas.x - 1 || n.right > canvas.right + 1 || n.y < canvas.y - 1 || n.bottom > canvas.bottom + 1)
      .map((n) => n.label);
    return {
      canvas: { x: canvas.x, y: canvas.y, width: canvas.width, height: canvas.height },
      center: center
        ? { x: center.x, y: center.y, right: center.right, bottom: center.bottom, w: center.width, h: center.height }
        : null,
      nodes,
      overlaps,
      clipped,
      listMode: document.getElementById("field").classList.contains("is-list-layout"),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });

export const overflow = (page) =>
  page.evaluate(() => ({
    documentScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    innerWidth: window.innerWidth,
    overflowX:
      document.documentElement.scrollWidth > window.innerWidth + 1 || document.body.scrollWidth > window.innerWidth + 1,
  }));

export const screenshot = async (page, directory, name) => {
  await ensureDir(directory);
  await page.screenshot({ path: path.join(directory, name), fullPage: false });
  return path.join(directory, name);
};

export class Results {
  constructor(id) {
    this.id = id;
    this.checks = [];
  }

  add(id, pass, detail = "", status) {
    this.checks.push({ id, status: status ?? (pass ? "PASS" : "FAIL"), detail });
  }

  pass(id, detail = "") {
    this.add(id, true, detail);
  }

  fail(id, detail = "") {
    this.add(id, false, detail);
  }

  blocked(id, detail = "") {
    this.add(id, false, detail, "BLOCKED");
  }

  notRun(id, detail = "") {
    this.add(id, false, detail, "NOT RUN");
  }

  get failures() {
    return this.checks.filter((check) => check.status === "FAIL");
  }

  get counts() {
    return this.checks.reduce(
      (counts, check) => {
        counts[check.status] = (counts[check.status] ?? 0) + 1;
        return counts;
      },
      { PASS: 0, FAIL: 0, BLOCKED: 0, "NOT RUN": 0 },
    );
  }

  receipt(extra = {}) {
    return {
      suite: this.id,
      at: nowIso(),
      counts: this.counts,
      checks: this.checks,
      ...extra,
    };
  }
}

export const recordScreencast = async (page, action, outputDirectory, prefix, options = {}) => {
  await ensureDir(outputDirectory);
  // Remove frames from an earlier run so the raw sequence matches this receipt.
  const stale = (await readdir(outputDirectory)).filter(
    (name) => name.startsWith(`${prefix}-`) && name.endsWith(".png"),
  );
  await Promise.all(stale.map((name) => unlink(path.join(outputDirectory, name))));
  const client = await page.context().newCDPSession(page);
  const captured = [];
  const onFrame = async (event) => {
    captured.push({ data: event.data, timestamp: event.metadata.timestamp });
    try {
      await client.send("Page.screencastFrameAck", { sessionId: event.sessionId });
    } catch {
      /* the session may close while the last frame is in flight */
    }
  };
  client.on("Page.screencastFrame", onFrame);
  await client.send("Page.startScreencast", {
    format: "png",
    maxWidth: options.maxWidth ?? 960,
    maxHeight: options.maxHeight ?? 640,
    everyNthFrame: options.everyNthFrame ?? 1,
  });
  try {
    await action();
    await page.waitForTimeout(options.tail ?? 350);
  } finally {
    await client.send("Page.stopScreencast").catch(() => {});
    client.off("Page.screencastFrame", onFrame);
    await client.detach().catch(() => {});
  }

  const files = [];
  for (let index = 0; index < captured.length; index += 1) {
    const file = path.join(outputDirectory, `${prefix}-${String(index).padStart(3, "0")}.png`);
    await writeFile(file, Buffer.from(captured[index].data, "base64"));
    files.push(file);
  }
  const delays = captured.map((frame, index) => {
    const next = captured[index + 1];
    if (!next) return 120;
    return Math.max(20, Math.min(240, Math.round((next.timestamp - frame.timestamp) * 1000)));
  });
  return { files, delays, captured };
};

/* Flat-frame guard: a near-uniform frame means the viewport showed only the
 * page background. The recovered stage must never produce one. */
export const frameStats = async (files) => {
  const rows = [];
  for (const file of files) {
    const stats = await sharp(file).resize(160, 106, { fit: "fill" }).grayscale().stats();
    rows.push({
      file: path.basename(file),
      mean: Number(stats.channels[0].mean.toFixed(1)),
      stdev: Number(stats.channels[0].stdev.toFixed(1)),
    });
  }
  return rows;
};

export const gifFromPngs = async (frames, output, options = {}) => {
  if (!frames.length) throw new Error("No frames to encode");
  const width = options.width ?? 720;
  const height = options.height ?? 480;
  const delays = options.delays ?? frames.map(() => 100);
  const raws = [];
  for (const frame of frames) {
    raws.push(
      await sharp(frame)
        .resize(width, height, { fit: "cover" })
        .removeAlpha()
        .raw()
        .toBuffer(),
    );
  }
  const stacked = Buffer.concat(raws);
  const gif = await sharp(stacked, {
    raw: { width, height: height * frames.length, channels: 3, pageHeight: height },
  })
    .gif({ delay: delays, loop: options.loop ?? 0 })
    .toBuffer();
  await ensureDir(path.dirname(output));
  await writeFile(output, gif);
  return { bytes: gif.length, frames: frames.length, width, height };
};
