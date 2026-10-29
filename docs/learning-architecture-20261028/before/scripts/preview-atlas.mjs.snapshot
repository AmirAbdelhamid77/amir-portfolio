import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
const root = resolve("build/atlas-preview/out"), port = Number(process.argv[2] ?? 4191);
if (!existsSync(resolve(root, "learn/dp-600/atlas/index.html"))) throw new Error("Build the Atlas local preview first");
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css", ".json": "application/json", ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2", ".ico": "image/x-icon" };
createServer((request,response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://127.0.0.1").pathname);
    let file = resolve(root, "." + pathname);
    if (!file.startsWith(root + sep) && file !== root) { response.writeHead(403).end(); return; }
    if (existsSync(file) && statSync(file).isDirectory()) file = resolve(file, "index.html");
    const found = existsSync(file); if (!found) file = resolve(root, "404.html");
    response.writeHead(found ? 200 : 404, { "content-type": mime[extname(file)] ?? "application/octet-stream", "cache-control": "no-store" });
    response.end(readFileSync(file));
  } catch { response.writeHead(400).end("Invalid request"); }
}).listen(port, "127.0.0.1", () => console.log(`LOCAL REVIEW ONLY: http://127.0.0.1:${port}/learn/dp-600/atlas/`));
