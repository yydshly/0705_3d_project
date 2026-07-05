# Research Roadmap

The roadmap should move from practical product value to deeper technical capability.

## Phase 1: Immersive Website Foundation

Primary project:

- `14islands/r3f-scroll-rig`

Goal:

- Understand how 3D objects are synchronized with normal web layout and scrolling.
- Learn how a page becomes a narrative 3D experience.
- Decide how our Skill should analyze immersive websites.

Deliverables:

- One project analysis using `templates/project-analysis-template.md`.
- A short capability diagram.
- A list of Skill upgrades for scroll-linked 3D.
- Decision: should we clone/run it as the next hands-on case?

Success criteria:

- We can explain how scroll controls camera/object state.
- We can identify what is reusable for a product showcase page.
- We can define a small demo idea inspired by it.

## Phase 2: Game-Like Spatial Portfolio

Primary projects:

- `brunosimon/folio-2019`

Goal:

- Understand how a portfolio can become an explorable 3D world.
- Learn how physics, camera follow, project boards, sounds, and authored assets create a spatial experience.
- Decide when a product/portfolio should use free exploration instead of scroll-driven storytelling.

Deliverables:

- Source-level analysis note.
- Local runnable project copy with compatibility fixes.
- Capability checklist for game-like 3D portfolios.
- Minimal derivative prototype: `prototypes/game-portfolio-story/`.

Success criteria:

- We can explain the difference between "3D model inside a page" and "page as a 3D world".
- We can map a product or portfolio list into areas, boards, interaction zones, and navigation entities.
- We can identify which parts are reusable and which parts depend on custom assets.

## Phase 3: Modern R3F Working Style

Primary projects:

- `pmndrs/react-three-fiber`
- `pmndrs/drei`

Goal:

- Understand the mainstream React + Three.js architecture.
- Learn how scenes are decomposed into components.
- Identify helpers that reduce friction for product demos.

Deliverables:

- R3F architecture notes.
- List of helpers useful for our future templates.
- Comparison with plain Three.js style from GrassSystemThreeJS.

Success criteria:

- We can decide when to use plain Three.js and when to use R3F.
- We can define a starter structure for a future immersive product page.

## Phase 4: Product Viewer Pattern

Primary project:

- `google/model-viewer`

Goal:

- Learn how product 3D display is made practical for real users.
- Understand model loading, inspection, AR, annotations, environment lighting, and publishing.

Deliverables:

- Product-viewer capability checklist.
- Notes on default controls and user expectations.
- Skill upgrade notes for product inspection workflows.
- Minimal derivative prototype: `prototypes/product-viewer-story/`.

Success criteria:

- We can distinguish product viewer needs from cinematic demo needs.
- We can design a practical 3D product display page.
- We can decide when to use `model-viewer` instead of custom Three.js/R3F.

## Phase 5: Real-World Spatial Scene

Primary projects:

- `sparkjsdev/spark`
- `playcanvas/supersplat`
- `antimatter15/splat`

Goal:

- Understand 3D Gaussian Splatting as a new browser scene capability.
- Compare minimal viewer, advanced renderer, and full editor/product workflow.

Deliverables:

- 3DGS capability map.
- Notes on splat/mesh integration.
- Future product ideas using real scanned spaces.

Success criteria:

- We can explain when 3DGS is better than GLB models.
- We can decide whether 3DGS belongs in our product roadmap.

## Phase 6: Low-Level GPU Understanding

Primary projects:

- `mrdoob/three.js`
- `webgpu/webgpu-samples`

Goal:

- Deepen technical understanding of WebGL, WebGPU, shader, and rendering pipelines.
- Avoid treating GPU rendering as magic.

Deliverables:

- Technical principle notes for the Skill.
- WebGL vs WebGPU comparison.
- Future-facing research backlog.

Success criteria:

- We can explain the rendering stack clearly.
- We know what belongs in product work now and what should stay as future research.

## Immediate Next Step

Close the current research stage before starting another prototype.

Recommended process:

1. Treat `prototypes/game-portfolio-story/` as enough evidence for the 3D portfolio skeleton.
2. Treat `prototypes/product-viewer-story/` as enough evidence for the practical `model-viewer` product-inspection branch.
3. Use `07-current-stage-handoff.md` as the closeout document for this stage.
4. Use `06-research-case-matrix.md` to choose future gaps deliberately.
5. If continuing from the earphone-style reference, start an isolated `prototypes/cinematic-product-showcase/` branch instead of extending `product-viewer-story`.

## Next Planned Stage: Cinematic Product Showcase

Primary direction:

- Earphone / hardware launch-page style product animation.

Goal:

- Understand how a product page becomes a directed 3D product film rather than a static viewer.
- Learn product entrance, camera choreography, exploded views, part separation, feature visualization, material changes, and final hero framing.
- Decide when a project should use custom Three.js / React Three Fiber instead of `model-viewer`.

Expected deliverables:

- Input brief for cinematic hardware product demos.
- Minimal isolated prototype under `prototypes/cinematic-product-showcase/`.
- README explaining the difference between product viewer and cinematic showcase.
- Capability checklist for product animation and exploded-view demos.

Success criteria:

- The demo proves authored animation, not only camera rotation.
- At least two product parts can separate or move.
- At least one feature is visualized with a real effect rather than text only.
- The timeline can play automatically and can later become a recorded video.
