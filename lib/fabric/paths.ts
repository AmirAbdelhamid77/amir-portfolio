/**
 * Fabric corpus delivery-path resolver (FC11).
 *
 * Pure, dependency-free TypeScript: exported types plus string functions, no
 * imports, no fs, no framework calls. Renderer-agnostic by contract
 * (WORK_PACKAGE_OWNERSHIP.md): nothing here assumes Next dynamic routes versus
 * a static HTML compiler — usable from Next server code and node build
 * scripts alike.
 *
 * Contracts implemented (docs/fabric-corpus/contracts/RELEASE_AND_STORAGE.md
 * §"Delivery profiles"; handover 03 §"Hosting-agnostic release contract";
 * ROUTE_NAMESPACE.md):
 *
 * 1. Base-path-once. Route registries and every content-owned URL stay
 *    UNPREFIXED. This resolver applies the base path EXACTLY ONCE at the
 *    output boundary — assets, links, redirects, search shard URLs, result
 *    targets, Atlas returns, fragments, sitemap, robots and social metadata.
 * 2. No double prefix. Inputs that already carry the base path (Next-internal
 *    URLs: next/link hrefs, next/image src, router results, `_next/static`
 *    paths — Next base-paths those itself) are rejected with a clear error.
 * 3. Trailing-slash policy follows the profile; v1 freezes it to `true`,
 *    matching `next.config.ts` `trailingSlash: true` and the mandatory
 *    trailing slash of the Fabric route namespace.
 * 4. Owner-gated origins. Profiles may carry the `TO_BE_APPROVED` placeholder
 *    through config validation, but nothing may EMIT an unapproved origin —
 *    `absoluteCanonicalUrl` fails closed.
 * 5. Safe alias-page redirects. `safeRedirectTarget` accepts only same-origin
 *    paths (no scheme, no protocol-relative `//`, no backslash, length
 *    capped) and preserves query/hash, implementing the handover gate
 *    "alias pages preserve approved query/hash behavior and reject unsafe
 *    redirects".
 */

/** Owner-approval placeholder for not-yet-approved origins (FC11 v1). */
export const ORIGIN_PLACEHOLDER = "TO_BE_APPROVED";

/** Maximum accepted length of a same-origin redirect target (alias pages). */
export const SAFE_REDIRECT_MAX_LENGTH = 2048;

/**
 * Robots marking for a deployment, per RELEASE_AND_STORAGE.md
 * §"Delivery profiles" ("canonical/mirror marking").
 *
 * - `"canonical"`: this deployment is (intended to be) the approved canonical
 *   host — crawling allowed, sitemap/social metadata point at it, mirrors
 *   canonicalise to it.
 * - `"mirror"`: preview/mirror deployment — crawling disallowed, never
 *   referenced as canonical.
 */
export type RobotsPolicy = "canonical" | "mirror";

/**
 * One delivery profile: the delivery-only settings that distinguish the two
 * mandatory targets built from the same frozen content release
 * (RELEASE_AND_STORAGE.md §"Delivery profiles"). Profiles differ ONLY in
 * these settings; logical article, search, curriculum and Atlas coverage is
 * identical across profiles.
 */
export type DeliveryProfile = {
  /** `root` = origin-root deployment (Vercel, optional Cloudflare); `subpath` = GitHub Pages project site. */
  profile: "root" | "subpath";
  /** `""` for root; `/<repository>` for subpath. Never hard-coded in content or registries. */
  basePath: string;
  /** Public serving origin: `https://…` once owner-approved, else `TO_BE_APPROVED`. */
  publicOrigin: string;
  /** Canonical origin for sitemap/robots/social metadata: same approval rule. */
  canonicalOrigin: string;
  /** Frozen `true` for v1 (matches `next.config.ts` `trailingSlash: true`). */
  trailingSlash: true;
  /** Optional immutable asset origin (owner approval required); `""` routes assets through `basePath`. */
  assetOrigin: string;
  /** Canonical/mirror robots marking. */
  robotsPolicy: RobotsPolicy;
};

/**
 * True when `origin` is an owner-approvable https origin (not the
 * `TO_BE_APPROVED` placeholder). Pure check; performs no I/O.
 */
export function isOriginApproved(origin: string): boolean {
  return origin !== ORIGIN_PLACEHOLDER && isHttpsOrigin(origin);
}

/**
 * Parse and validate an unknown value as a {@link DeliveryProfile}.
 *
 * Throws on any violation so broken profiles fail closed at load time:
 *
 * - `profile` must be `"root"` or `"subpath"`.
 * - `basePath` must be `""` (root profile) or a single-or-more segment
 *   path that starts with `"/"`, does not end with `"/"`, contains no
 *   `"//"` segment separators, no backslash, whitespace, `?`/`#`, and no
 *   `.`/`..` segments (`"/<repository>"` for GitHub Pages project sites).
 * - `publicOrigin`/`canonicalOrigin` must be an https origin (no path, no
 *   user info, optional 1–5 digit port) or `"TO_BE_APPROVED"` until the
 *   owner approval gate. Plain http is rejected.
 * - `trailingSlash` must be the literal `true` (frozen v1 policy; matches
 *   `next.config.ts`).
 * - `assetOrigin` must be `""`, an https origin, or `"TO_BE_APPROVED"`.
 * - `robotsPolicy` must be `"canonical"` or `"mirror"`.
 *
 * Unknown annotation fields are tolerated (ignored) so the schema can gain
 * metadata without breaking previously valid profiles.
 */
export function validateProfile(raw: unknown): DeliveryProfile {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new TypeError(
      `validateProfile: a delivery profile must be a JSON object, got ${describeValue(raw)}.`,
    );
  }
  const record = raw as Record<string, unknown>;

  const profile = requireString(record, "profile");
  if (profile !== "root" && profile !== "subpath") {
    throw new Error(
      `validateProfile: field "profile" must be "root" or "subpath", got ${JSON.stringify(profile)}.`,
    );
  }

  const basePath = requireString(record, "basePath");
  validateBasePath(basePath);
  if (profile === "root" && basePath !== "") {
    throw new Error(
      `validateProfile: the root profile pins basePath to "" (origin-root deployment), got ${JSON.stringify(basePath)} — see RELEASE_AND_STORAGE.md §"Delivery profiles".`,
    );
  }
  if (profile === "subpath" && basePath === "") {
    throw new Error(
      'validateProfile: the subpath profile requires a non-empty basePath (project-site "/<repository>"; the packaging step sets it per repository name).',
    );
  }

  const publicOrigin = requireOrigin(record, "publicOrigin");
  const canonicalOrigin = requireOrigin(record, "canonicalOrigin");

  if (record.trailingSlash !== true) {
    throw new Error(
      `validateProfile: field "trailingSlash" must be the literal true (frozen v1; matches next.config.ts trailingSlash: true), got ${describeValue(record.trailingSlash)}.`,
    );
  }

  const assetOrigin = requireString(record, "assetOrigin");
  if (assetOrigin !== "" && !isOriginValue(assetOrigin)) {
    throw new Error(
      `validateProfile: field "assetOrigin" must be "", an https origin, or "${ORIGIN_PLACEHOLDER}", got ${JSON.stringify(assetOrigin)}.`,
    );
  }

  const robotsPolicy = requireString(record, "robotsPolicy");
  if (robotsPolicy !== "canonical" && robotsPolicy !== "mirror") {
    throw new Error(
      `validateProfile: field "robotsPolicy" must be "canonical" or "mirror", got ${JSON.stringify(robotsPolicy)}.`,
    );
  }

  return {
    profile,
    basePath,
    publicOrigin,
    canonicalOrigin,
    trailingSlash: true,
    assetOrigin,
    robotsPolicy,
  };
}

/**
 * Resolve an UNPREFIXED logical page URL for the profile — the single place
 * the base path is applied, exactly once (base-path-once rule).
 *
 * - Input must start with `"/"` and never already carry the base path
 *   (double-prefix inputs throw — see the no-double-prefix rule in the file
 *   header and profiles/schema.md).
 * - The path portion is normalized to `profile.trailingSlash`; `?query` and
 *   `#hash` are preserved verbatim and re-attached after normalization
 *   (`"/search?q=fabric"` → `"/search/?q=fabric"` under trailingSlash true).
 * - Duplicate `"//"` in the path portion, backslashes and control characters
 *   are rejected; empty query/fragment markers (`"?"`, `"#"`) are dropped.
 */
export function buildPublicUrl(logicalPath: string, profile: DeliveryProfile): string {
  const shape = assertProfileShape(profile, "buildPublicUrl");
  const parts = requireLogicalPath(logicalPath, "buildPublicUrl", shape.basePath);
  return assembleUrl(shape.basePath, parts, shape.trailingSlash);
}

/**
 * Resolve an UNPREFIXED logical ASSET URL (media, search shards, licensed
 * files) for the profile.
 *
 * Routing (schema v1):
 * - `assetOrigin === ""` → assets ride the public base path, like pages.
 * - `assetOrigin` set (owner-approved immutable origin) → the origin REPLACES
 *   the base entirely: the approved independent delivery hosts the logical
 *   asset tree at its root, so no base path is added.
 *
 * Asset URLs are file URLs: no trailing-slash rewrite (the trailing-slash
 * policy governs document URLs only; matches `next.config.ts` assetPrefix
 * behaviour where file URLs never gain a slash). Validation otherwise mirrors
 * {@link buildPublicUrl}, including the no-double-prefix rejection.
 */
export function buildAssetUrl(assetPath: string, profile: DeliveryProfile): string {
  const shape = assertProfileShape(profile, "buildAssetUrl");
  const parts = requireLogicalPath(assetPath, "buildAssetUrl", shape.basePath);
  const base = shape.assetOrigin !== "" ? shape.assetOrigin : shape.basePath;
  let out = base + parts.pathPart;
  if (parts.query !== "") out += "?" + parts.query;
  if (parts.hash !== "") out += "#" + parts.hash;
  return out;
}

/**
 * Absolute canonical URL for sitemap, robots and social metadata:
 * `canonicalOrigin` + {@link buildPublicUrl}.
 *
 * Fails closed when `canonicalOrigin` is not owner-approved
 * (`TO_BE_APPROVED` or malformed): an unapproved origin must never be
 * emitted into a sitemap or social card. Approval is a separate owner gate;
 * activation stays out of scope (RELEASE_AND_STORAGE.md).
 */
export function absoluteCanonicalUrl(logicalPath: string, profile: DeliveryProfile): string {
  const shape = assertProfileShape(profile, "absoluteCanonicalUrl");
  if (!isOriginApproved(shape.canonicalOrigin)) {
    throw new Error(
      `absoluteCanonicalUrl: profile.canonicalOrigin is ${JSON.stringify(shape.canonicalOrigin)} — sitemap/robots/social URLs must never carry an unapproved origin. Set an owner-approved https canonicalOrigin first (owner gate, RELEASE_AND_STORAGE.md).`,
    );
  }
  return shape.canonicalOrigin + buildPublicUrl(logicalPath, profile);
}

/**
 * Gate a candidate redirect target for a static alias page (handover 03:
 * "Generate static alias pages with visible links and safe query/hash
 * forwarding where HTTP redirects are unavailable").
 *
 * Accepts ONLY same-origin paths: a string starting with `"/"`, no scheme,
 * not protocol-relative (`"//"`), no backslash anywhere, no control
 * characters, at most {@link SAFE_REDIRECT_MAX_LENGTH} characters. Query and
 * hash are preserved verbatim. Returns `null` for anything unsafe — callers
 * must treat `null` as "no approved target" and fall back to a visible,
 * unparameterized link, never to a passed-through value.
 */
export function safeRedirectTarget(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  if (raw.length === 0) return null;
  if (raw.length > SAFE_REDIRECT_MAX_LENGTH) return null;
  if (!raw.startsWith("/")) return null; // rejects schemes ("https://…"), "relative", ""-adjacent forms
  if (raw.startsWith("//")) return null; // protocol-relative → off-origin
  if (raw.includes("\\")) return null; // backslash bypass (browser path normalization tricks)
  for (const ch of raw) {
    const code = ch.charCodeAt(0);
    if (code < 0x20 || code === 0x7f) return null; // control characters anywhere → unsafe
  }
  return raw;
}

// ---------------------------------------------------------------------------
// Internal helpers (no exports below this line)
// ---------------------------------------------------------------------------

type UrlParts = { pathPart: string; query: string; hash: string };

type ProfileShape = {
  basePath: string;
  trailingSlash: boolean;
  assetOrigin: string;
  canonicalOrigin: string;
};

const BASE_PATH_CHARS = /^\/[A-Za-z0-9._~\-/]+$/;
const ORIGIN_HOST = /^[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?$/;

/**
 * Runtime shape guard. TypeScript callers get it from the DeliveryProfile
 * type; plain-JS callers (tests, build scripts) get a clear error instead of
 * a silently malformed URL. Unvalidated literals default to the frozen v1
 * policy (`trailingSlash: true`).
 */
function assertProfileShape(profile: unknown, fn: string): ProfileShape {
  if (typeof profile !== "object" || profile === null) {
    throw new TypeError(
      `${fn}: profile must be a DeliveryProfile from validateProfile(), got ${describeValue(profile)}.`,
    );
  }
  const candidate = profile as Partial<DeliveryProfile>;
  if (
    typeof candidate.basePath !== "string" ||
    (candidate.basePath !== "" && !candidate.basePath.startsWith("/"))
  ) {
    throw new TypeError(
      `${fn}: profile.basePath must be "" or start with "/" — pass a validateProfile()-checked DeliveryProfile.`,
    );
  }
  return {
    basePath: candidate.basePath,
    trailingSlash: candidate.trailingSlash !== false,
    assetOrigin: typeof candidate.assetOrigin === "string" ? candidate.assetOrigin : "",
    canonicalOrigin: typeof candidate.canonicalOrigin === "string" ? candidate.canonicalOrigin : "",
  };
}

/**
 * Shared validation of a logical (unprefixed) URL input. Order matters: the
 * no-double-prefix rejection fires before shape checks so an already-prefixed
 * input is always reported as such.
 */
function requireLogicalPath(logicalPath: string, fn: string, basePath: string): UrlParts {
  if (typeof logicalPath !== "string") {
    throw new TypeError(`${fn}: logical path must be a string, got ${describeValue(logicalPath)}.`);
  }
  const parts = splitUrlParts(logicalPath);
  if (parts.pathPart.length === 0 || !parts.pathPart.startsWith("/")) {
    throw new Error(
      `${fn}: input ${JSON.stringify(logicalPath)} must be an unprefixed logical path starting with "/" — the resolver applies the base path exactly once at the output boundary.`,
    );
  }
  if (basePath !== "" && (parts.pathPart === basePath || parts.pathPart.startsWith(basePath + "/"))) {
    throw new Error(
      `${fn}: input ${JSON.stringify(logicalPath)} already carries the base path "${basePath}"; applying it again would publish a double-prefixed URL (no-double-prefix rule). ` +
        `Content-owned URLs stay unprefixed — this resolver adds the base path exactly once. ` +
        `Next-internal URLs (next/link hrefs, next/image src, router results, _next/static paths) are already base-pathed by Next itself and must never be re-resolved here.`,
    );
  }
  if (parts.pathPart.includes("\\")) {
    throw new Error(
      `${fn}: input ${JSON.stringify(logicalPath)} must not contain a backslash in the path portion (use "/" separators).`,
    );
  }
  if (parts.pathPart.includes("//")) {
    throw new Error(
      `${fn}: input ${JSON.stringify(logicalPath)} contains duplicate "//" in the path portion; normalize content URLs to single slashes.`,
    );
  }
  for (const ch of parts.pathPart) {
    const code = ch.charCodeAt(0);
    if (code < 0x20 || code === 0x7f) {
      throw new Error(
        `${fn}: input ${JSON.stringify(logicalPath)} contains a control character in the path portion.`,
      );
    }
  }
  return parts;
}

/**
 * Split a URL reference the way browsers do: path runs to the first `?` or
 * `#`; query runs from `?` to `#`; fragment follows `#`. Query and fragment
 * content is kept verbatim (no re-encoding, no reordering).
 */
function splitUrlParts(input: string): UrlParts {
  const hashAt = input.indexOf("#");
  const queryAt = input.indexOf("?");
  if (queryAt !== -1 && (hashAt === -1 || queryAt < hashAt)) {
    const pathPart = input.slice(0, queryAt);
    const tail = input.slice(queryAt + 1);
    const fragmentAt = tail.indexOf("#");
    if (fragmentAt === -1) return { pathPart, query: tail, hash: "" };
    return { pathPart, query: tail.slice(0, fragmentAt), hash: tail.slice(fragmentAt + 1) };
  }
  if (hashAt !== -1) {
    return { pathPart: input.slice(0, hashAt), query: "", hash: input.slice(hashAt + 1) };
  }
  return { pathPart: input, query: "", hash: "" };
}

function assembleUrl(base: string, parts: UrlParts, trailingSlash: boolean): string {
  let out = base + withTrailingSlashPolicy(parts.pathPart, trailingSlash);
  if (parts.query !== "") out += "?" + parts.query;
  if (parts.hash !== "") out += "#" + parts.hash;
  return out;
}

/**
 * Trailing-slash normalization to the profile policy. `"/"` always stays
 * `"/"` (the origin root cannot lose or gain more slashes). v1 profiles are
 * frozen to `true`; the `false` branch exists only so an unfrozen future
 * policy keeps working without a rewrite.
 */
function withTrailingSlashPolicy(pathPart: string, trailingSlash: boolean): string {
  if (pathPart === "/") return "/";
  if (trailingSlash) {
    return pathPart.endsWith("/") ? pathPart : pathPart + "/";
  }
  return pathPart.length > 1 && pathPart.endsWith("/") ? pathPart.slice(0, -1) : pathPart;
}

function validateBasePath(basePath: string): void {
  if (basePath === "") return; // root profile; profile-consistency is checked by the caller
  if (!basePath.startsWith("/")) {
    throw new Error(
      `validateProfile: basePath ${JSON.stringify(basePath)} must start with "/" (or be "" for a root deployment).`,
    );
  }
  if (basePath.endsWith("/")) {
    throw new Error(`validateProfile: basePath ${JSON.stringify(basePath)} must not end with "/".`);
  }
  if (basePath.includes("//")) {
    throw new Error(`validateProfile: basePath ${JSON.stringify(basePath)} must not contain empty "//" segments.`);
  }
  if (!BASE_PATH_CHARS.test(basePath)) {
    throw new Error(
      `validateProfile: basePath ${JSON.stringify(basePath)} may only contain ASCII letters, digits, ".", "_", "~", "-" and "/" separators (no whitespace, backslash, "?" or "#").`,
    );
  }
  for (const segment of basePath.slice(1).split("/")) {
    if (segment === "." || segment === "..") {
      throw new Error(`validateProfile: basePath ${JSON.stringify(basePath)} must not contain "." or ".." segments.`);
    }
  }
}

function isOriginValue(value: string): boolean {
  return value === ORIGIN_PLACEHOLDER || isHttpsOrigin(value);
}

function isHttpsOrigin(value: string): boolean {
  if (!value.startsWith("https://")) return false;
  const authority = value.slice("https://".length);
  if (authority.length === 0) return false;
  if (/[\s/?#@\[\]]/.test(authority)) return false; // origin only: no path, query, fragment, user info, IPv6 brackets
  const colonAt = authority.indexOf(":");
  if (colonAt === -1) return ORIGIN_HOST.test(authority);
  const host = authority.slice(0, colonAt);
  const port = authority.slice(colonAt + 1);
  if (!ORIGIN_HOST.test(host)) return false;
  if (!/^\d{1,5}$/.test(port)) return false;
  const portNumber = Number.parseInt(port, 10);
  return portNumber >= 1 && portNumber <= 65535;
}

function requireString(record: Record<string, unknown>, field: string): string {
  const value = record[field];
  if (typeof value !== "string") {
    throw new TypeError(`validateProfile: field "${field}" must be a string, got ${describeValue(value)}.`);
  }
  return value;
}

function requireOrigin(record: Record<string, unknown>, field: string): string {
  const value = requireString(record, field);
  if (!isOriginValue(value)) {
    throw new Error(
      `validateProfile: field "${field}" must be an https origin (no path, no user info) or "${ORIGIN_PLACEHOLDER}" until the owner approval gate, got ${JSON.stringify(value)}.`,
    );
  }
  return value;
}

function describeValue(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "string") return JSON.stringify(value);
  return typeof value;
}
