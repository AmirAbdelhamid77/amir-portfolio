import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = process.argv[2] ?? "C:/Users/amira/AppData/Local/Temp/opencode/amir-portfolio/images";
const OUT = path.resolve("public/images/hse");
const WIDTHS = [1200, 2000];

const FILES = [
  ["hse-executive-overview.jpg", "executive-overview"],
  ["hse-incident-tracking.jpg", "incident-tracking"],
  ["hse-observations-actions.jpg", "observations-actions"],
  ["hse-environmental-performance.jpg", "environmental-performance"],
  ["hse-operational-excellence.jpg", "operational-excellence"],
];

await mkdir(OUT, { recursive: true });

for (const [file, slug] of FILES) {
  const input = path.join(SRC, file);
  const meta = await sharp(input).metadata();
  for (const width of WIDTHS) {
    const out = path.join(OUT, `${slug}-${width}.webp`);
    const info = await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toFile(out);
    console.log(
      `${file} -> ${path.basename(out)} ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)} KB (source ${meta.width}x${meta.height})`,
    );
  }
}

// Social preview card, rendered from SVG so it stays crisp and versioned.
const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fbfbfa"/>
      <stop offset="0.55" stop-color="#f4f7fb"/>
      <stop offset="1" stop-color="#eef7fa"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#0fb5c9"/>
      <stop offset="1" stop-color="#7c3aed"/>
    </linearGradient>
    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M32 0H0V32" fill="none" stroke="#0f172a" stroke-opacity="0.06"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <circle cx="1050" cy="90" r="220" fill="#0fb5c9" opacity="0.10"/>
  <circle cx="1120" cy="540" r="190" fill="#7c3aed" opacity="0.08"/>
  <g font-family="Segoe UI, Arial, sans-serif">
    <rect x="72" y="64" width="44" height="44" rx="13" fill="#0285f7"/>
    <text x="94" y="95" fill="#ffffff" font-size="21" font-weight="700" text-anchor="middle">A</text>
    <text x="132" y="95" fill="#0f172a" font-size="24" font-weight="600" letter-spacing="-0.5">Amir Abdelhamid</text>
    <text x="72" y="238" fill="#0f172a" font-size="62" font-weight="600" letter-spacing="-2">Data that makes</text>
    <text x="72" y="310" fill="#0f172a" font-size="62" font-weight="600" letter-spacing="-2">decisions <tspan fill="#0285f7">visible.</tspan></text>
    <text x="74" y="372" fill="#5f6b7a" font-size="25">Analytics engineering, Power BI, SQL, Python — and a lab to practise.</text>
    <rect x="72" y="424" width="330" height="6" rx="3" fill="url(#accent)"/>
    <g font-size="20" fill="#334155">
      <text x="72" y="500">amirabdelhamid77.github.io</text>
      <text x="72" y="548" fill="#64748b" font-size="18">Case studies · Data Lab · Services</text>
    </g>
  </g>
  <g transform="translate(760 400)">
    <rect width="368" height="150" rx="24" fill="#ffffff" stroke="#0f172a" stroke-opacity="0.08"/>
    <text x="28" y="48" font-family="Segoe UI, Arial, sans-serif" font-size="16" fill="#64748b" letter-spacing="2">FLAGSHIP CASE STUDY</text>
    <text x="28" y="86" font-family="Segoe UI, Arial, sans-serif" font-size="22" fill="#0f172a" font-weight="600">HSE Analytics Dashboard</text>
    <text x="28" y="120" font-family="Segoe UI, Arial, sans-serif" font-size="16" fill="#64748b">229+ DAX measures · 50+ tables · 24 sites</text>
  </g>
</svg>`;

await sharp(Buffer.from(og)).png({ quality: 92 }).toFile(path.resolve("public/og.png"));
console.log("public/og.png written");

const legacy = await readdir(SRC);
console.log(`source files scanned: ${legacy.length}`);
