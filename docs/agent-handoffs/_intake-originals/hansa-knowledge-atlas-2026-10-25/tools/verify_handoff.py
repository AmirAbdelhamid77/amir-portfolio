#!/usr/bin/env python3
"""Validate basic Atlas handoff consistency; no network or repo writes.

Run from any directory: python tools/verify_handoff.py [--schema]
--schema requires jsonschema package and checks sample against bundled JSON schema.
This checks the test fixture, NOT the real DP-600 source or deployment.
"""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = [
    "START_HERE.md", "README_AR.md", "docs/MASTER_SPEC_EN.md",
    "docs/CONTENT_MODEL_AND_GOVERNANCE.md", "docs/UX_VISUAL_SYSTEM.md",
    "docs/QUALITY_GATES_AND_TESTS.md", "docs/IMPLEMENTATION_ROADMAP.md",
    "docs/AGENT_KICKOFF_PROMPT.md", "docs/AGENTS_MD_ADDENDUM.md",
    "docs/DECISIONS_AND_CREATIVE_BRIEF.md",
    "schemas/atlas-content.schema.json", "examples/atlas-candidate-fixture.json",
    "examples/guide-coverage-template.csv", "references/NotebookLM_guide_mindmap_reference.png",
]
FORBIDDEN = {"contains", "chapter_of", "belongs_to_book", "has_chapter", "next_page", "co_occurs_with", "question_in_bank"}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--schema", action="store_true", help="also validate JSON Schema using installed jsonschema")
    args = parser.parse_args()
    missing = [name for name in REQUIRED if not (ROOT / name).is_file()]
    assert not missing, f"Missing required docs: {missing}"
    schema = json.loads((ROOT / "schemas/atlas-content.schema.json").read_text(encoding="utf-8"))
    data = json.loads((ROOT / "examples/atlas-candidate-fixture.json").read_text(encoding="utf-8"))
    assert schema.get("$schema", "").endswith("2020-12/schema")
    ids = [n["id"] for n in data["concepts"]]
    assert len(ids) == len(set(ids)), "Duplicate concept IDs"
    assert all(e["from"] in ids and e["to"] in ids for e in data["semanticEdges"]), "Unknown endpoint"
    assert not any(e["relationType"] in FORBIDDEN for e in data["semanticEdges"]), "Structural edge detected"
    assert data["datasetStatus"] == "test-fixture", "Test data must not assert production state"
    assert all(e["editorialState"] != "published" for e in data["semanticEdges"]), "Unreviewed fixture must never be published"
    assert all(c["editorialState"] != "published" for c in data["concepts"])
    assert all(not row["publishStatus"] == "published" for row in data["coverage"])
    if args.schema:
        try:
            import jsonschema
        except ImportError as exc:
            raise RuntimeError("Install jsonschema in your own environment to use --schema") from exc
        jsonschema.Draft202012Validator.check_schema(schema)
        jsonschema.Draft202012Validator(schema, format_checker=jsonschema.FormatChecker()).validate(data)
    print(f"PASS | {len(REQUIRED)} required handoff files | {len(ids)} sample concepts | {len(data['semanticEdges'])} draft edge(s) | publication intentionally blocked | schema={'checked' if args.schema else 'not requested'}")


if __name__ == "__main__":
    main()
