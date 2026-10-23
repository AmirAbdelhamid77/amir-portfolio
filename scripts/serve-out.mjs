// Minimal static server for `out/`, used to check the export exactly as GitHub
// Pages serves it (trailing slashes, 404 page, correct MIME types).
//   node scripts/serve-out.mjs [port]
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

const ROOT = path.resolve("out");
const PORT = Number(process.argv[2] ?? 4173);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".xml": "application/xml; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

async function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  const target = path.join(ROOT, clean);
  if (!target.startsWith(ROOT)) return null;

  try {
    const info = await stat(target);
    if (info.isDirectory()) {
      const index = path.join(target, "index.html");
      const indexInfo = await stat(index);
      if (indexInfo.isFile()) return { file: index, info: indexInfo };
    } else {
      return { file: target, info };
    }
  } catch {
    // Fall through to the extensionless / trailing-slash variants.
  }

  for (const candidate of [`${target}.html`, path.join(target, "index.html")]) {
    try {
      const info = await stat(candidate);
      if (info.isFile()) return { file: candidate, info };
    } catch {
      // Keep looking.
    }
  }
  return null;
}

const server = createServer(async (request, response) => {
  const url = request.url ?? "/";
  const found = await resolveFile(url);

  if (!found) {
    const notFound = path.join(ROOT, "404.html");
    response.writeHead(404, { "content-type": MIME[".html"] });
    createReadStream(notFound).pipe(response);
    return;
  }

  // Mirror GitHub Pages: directory URLs without a trailing slash redirect.
  const pathname = url.split("?")[0];
  if (
    found.file.endsWith(`${path.sep}index.html`) &&
    !pathname.endsWith("/") &&
    !pathname.includes(".")
  ) {
    response.writeHead(301, { location: `${pathname}/` });
    response.end();
    return;
  }

  const type = MIME[path.extname(found.file)] ?? "application/octet-stream";
  response.writeHead(200, {
    "content-type": type,
    "content-length": found.info.size,
    "cache-control": "no-cache",
  });
  createReadStream(found.file).pipe(response);
});

server.listen(PORT, () => {
  console.log(`Serving ${ROOT} at http://localhost:${PORT}/`);
});
