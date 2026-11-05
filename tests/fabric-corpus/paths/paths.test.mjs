// FC11 — resolver tests for lib/fabric/paths.ts (base-path-once contract).
//
//   node --experimental-strip-types --test tests/fabric-corpus/paths/
//
// The import uses the explicit relative .ts extension as required by
// node --experimental-strip-types. No @/ aliases, no JSON imports: the
// delivery profile seeds are read with fs exactly like the build-time
// consumers read the build workspace.
//
// Contract sources:
//   docs/fabric-corpus/contracts/RELEASE_AND_STORAGE.md §"Delivery profiles"
//   handover 03 §"Hosting-agnostic release contract"
//   tools/fabric-corpus/profiles/schema.md (schema v1)
//
// No-double-prefix contract note (the FC11 fixture RELEASE_AND_STORAGE.md
// calls for): with basePath "/repo" in next.config.ts, Next applies the base
// path to ITS OWN URLs — <Link href="/learn/fabric/x/"/> renders
// href="/repo/learn/fabric/x/", next/image src and _next/static paths are
// base-pathed via assetPrefix, router results come back prefixed. Content
// owned URLs (compiler-emitted article HTML, search shard URLs, Atlas
// returns, sitemap entries, alias targets) are raw logical paths that Next
// never touches, so only those flow through buildPublicUrl/buildAssetUrl.
// Passing an already-prefixed URL back in would publish /repo/repo/... — the
// resolver throws instead. The "next-style already-prefixed input" tests
// below pin that behaviour.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import {
  ORIGIN_PLACEHOLDER,
  SAFE_REDIRECT_MAX_LENGTH,
  absoluteCanonicalUrl,
  buildAssetUrl,
  buildPublicUrl,
  isOriginApproved,
  safeRedirectTarget,
  validateProfile,
} from "../../../lib/fabric/paths.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..", "..");
const profilesDir = path.join(repoRoot, "tools", "fabric-corpus", "profiles");

const V1_FIELDS = [
  "assetOrigin",
  "basePath",
  "canonicalOrigin",
  "profile",
  "publicOrigin",
  "robotsPolicy",
  "trailingSlash",
].sort();

function rootProfile(extra = {}) {
  return validateProfile({
    profile: "root",
    basePath: "",
    publicOrigin: "https://hansa.example",
    canonicalOrigin: "https://hansa.example",
    trailingSlash: true,
    assetOrigin: "",
    robotsPolicy: "canonical",
    ...extra,
  });
}

function subpathProfile(extra = {}) {
  return validateProfile({
    profile: "subpath",
    basePath: "/repo",
    publicOrigin: "https://owner.github.io",
    canonicalOrigin: "https://owner.github.io",
    trailingSlash: true,
    assetOrigin: "",
    robotsPolicy: "canonical",
    ...extra,
  });
}

// ---------------------------------------------------------------------------
// Root profile: "" basePath passthrough, trailing slash, query/hash
// ---------------------------------------------------------------------------

test("root profile: empty basePath passes logical paths through unchanged", () => {
  const profile = rootProfile();
  assert.equal(
    buildPublicUrl("/learn/fabric/docs/onelake/intro/", profile),
    "/learn/fabric/docs/onelake/intro/",
  );
  assert.equal(buildPublicUrl("/", profile), "/");
});

test("root profile: trailing slash is enforced on the path portion", () => {
  const profile = rootProfile();
  // Missing slash gets added.
  assert.equal(
    buildPublicUrl("/learn/fabric/docs/onelake/intro", profile),
    "/learn/fabric/docs/onelake/intro/",
  );
  // Present slash is kept (idempotent, never doubled).
  assert.equal(
    buildPublicUrl("/learn/fabric/docs/onelake/intro/", profile),
    "/learn/fabric/docs/onelake/intro/",
  );
  // Normalization happens on the path, before the query is re-attached.
  assert.equal(buildPublicUrl("/search?q=fabric", profile), "/search/?q=fabric");
});

test("root profile: query and hash are preserved verbatim", () => {
  const profile = rootProfile();
  assert.equal(buildPublicUrl("/search/?q=fabric+delta", profile), "/search/?q=fabric+delta");
  assert.equal(buildPublicUrl("/learn/intro#overview", profile), "/learn/intro/#overview");
  assert.equal(
    buildPublicUrl("/learn/intro?tab=all&lang=en#overview", profile),
    "/learn/intro/?tab=all&lang=en#overview",
  );
  // Hash before "?" — the "?" belongs to the fragment and stays verbatim.
  assert.equal(buildPublicUrl("/a#frag?notquery", profile), "/a/#frag?notquery");
  // Empty fragment markers are dropped (normalization, not corruption).
  assert.equal(buildPublicUrl("/x#", profile), "/x/");
});

// ---------------------------------------------------------------------------
// Subpath profile: prefix applied once; double application throws
// ---------------------------------------------------------------------------

test("subpath profile: the base path is applied exactly once", () => {
  const profile = subpathProfile();
  assert.equal(
    buildPublicUrl("/learn/fabric/docs/onelake/intro/", profile),
    "/repo/learn/fabric/docs/onelake/intro/",
  );
  assert.equal(buildPublicUrl("/", profile), "/repo/");
  // "/repoX" is a different first segment, not the basePath — it must NOT be
  // treated as already-prefixed (segment-boundary matching); it resolves as
  // any other logical path and gains the base path exactly once.
  assert.equal(buildPublicUrl("/repoX/learn/intro/", profile), "/repo/repoX/learn/intro/");
});

test("subpath profile: double application throws (no-double-prefix rule)", () => {
  const profile = subpathProfile();
  // The obvious mistake: resolving the already-prefixed output again.
  assert.throws(
    () => buildPublicUrl("/repo/learn/fabric/docs/onelake/intro/", profile),
    /already carries the base path/,
  );
  // The basePath itself, with and without a query.
  assert.throws(() => buildPublicUrl("/repo", profile), /already carries the base path/);
  assert.throws(() => buildPublicUrl("/repo?q=1", profile), /already carries the base path/);
  assert.throws(() => buildPublicUrl("/repo/", profile), /already carries the base path/);
});

test("subpath profile: next-style already-prefixed input is rejected (documented contract)", () => {
  const profile = subpathProfile();
  // This is what a Next <Link> renders once basePath is configured — it must
  // never be re-resolved, or the output double-prefixes (/repo/repo/...).
  const renderedByNextLink = "/repo/learn/fabric/docs/onelake/intro/";
  assert.equal(renderedByNextLink.startsWith("/repo"), true);
  assert.throws(
    () => buildPublicUrl(renderedByNextLink, profile),
    (error) => {
      assert.match(error.message, /no-double-prefix rule/);
      assert.match(error.message, /Next-internal URLs/);
      return true;
    },
  );
});

test("malformed logical paths throw on both profiles", () => {
  const root = rootProfile();
  const sub = subpathProfile();
  // Empty and non-"-"-prefixed inputs.
  assert.throws(() => buildPublicUrl("", root), /starting with/);
  assert.throws(() => buildPublicUrl("learn/fabric/intro/", root), /starting with/);
  // Protocol-relative input ("//" duplicates) — also the off-origin shape.
  assert.throws(() => buildPublicUrl("//evil.example", root), /duplicate "\/\/"/);
  assert.throws(() => buildPublicUrl("//evil.example", sub), /duplicate "\/\/"/);
  assert.throws(() => buildPublicUrl("/learn//double/", root), /duplicate "\/\/"/);
  // Backslash separators and control characters.
  assert.throws(() => buildPublicUrl("/learn\\fabric/", root), /backslash/);
  assert.throws(() => buildPublicUrl("/learn\nfabric/", root), /control character/);
  // Non-string input.
  assert.throws(() => buildPublicUrl(null, root), TypeError);
  assert.throws(() => buildPublicUrl(42, root), TypeError);
  // Unvalidated profile object.
  assert.throws(() => buildPublicUrl("/learn/", { profile: "root" }), TypeError);
});

// ---------------------------------------------------------------------------
// Asset origin routing vs basePath assets
// ---------------------------------------------------------------------------

test("assets: assetOrigin empty routes through the base path", () => {
  assert.equal(
    buildAssetUrl("/media/diagrams/onelake.webp", subpathProfile()),
    "/repo/media/diagrams/onelake.webp",
  );
  assert.equal(
    buildAssetUrl("/media/diagrams/onelake.webp", rootProfile()),
    "/media/diagrams/onelake.webp",
  );
});

test("assets: file URLs never gain a trailing slash", () => {
  const profile = subpathProfile();
  assert.equal(
    buildAssetUrl("/media/diagrams/onelake.webp", profile),
    "/repo/media/diagrams/onelake.webp",
  );
  assert.equal(buildAssetUrl("/shards/search-0.json", profile), "/repo/shards/search-0.json");
});

test("assets: a set assetOrigin replaces the base entirely (independent delivery)", () => {
  const sub = subpathProfile({ assetOrigin: "https://assets.hansa.example" });
  assert.equal(
    buildAssetUrl("/shards/search-0.json", sub),
    "https://assets.hansa.example/shards/search-0.json",
  );
  const root = rootProfile({ assetOrigin: "https://assets.hansa.example" });
  assert.equal(
    buildAssetUrl("/media/diagrams/onelake.webp", root),
    "https://assets.hansa.example/media/diagrams/onelake.webp",
  );
  // Page URLs of the same profile still ride the base path — assetOrigin is
  // scoped to buildAssetUrl only.
  assert.equal(
    buildPublicUrl("/learn/fabric/docs/onelake/intro/", sub),
    "/repo/learn/fabric/docs/onelake/intro/",
  );
});

test("assets: the no-double-prefix and shape rules still apply", () => {
  const profile = subpathProfile();
  assert.throws(
    () => buildAssetUrl("/repo/media/diagrams/onelake.webp", profile),
    /already carries the base path/,
  );
  // Absolute URLs are not logical paths — the immutable origin is chosen by
  // profile.assetOrigin, never by the input.
  assert.throws(
    () => buildAssetUrl("https://cdn.example/media/x.png", profile),
    /starting with/,
  );
});

// ---------------------------------------------------------------------------
// Canonical absolute URLs, with and without basePath
// ---------------------------------------------------------------------------

test("canonical absolute URLs: root profile (no basePath)", () => {
  const profile = rootProfile();
  assert.equal(
    absoluteCanonicalUrl("/learn/fabric/docs/onelake/intro/", profile),
    "https://hansa.example/learn/fabric/docs/onelake/intro/",
  );
  assert.equal(
    absoluteCanonicalUrl("/learn/fabric/docs/onelake/intro", profile),
    "https://hansa.example/learn/fabric/docs/onelake/intro/",
  );
});

test("canonical absolute URLs: subpath profile (basePath included once)", () => {
  const profile = subpathProfile();
  assert.equal(
    absoluteCanonicalUrl("/learn/fabric/docs/onelake/intro/", profile),
    "https://owner.github.io/repo/learn/fabric/docs/onelake/intro/",
  );
});

test("canonical absolute URLs: fail closed on an unapproved canonical origin", () => {
  const profile = rootProfile({ canonicalOrigin: ORIGIN_PLACEHOLDER });
  assert.throws(() => absoluteCanonicalUrl("/learn/fabric/docs/", profile), /unapproved origin/);
  assert.throws(
    () => absoluteCanonicalUrl("/learn/fabric/docs/", rootProfile({ canonicalOrigin: "TO_BE_APPROVED" })),
    /owner-approved https canonicalOrigin/,
  );
});

// ---------------------------------------------------------------------------
// safeRedirectTarget (alias-page gate)
// ---------------------------------------------------------------------------

test("safeRedirectTarget: valid same-origin paths pass through verbatim", () => {
  assert.equal(safeRedirectTarget("/learn/fabric/docs/onelake/intro/"), "/learn/fabric/docs/onelake/intro/");
  assert.equal(safeRedirectTarget("/search/?q=1#anchor"), "/search/?q=1#anchor");
  assert.equal(safeRedirectTarget("/"), "/");
  assert.equal(SAFE_REDIRECT_MAX_LENGTH, 2048);
});

test("safeRedirectTarget: rejects off-origin and unsafe shapes", () => {
  assert.equal(safeRedirectTarget("https://evil.example/x"), null);
  assert.equal(safeRedirectTarget("//evil.example"), null);
  assert.equal(safeRedirectTarget("/\\evil"), null);
  assert.equal(safeRedirectTarget("http://intranet.local/admin"), null);
  assert.equal(safeRedirectTarget("javascript:alert(1)"), null);
  assert.equal(safeRedirectTarget("relative/path"), null);
  assert.equal(safeRedirectTarget("/line\nbreak"), null);
  assert.equal(safeRedirectTarget("/tab\there"), null);
});

test("safeRedirectTarget: rejects empty, non-strings and over-length input", () => {
  assert.equal(safeRedirectTarget(""), null);
  assert.equal(safeRedirectTarget(null), null);
  assert.equal(safeRedirectTarget(undefined), null);
  assert.equal(safeRedirectTarget(42), null);
  assert.equal(safeRedirectTarget({}), null);
  const atLimit = "/" + "a".repeat(SAFE_REDIRECT_MAX_LENGTH - 1); // 2048 chars exactly
  assert.equal(safeRedirectTarget(atLimit), atLimit);
  const overLimit = "/" + "a".repeat(SAFE_REDIRECT_MAX_LENGTH); // 2049 chars
  assert.equal(safeRedirectTarget(overLimit), null);
});

// ---------------------------------------------------------------------------
// validateProfile
// ---------------------------------------------------------------------------

test("validateProfile: rejects non-objects and unknown profile kinds", () => {
  for (const bad of [null, undefined, 42, "root", [], true]) {
    assert.throws(() => validateProfile(bad), /must be a JSON object/);
  }
  assert.throws(() => validateProfile({}), /must be a string/);
  assert.throws(
    () => validateProfile({ profile: "staging", basePath: "/x", publicOrigin: "https://x", canonicalOrigin: "https://x", trailingSlash: true, assetOrigin: "", robotsPolicy: "canonical" }),
    /must be "root" or "subpath"/,
  );
});

test("validateProfile: rejects bad basePath values", () => {
  const base = { profile: "subpath", publicOrigin: "https://x.example", canonicalOrigin: "https://x.example", trailingSlash: true, assetOrigin: "", robotsPolicy: "canonical" };
  // Not starting with "/" (covers "repo" and the "http://x" shape).
  assert.throws(() => validateProfile({ ...base, basePath: "repo" }), /must start with "/);
  assert.throws(() => validateProfile({ ...base, basePath: "http://x.example/repo" }), /must start with "/);
  // Trailing slash.
  assert.throws(() => validateProfile({ ...base, basePath: "/repo/" }), /must not end with "/);
  // Empty segments and traversal.
  assert.throws(() => validateProfile({ ...base, basePath: "//repo" }), /must not contain empty/);
  assert.throws(() => validateProfile({ ...base, basePath: "/repo/../etc" }), /must not contain "\." or "\.\."/);
  // Characters outside the allowed set.
  assert.throws(() => validateProfile({ ...base, basePath: "/re po" }), /may only contain/);
  assert.throws(() => validateProfile({ ...base, basePath: "/re?po" }), /may only contain/);
  assert.throws(() => validateProfile({ ...base, basePath: "/re\\po" }), /may only contain/);
  // Profile-consistency: root pins "", subpath requires non-empty.
  assert.throws(
    () => validateProfile({ ...base, profile: "root", basePath: "/repo" }),
    /pins basePath to ""/,
  );
  assert.throws(() => validateProfile({ ...base, basePath: "" }), /requires a non-empty basePath/);
});

test("validateProfile: rejects bad origins, trailingSlash and robotsPolicy", () => {
  const base = { profile: "root", basePath: "", trailingSlash: true, assetOrigin: "", robotsPolicy: "canonical" };
  // Plain http is rejected; so are paths, user info, empty hosts.
  for (const bad of ["http://insecure.example", "https://evil.example/path", "https://user@evil.example", "https://", "", "TO_BE_APPROVED "]) {
    assert.throws(
      () => validateProfile({ ...base, publicOrigin: bad }),
      /must be an https origin/,
    );
  }
  // trailingSlash must be the literal true (frozen v1).
  assert.throws(
    () => validateProfile({ ...base, publicOrigin: "https://x.example", canonicalOrigin: "https://x.example", trailingSlash: false }),
    /must be the literal true/,
  );
  // robotsPolicy enum.
  assert.throws(
    () => validateProfile({ ...base, publicOrigin: "https://x.example", canonicalOrigin: "https://x.example", robotsPolicy: "index-everything" }),
    /must be "canonical" or "mirror"/,
  );
  // assetOrigin rules.
  assert.throws(
    () => validateProfile({ ...base, publicOrigin: "https://x.example", canonicalOrigin: "https://x.example", assetOrigin: "http://assets.example" }),
    /assetOrigin/,
  );
});

test("validateProfile: accepts valid profiles, tolerates annotations, returns the v1 shape", () => {
  const profile = validateProfile({
    profile: "root",
    basePath: "",
    publicOrigin: "https://hansa.example",
    canonicalOrigin: "https://hansa.example",
    trailingSlash: true,
    assetOrigin: "",
    robotsPolicy: "mirror",
    note: "annotation fields are tolerated and ignored",
  });
  assert.deepEqual(Object.keys(profile).sort(), V1_FIELDS);
  assert.equal(profile.robotsPolicy, "mirror");
  assert.equal(profile.trailingSlash, true);
  // Ports are accepted on https origins.
  const withPort = validateProfile({
    profile: "subpath",
    basePath: "/repo",
    publicOrigin: "https://hansa.example:8443",
    canonicalOrigin: "https://hansa.example:8443",
    trailingSlash: true,
    assetOrigin: "",
    robotsPolicy: "canonical",
  });
  assert.equal(withPort.publicOrigin, "https://hansa.example:8443");
});

// ---------------------------------------------------------------------------
// Seed profiles (read via fs — no JSON imports)
// ---------------------------------------------------------------------------

test("seed profiles: both profiles/*.json validate against schema v1", () => {
  for (const name of ["root.json", "subpath.json"]) {
    const seed = JSON.parse(readFileSync(path.join(profilesDir, name), "utf8"));
    const profile = validateProfile(seed);
    assert.deepEqual(Object.keys(seed).sort(), V1_FIELDS, `${name} carries exactly the v1 field set`);
    assert.deepEqual(Object.keys(profile).sort(), V1_FIELDS);
    assert.equal(profile.trailingSlash, true);
    assert.ok(["canonical", "mirror"].includes(profile.robotsPolicy));
    if (seed.profile === "root") {
      assert.equal(profile.basePath, "");
    } else {
      assert.match(profile.basePath, /^\/[A-Za-z0-9._~-]+$/);
    }
  }
});

test("seed profiles: placeholders are flagged as unapproved (owner gate not yet passed)", () => {
  for (const name of ["root.json", "subpath.json"]) {
    const seed = JSON.parse(readFileSync(path.join(profilesDir, name), "utf8"));
    assert.equal(seed.publicOrigin, ORIGIN_PLACEHOLDER, `${name} publicOrigin is still the placeholder`);
    assert.equal(seed.canonicalOrigin, ORIGIN_PLACEHOLDER, `${name} canonicalOrigin is still the placeholder`);
    assert.equal(isOriginApproved(seed.publicOrigin), false);
    assert.equal(isOriginApproved(seed.canonicalOrigin), false);
    // And therefore no absolute metadata URL may be emitted from the seeds.
    const profile = validateProfile(seed);
    assert.throws(() => absoluteCanonicalUrl("/learn/fabric/docs/", profile), /unapproved origin/);
  }
  assert.equal(isOriginApproved("https://hansa.example"), true);
  assert.equal(isOriginApproved("http://hansa.example"), false);
  assert.equal(isOriginApproved("https://evil.example/path"), false);
});
