# Missing Capability Backlog

This backlog defines the next research supplements after the first core 3D Web patterns have been covered.

The current project already has a usable skeleton:

```text
technical demo film
scroll-driven 3D website
game-like 3D portfolio
product model viewer
cinematic product showcase
character / AI companion validation case
```

The next stage is not to collect random GitHub projects. It is to fill the capability layers that make those patterns reliable for real use.

## Why This Backlog Exists

Most visual failures we saw were not caused by missing camera code alone.

They came from missing supporting capabilities:

- no real product model;
- weak textures and materials;
- no asset quality gate;
- no avatar / expression / motion system;
- no real-scene capture workflow;
- no WebGPU / low-level rendering reference;
- no production loading, compression, fallback, and deployment rules.

So this backlog tracks the foundation under the demos.

```text
3D expression pattern
  -> needs assets
  -> needs runtime architecture
  -> needs interaction model
  -> needs publishing path
  -> needs skill instructions
```

## Priority Map

| Priority | Capability | Why It Matters Now | Relationship To Existing Work |
| --- | --- | --- | --- |
| P0 | Real asset pipeline | Without real assets, product pages and videos look like placeholders. | Supports `product-viewer-story`, `cinematic-product-showcase`, portfolio covers, AI companion. |
| P0 | 3D Gaussian Splatting / real scenes | Adds real-world spatial capture, beyond mesh-only product/portfolio demos. | Complements product pages, digital twins, room/space showcases. |
| P1 | Avatar / VRM / Live2D / character motion | Needed for AI girlfriend, AI companion, mascot, virtual guide, and character-led products. | Turns AI companion from story case into reusable character display workflow. |
| P1 | WebGPU / low-level rendering | Keeps the skill accurate about next-generation browser GPU rendering. | Extends WebGL/shader explanations and future-proofs technical analysis. |
| P1 | Physics interaction | Needed for playable portfolios, product playgrounds, drag/drop scenes, spatial interaction. | Extends Bruno Simon / game-like portfolio research. |
| P2 | Engineering and publishing hardening | Makes prototypes usable in real websites and videos. | Supports all branches: loading, mobile, fallback, deployment, MP4 package. |

## P0: Real Asset Pipeline

### Relationship To Our Work

This is the foundation for every real 3D output.

It is not a separate product direction. It answers:

```text
How do we get usable 3D assets into the browser?
How do we judge whether they are good enough?
How do we prepare them for website or video use?
```

This directly explains why previous demos sometimes felt rough:

- procedural products looked toy-like;
- cars or devices looked stretched;
- scene materials felt like placeholders;
- close-up shots exposed weak geometry or texture quality.

### What To Research

Look for GitHub projects, docs, and tools around:

- glTF / GLB workflows;
- Blender to glTF export;
- Draco / Meshopt compression;
- KTX2 / Basis texture compression;
- model optimization and LOD;
- HDRI environment lighting;
- PBR material setup;
- asset validation and preview pipelines.

### Expected Outputs

- `templates/asset-intake-checklist.md`
- `templates/model-quality-gate.md`
- `references/asset-pipeline.md` for `webgl-product-film`
- optional local prototype: real GLB asset viewer with before/after optimization notes

Initial artifacts now exist:

- `templates/asset-intake-checklist.md`
- `templates/model-quality-gate.md`
- `analyses/2026-07-06-asset-pipeline-smoke.md`
- `C:\Users\yun68\.codex\skills\webgl-product-film\references\asset-pipeline.md`

### Skill Update

`webgl-product-film` should learn:

- if a product demo looks bad, inspect asset quality before changing camera code;
- if the user provides only an image, explain that 3D asset creation or generation is a separate step;
- if a GLB exists, inspect scale, geometry, materials, textures, file size, animation clips, and compression.

## P0: 3D Gaussian Splatting / Real Scenes

### Relationship To Our Work

Current prototypes are mostly mesh-based.

3D Gaussian Splatting adds a different kind of 3D scene:

```text
captured real-world space
  -> splat representation
  -> browser viewer
  -> spatial storytelling / digital twin / real scene showcase
```

This matters for real rooms, venues, architecture, tourism, retail spaces, exhibitions, and personal memory spaces.

### What To Research

Candidate directions:

- browser 3DGS viewers;
- PlayCanvas SuperSplat-style workflows;
- Spark / WebGL splat renderers;
- `.splat`, `.ply`, `.ksplat`, compressed splat formats;
- camera sorting and performance;
- mobile constraints;
- mesh vs splat decision rules.

### Expected Outputs

- `analyses/YYYY-MM-DD-3dgs-case.md`
- `templates/3dgs-capability-checklist.md`
- `references/gaussian-splatting.md` for `webgl-product-film`
- optional prototype: minimal splat viewer or documented runtime inspection

Initial artifacts now exist:

- `analyses/2026-07-06-3dgs-real-scenes.md`
- `11-3dgs-technical-guide.md`
- `templates/3dgs-capability-checklist.md`
- `prototypes/3dgs-real-scene-viewer/`
- `C:\Users\yun68\.codex\skills\webgl-product-film\references\gaussian-splatting.md`

Current status:

```text
P0 baseline complete.
```

Future deepening is optional and should focus on either:

- capture workflow from real photos/video to splat asset;
- local hosted splat assets;
- hybrid splat + GLB product / avatar scene.

### Skill Update

`webgl-product-film` should learn:

- when to recommend 3DGS instead of GLB;
- how splat scenes differ from mesh scenes;
- what file formats and performance risks to inspect;
- when real-scene capture serves a product or life scenario better than modeled geometry.
- when a hybrid scene needs splat visuals plus proxy mesh, GLB overlays, DOM hotspots, and guided camera paths.

## P1: Avatar / VRM / Live2D / Character Motion

### Relationship To Our Work

AI girlfriend, desktop companion, mascot, and virtual guide cases all depend on character assets.

This is not the mainline product direction. It is a reusable character display capability.

### What To Research

Candidate directions:

- VRM avatar display in Three.js / R3F;
- Live2D web runtimes;
- Ready Player Me integration;
- animation blending;
- expression / lip sync / gaze;
- idle behavior and emotional state;
- voice and subtitle synchronization.

### Expected Outputs

- `templates/avatar-character-input-brief.md`
- `templates/character-display-checklist.md`
- `references/character-avatar.md` for `webgl-product-film`
- optional prototype: character viewer with idle animation, expression switch, and voice/caption hooks

Initial artifacts now exist:

- `analyses/2026-07-06-avatar-character-motion.md`
- `12-character-avatar-technical-guide.md`
- `templates/avatar-character-input-brief.md`
- `templates/character-display-checklist.md`

Current status:

```text
P1 source-evidence and template baseline started.
```

Runtime evidence is still needed before marking this branch complete. The next optional prototype should isolate a real VRM, Live2D, Ready Player Me, or animated GLB character asset and prove idle motion, expression switching, camera framing, and voice/caption hooks.

### Skill Update

`webgl-product-film` should learn:

- character projects need identity, motion, expression, and voice rules, not only a model;
- AI companion / girlfriend should route to character validation, not general 3D product viewer;
- avatar quality depends on rigging, animation clips, expression control, and interaction timing.
- character branches should use `references/character-avatar.md` once the skill reference exists.

## P1: WebGPU / Low-Level Rendering

### Relationship To Our Work

We have explained WebGL, Three.js, shaders, and GPU rendering at a practical level.

WebGPU is the next browser GPU layer. We do not need to rewrite all prototypes with WebGPU now, but we should understand:

```text
WebGL vs WebGPU
shader model
render pipeline
compute potential
Three.js WebGPU renderer
when WebGPU matters
```

### What To Research

Candidate directions:

- official WebGPU samples;
- Three.js WebGPU renderer examples;
- compute shader demos;
- particle / simulation workloads;
- WebGPU limitations and browser support;
- migration decision rules from WebGL to WebGPU.

### Expected Outputs

- `references/webgpu-principles.md`
- `templates/webgpu-case-checklist.md`
- concept doc comparing WebGL, Three.js, WebGPU, shaders, CPU, GPU
- optional small prototype only if it teaches a concrete missing concept

### Skill Update

`webgl-product-film` should learn:

- when WebGPU is relevant and when WebGL/Three.js is enough;
- how to explain low-level GPU concepts without overclaiming;
- how to identify whether a project truly uses WebGPU or only abstracts over it.

## P1: Physics Interaction

### Relationship To Our Work

Game-like portfolios and spatial showrooms become more believable when interaction has physical response.

This extends Bruno Simon-style research:

```text
spatial world
  -> collision
  -> movement
  -> object response
  -> playful exploration
```

### What To Research

Candidate directions:

- `react-three-rapier`;
- cannon-es;
- vehicle / character controls;
- collisions and triggers;
- physics-driven UI nodes;
- performance and determinism risks.

### Expected Outputs

- `templates/physics-interaction-checklist.md`
- `references/physics-interaction.md`
- optional prototype: spatial node interaction or product playground with simple collisions

### Skill Update

`webgl-product-film` should learn:

- when physics adds value and when it is decorative overhead;
- how to inspect collision, controls, and interaction loops;
- how to keep physics from making portfolio/product pages harder to use.

## P2: Engineering And Publishing Hardening

### Relationship To Our Work

We can make demos run. The next problem is making them dependable.

This layer supports:

- real websites;
- mobile visitors;
- slow networks;
- social videos;
- maintainable prototypes;
- repeatable generation by Codex.

### What To Research

Candidate directions:

- code splitting and lazy model loading;
- asset compression;
- mobile fallback;
- reduced motion;
- accessibility around canvas-heavy pages;
- SEO for immersive pages;
- browser capture vs Remotion vs ffmpeg;
- deployment patterns.

### Expected Outputs

- `templates/3d-web-production-checklist.md`
- `templates/publishing-quality-gate.md`
- `references/production-hardening.md`
- optional smoke-test scripts for checking build, asset size, and missing files

### Skill Update

`webgl-product-film` should learn:

- to separate prototype success from production readiness;
- to check mobile, performance, loading, fallback, SEO, and accessibility;
- to package output differently for website vs video vs reusable template.

## Recommended Next Research Order

Recommended order:

1. Real asset pipeline.
2. 3D Gaussian Splatting / real scenes.
3. Avatar / VRM / Live2D.
4. WebGPU / low-level rendering.
5. Physics interaction.
6. Engineering and publishing hardening.

Why this order:

- asset quality blocks nearly every real output;
- real-scene display adds a missing category, not just polish;
- avatar work supports AI companion use cases without making them the mainline;
- WebGPU keeps technical explanations accurate;
- physics expands interactive worlds;
- production hardening becomes more valuable after more patterns exist.

## Completion Rule

Each backlog item is complete only when it produces:

1. one source analysis or evidence note;
2. one reusable checklist / template / reference;
3. one bounded conclusion about when to use the capability;
4. one explicit recommendation for whether `webgl-product-film` should change;
5. optional prototype only when runtime evidence is needed.

Do not mark a capability complete just because one impressive demo was found.
