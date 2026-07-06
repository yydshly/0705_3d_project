# Skill Upgrade Plan

Current Skill:

```text
C:\Users\yun68\.codex\skills\webgl-product-film
```

Current status:

- Valid v1 Skill.
- Proven on one case: GrassSystemThreeJS.
- Strong at: project scanning, capability mapping, cinematic demo transformation, video publishing.
- Weak at: immersive website analysis, scroll-driven storytelling, product viewer workflows, 3DGS workflows, director templates.

## Upgrade Principle

Do not upgrade the Skill from imagination alone.

Upgrade it after each real research case reveals a repeated pattern, a missing checklist, or a reusable script.

For each upgrade, keep an evidence chain:

```text
source evidence
  -> prototype or runtime evidence
  -> bounded conclusion
  -> skill update
```

Current evidence chain:

```text
analyses/2026-07-05-r3f-scroll-rig-evidence-chain.md
```

Current missing-capability backlog:

```text
10-missing-capability-backlog.md
```

Use the backlog to decide which reference files or templates should be added next. Do not add new skill branches until a backlog item has source evidence, runtime or prototype evidence, and a bounded conclusion.

## Candidate v2 Additions

### 0. Prototype Selection Router

Problem:

- The Skill can analyze and transform a 3D demo, but it does not yet clearly choose which local prototype pattern to reuse for a future goal.

Add to Skill:

- A first-step routing question: is the goal technical explanation, scroll website, portfolio/showroom, product viewer, cinematic product animation, character case, or publishing?
- A reference to the prototype usage guide:

```text
webgl-product-research/09-prototype-usage-guide.md
```

Evidence:

- The current workspace now has multiple runnable branches.
- Without routing, the work can drift into polishing the wrong demo.
- The guide separates mainline skill building from optional product validation cases such as AI companion / AI girlfriend.

### 1. Immersive Website Analysis

Triggered by:

- Portfolio sites.
- Scroll-driven product pages.
- Samsy Ninja-style websites.
- DOM + WebGL hybrid pages.

Add to Skill:

- When to inspect DOM/3D synchronization.
- How to trace scroll progress into camera/object transforms.
- How to evaluate whether 3D supports content or distracts from it.
- How to design fallback for mobile and weak GPUs.

Reference file candidate:

```text
references/immersive-website.md
```

First evidence:

- `14islands/r3f-scroll-rig` shows that immersive websites need a separate analysis branch.
- The key mechanism is a persistent global Canvas plus DOM proxy tracking.
- Skill v2 should inspect `GlobalCanvas`, DOM refs, scroll state, camera/object synchronization, viewport visibility, and mobile/fallback behavior.
- The concrete source evidence is now tracked in `analyses/2026-07-05-r3f-scroll-rig-evidence-chain.md`.

Prototype evidence:

- `webgl-product-research/prototypes/scroll-product-story` validates the same architecture in our own code.
- The Skill should explicitly support a dual-mode output: interactive scroll page first, recordable Film Mode second.
- A future `references/immersive-website.md` should include the pattern `HTML sections -> DOM anchors -> ScrollScene -> UseCanvas -> GlobalCanvas -> Film Mode`.
- The prototype now has a reusable `TEMPLATE_GUIDE.md`, which can become the first draft source for `references/immersive-website.md`.
- The current reusable implementation pattern is: chapter data drives copy, DOM anchors drive 3D placement, and `scrollState` drives product transformation.

### 2. Director Templates

Problem:

- The current Skill says to design a story, but does not provide concrete pacing patterns.

Add templates:

- 30-second quick technology preview.
- 60-second product capability film.
- 90-second full scene-building story.
- Website first-screen interaction demo.

Reference file candidate:

```text
references/director-templates.md
```

### 2b. Story-Driven 3D Portfolio Generation

Triggered by:

- Samsy Ninja-style personal websites.
- Game-like project collections.
- Brand/product sites that need a memorable 3D world.
- Requests like "make a 3D portfolio", "make an immersive product website", or "turn my projects into a 3D exhibition".

Add to Skill:

- Start with identity before 3D implementation.
- Ask for brand, audience, emotional tone, visual world, main memorable object, and 3-5 content nodes.
- Treat nodes as story material, not as the story itself.
- Keep WebGL responsible for spatial memory, atmosphere, model/asset presentation, camera, and transitions.
- Keep DOM responsible for readable copy, controls, navigation, detail panels, and publishing information.
- Require proof for each node: cover, screenshot, model, link, video, or source artifact.
- Include Film Mode as a director script even when recording/export is not requested yet.

Evidence:

- `prototypes/game-portfolio-story/` validates spatial nodes, detail layers, covers, Film Mode, and publishing notes.
- `05-story-driven-3d-portfolio-framework.md` summarizes the bounded conclusion: our current demo is a 3D portfolio skeleton, while Samsy Ninja-style maturity depends on brand story, assets, camera direction, and visual identity.

Reference file candidate:

```text
references/story-driven-portfolio.md
```

### 3. Visual Problem Diagnosis

Problem:

- We repeatedly diagnosed issues manually in GrassSystemThreeJS.

Add checklist:

- Model looks stretched.
- Object floats or sinks.
- Ground material looks wrong.
- Camera is too close or too repetitive.
- Wind/growth/particles look mechanical.
- Scene lacks clouds, depth, scale, or atmosphere.
- Audio ends after video or video ends before audio.

Reference file candidate:

```text
references/visual-diagnostics.md
```

### 4. Product Viewer Workflow

Triggered by:

- GLB product displays.
- Configurators.
- Ecommerce or education.
- AR preview.

Add to Skill:

- Product inspection checklist.
- Camera/control defaults.
- Annotation and hotspot patterns.
- Environment lighting and material fidelity.
- Practical publishing expectations.

Reference file candidate:

```text
references/product-viewer.md
```

### 5. 3DGS / Real-World Scene Workflow

Triggered by:

- Gaussian splatting projects.
- Real scanned rooms.
- Spatial scene viewers.
- Splat editing/publishing tools.

Add to Skill:

- How 3DGS differs from mesh-based GLB.
- What to inspect: format, sorting, streaming, compression, mobile performance.
- When 3DGS is useful for product/life scenarios.

Reference file candidate:

```text
references/gaussian-splatting.md
```

### 6. Research-to-Skill Update Loop

Add a simple rule:

```text
After studying a project, extract:
1. Reusable concept
2. Reusable checklist item
3. Reusable script/template opportunity
4. Whether to update SKILL.md or a reference file
```

## What Not To Add

- Full cloned repositories.
- Long marketing descriptions.
- Raw copied README content.
- API keys or private credentials.
- Every interesting link.
- One-off opinions not validated by a second project.

## Proposed v2 Trigger Refinement

Current Skill trigger is broad. After more research, refine it toward:

```text
Use when turning a WebGL/Three.js/R3F/3DGS project into a clear product demo, immersive website analysis, or publishable film.
```

This reduces accidental triggering for simple WebGL concept questions.
