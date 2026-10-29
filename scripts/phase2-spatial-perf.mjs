// Phase 2 spatial narrative — lab performance measurement.
//
//   node scripts/phase2-spatial-perf.mjs [--port 4394]
//
// Starts the static export on a local server, then measures, for each viewport:
//   1. load: LCP, CLS, JS transfer bytes, long tasks
//   2. hero idle: frame pacing with no scene running
//   3. atlas idle: frame pacing while the canvas loop is live (the real cost)
//   4. scroll: frame pacing through a scripted hero -> atlas travel
//   5. interaction: Event Timing durations for the dealer and the orbit keys
//   6. reduced motion: pacing and draw count with the loop skipping unchanged
//      frames
//
// Everything is synthetic and local. This is NOT field Core Web Vitals, NOT a
// physical handset, and NOT a GPU profile. Results go to
// docs/cinematic-spatial/evidence/performance.json.
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { chromium } from "playwright-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const PORT = Number(portIndex === -1 ? 4394 : args[portIndex + 1]);
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.resolve("docs/cinematic-spatial/evidence");
const SAMPLES = 3;
const CPU_SLOWDOWN = 4;

await mkdir(OUT, { recursive: true });

const server = spawn(process.execPath, ["scripts/serve-out.mjs", String(PORT)], {
  stdio: ["ignore", "pipe", "pipe"],
});
server.stdout.on("data", () => {});
server.stderr.on("data", () => {});

async function waitForServer() {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(`${BASE}/`)).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`server never answered on :${PORT}`);
}

const browser = await chromium.launch({ executablePath: EDGE, headless: true });

const INIT = () => {
  window.lab = { lcp: 0, cls: 0, longTasks: [], events: [] };
  try {
    localStorage.setItem("amir-theme", "dark");
  } catch {}
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.lab.lcp = entry.startTime;
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) window.lab.cls += entry.value;
    }
  }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      window.lab.longTasks.push({ start: entry.startTime, duration: entry.duration });
    }
  }).observe({ type: "longtask", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      window.lab.events.push({ name: entry.name, duration: entry.duration });
    }
  }).observe({ type: "event", buffered: true, durationThreshold: 16 });
};

const PACING = (frames) => {
  window.pacing = [];
  let last = performance.now();
  return new Promise((resolve) => {
    function tick(now) {
      window.pacing.push(now - last);
      last = now;
      if (window.pacing.length < frames) requestAnimationFrame(tick);
      else resolve(window.pacing);
    }
    requestAnimationFrame(tick);
  });
};

function summarize(frames) {
  const sorted = frames.slice().sort((a, b) => a - b);
  const at = (q) => Number(sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))].toFixed(2));
  return {
    frames: sorted.length,
    p50: at(0.5),
    p95: at(0.95),
    worst: Number(sorted[sorted.length - 1].toFixed(2)),
    over34ms: sorted.filter((n) => n > 34).length,
    over50ms: sorted.filter((n) => n > 50).length,
  };
}

const results = [];

try {
  await waitForServer();

  for (const width of [390, 768, 1440]) {
    for (let sample = 0; sample < SAMPLES; sample += 1) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        deviceScaleFactor: 1,
        hasTouch: width < 900,
        isMobile: width < 900,
      });
      await context.addInitScript(INIT);
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU_SLOWDOWN });
      await cdp.send("Network.enable");
      await cdp.send("Network.emulateNetworkConditions", {
        offline: false,
        latency: 75,
        downloadThroughput: 1_600_000 / 8,
        uploadThroughput: 750_000 / 8,
      });

      await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60_000 });
      await page.waitForTimeout(1200);

      const load = await page.evaluate(() => {
        const resources = performance.getEntriesByType("resource");
        const js = resources.filter((entry) => /\.js(\?|$)/.test(entry.name));
        const navigation = performance.getEntriesByType("navigation")[0];
        return {
          lcp: Math.round(window.lab.lcp),
          cls: Number(window.lab.cls.toFixed(4)),
          longTasks: window.lab.longTasks.length,
          longTaskMs: Math.round(window.lab.longTasks.reduce((sum, task) => sum + task.duration, 0)),
          jsFiles: js.length,
          jsBytes: js.reduce((sum, entry) => sum + (entry.transferSize || entry.encodedBodySize || 0), 0),
          jsRawBytes: js.reduce((sum, entry) => sum + (entry.decodedBodySize || 0), 0),
          totalResources: resources.length,
          domNodes: document.querySelectorAll("*").length,
          domInteractive: Math.round(navigation.domInteractive),
          domComplete: Math.round(navigation.domComplete),
        };
      });

      // Hero idle: what the page costs before the spatial scene is live.
      const heroFrames = await page.evaluate(PACING, 120);

      // Atlas idle: the canvas loop is running and the stage is pinned.
      await page.evaluate(() => {
        const section = document.querySelector(".cine-atlas");
        window.scrollTo({
          top: Math.round(window.scrollY + section.getBoundingClientRect().top + section.offsetHeight * 0.45),
          behavior: "instant",
        });
      });
      await page.waitForTimeout(900);
      const atlasFrames = await page.evaluate(PACING, 150);
      const canvasState = await page.evaluate(() => {
        const canvas = document.querySelector("canvas.atlas-canvas");
        if (!canvas) return null;
        return {
          width: canvas.width,
          height: canvas.height,
          cssWidth: Math.round(canvas.getBoundingClientRect().width),
          cssHeight: Math.round(canvas.getBoundingClientRect().height),
          dpr: Number((canvas.width / canvas.getBoundingClientRect().width).toFixed(3)),
        };
      });

      // Scroll travel: hero -> handoff -> atlas, driven one step per frame.
      const scrollFrames = await page.evaluate(async () => {
        const section = document.querySelector(".cine-atlas");
        const from = Math.max(0, Math.round(window.scrollY + section.getBoundingClientRect().top - window.innerHeight * 1.4));
        window.scrollTo({ top: from, behavior: "instant" });
        await new Promise((resolve) => setTimeout(resolve, 400));
        const gaps = [];
        let last = performance.now();
        const total = window.innerHeight * 1.9;
        const steps = 90;
        let step = 0;
        await new Promise((resolve) => {
          function tick(now) {
            gaps.push(now - last);
            last = now;
            step += 1;
            window.scrollBy(0, total / steps);
            if (step < steps) requestAnimationFrame(tick);
            else resolve();
          }
          requestAnimationFrame(tick);
        });
        return gaps.slice(1);
      });

      // Interaction: deal two more cards, then orbit with the keyboard.
      await page.evaluate(() => {
        const section = document.querySelector(".cine-atlas");
        window.scrollTo({ top: Math.round(window.scrollY + section.getBoundingClientRect().top), behavior: "instant" });
      });
      await page.waitForTimeout(500);
      const deal = await page.evaluate(async () => {
        const button = [...document.querySelectorAll("button")].find((node) =>
          /^Deal \d+ more$/.test(node.textContent.trim()),
        );
        if (!button) return { skip: true };
        const started = performance.now();
        button.click();
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return { clickToNextPaint: Math.round(performance.now() - started) };
      });
      const orbit = await page.evaluate(async () => {
        const field = document.querySelector(".atlas-field-canvas");
        if (!field) return { skip: true };
        field.focus();
        const started = performance.now();
        field.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        return { keyToNextPaint: Math.round(performance.now() - started) };
      });
      const events = await page.evaluate(() => window.lab.events);

      results.push({
        width,
        sample,
        widthKind: width < 900 ? "mobile (adapted, not reduced)" : width < 1200 ? "tablet" : "desktop",
        load,
        canvas: canvasState,
        hero: summarize(heroFrames),
        atlas: summarize(atlasFrames),
        scroll: summarize(scrollFrames),
        deal,
        orbit,
        interactionEvents: events,
      });

      await context.close();
      console.log(
        `sampled ${width}px #${sample}: atlas p95 ${results.at(-1).atlas.p95}ms, scroll p95 ${
          results.at(-1).scroll.p95
        }ms, LCP ${load.lcp}ms, JS ${(load.jsBytes / 1024).toFixed(1)}KB`,
      );
    }
  }

  // Reduced motion: the loop must skip unchanged frames and cost almost nothing.
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
      hasTouch: width < 900,
      isMobile: width < 900,
    });
    await context.addInitScript(INIT);
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU_SLOWDOWN });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60_000 });
    await page.waitForTimeout(900);
    await page.evaluate(() => {
      const section = document.querySelector(".cine-atlas");
      window.scrollTo({
        top: Math.round(window.scrollY + section.getBoundingClientRect().top + section.offsetHeight * 0.45),
        behavior: "instant",
      });
    });
    await page.waitForTimeout(900);
    const frames = await page.evaluate(PACING, 150);
    const draws = await page.evaluate(async () => {
      const canvas = document.querySelector("canvas.atlas-canvas");
      if (!canvas) return null;
      const context2d = canvas.getContext("2d");
      let count = 0;
      const original = context2d.clearRect.bind(context2d);
      context2d.clearRect = (...parameters) => {
        count += 1;
        return original(...parameters);
      };
      await new Promise((resolve) => setTimeout(resolve, 1000));
      context2d.clearRect = original;
      return count;
    });
    results.push({
      width,
      sample: "reduced",
      widthKind: "reduced motion",
      reducedFrames: summarize(frames),
      drawsPerSecond: draws,
    });
    await context.close();
    console.log(`reduced ${width}px: p95 ${summarize(frames).p95}ms, canvas clears/sec ${draws}`);
  }
} finally {
  await browser.close();
  server.kill();
}

const byWidth = {};
for (const width of [390, 768, 1440]) {
  const rows = results.filter((row) => row.width === width && row.sample !== "reduced");
  if (!rows.length) continue;
  const median = (pick) => {
    const values = rows.map(pick).sort((a, b) => a - b);
    return values[Math.floor(values.length / 2)];
  };
  byWidth[width] = {
    samples: rows.length,
    lcpMedian: median((row) => row.load.lcp),
    clsMedian: median((row) => row.load.cls),
    jsKbMedian: Number((median((row) => row.load.jsBytes) / 1024).toFixed(1)),
    domNodes: rows[0].load.domNodes,
    heroP95: median((row) => row.hero.p95),
    atlasP95: median((row) => row.atlas.p95),
    atlasOver50: rows[0].atlas.over50ms,
    scrollP95: median((row) => row.scroll.p95),
    canvas: rows[0].canvas,
    reducedP95: results.find((row) => row.width === width && row.sample === "reduced")?.reducedFrames.p95 ?? null,
    reducedDrawsPerSecond: results.find((row) => row.width === width && row.sample === "reduced")?.drawsPerSecond ?? null,
  };
}

await writeFile(
  path.join(OUT, "performance.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      base: BASE,
      browser: browser.version(),
      conditions: {
        cpuThrottlingRate: CPU_SLOWDOWN,
        network: "1.6 Mbit/s down / 0.75 Mbit/s up / 75ms latency (CDP emulation)",
        server: "local static export via scripts/serve-out.mjs (no CDN, no compression negotiation beyond the server defaults)",
        headless: true,
        gpu: "headless software rasteriser — a real GPU composite is typically cheaper",
      },
      byWidth,
      samples: results,
      limits: [
        "Synthetic local lab on a throttled headless browser. This is NOT field Core Web Vitals, NOT field INP, and NOT Lighthouse.",
        "Event Timing durations are diagnostics, not a claimed INP score.",
        "Frame gaps include the scripted scroll driver, CPU throttling and host load; they are not pure GPU frame drops.",
        "The scroll phase scrolls once per animation frame, which is a harsher test than a trackpad flick.",
        "No physical handset, no thermal soak, no Safari/Firefox, no screen reader.",
        "Offscreen and backgrounded tabs pause the canvas loop; that behaviour is covered by the QA script, not measured here.",
      ],
    },
    null,
    2,
  ),
);

console.log("\nmedian by viewport:");
console.log(JSON.stringify(byWidth, null, 2));
