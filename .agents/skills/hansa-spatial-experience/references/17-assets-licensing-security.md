# 17 — Asset, legal and security discipline

## Source integrity
When inspired by an artist's animation (e.g. Finn Taylor Literal File Tree), analyze visual principles: organic growth vs rigid UI, strong negative space, semantic metaphor. Do not clone their artwork, shaders, source code or textures without adequate license/permission. Avoid copying distinctive trade dress. Label inspiration links in design notes.

## Third-party assets
Record license, author, source URL, modification permission, required attribution and internal path. Do not embed hotlinked production assets. Avoid random downloadable .glb/.gltf/models with unknown redistribution terms; validate file sizes and asset security.

## Models and textures
Optimize mesh/poly count, texture resolution, material variants and texture memory. Compress only after verifying deployment/decoder support. Avoid autoplay audio; a music-backed scene requires licensed music and user control. Do not transmit private Hansa/question-bank data to external tools without permission.

## Shader/code safety
Do not execute arbitrary website scripts or unsafe demos in production. Inspect dependencies and CSP implications; avoid untrusted remote runtime code. No data exfiltration, CDN-only fallback or network dependency introduced silently.

## Visual sourcing
External references are inspiration, not proof of behavior/engineering. Screenshot cannot establish use of specific WebGL/shader engine. Document verified observations vs inferred implementation choices.
