# WebGL Product Research

This directory records our research plan for modern WebGL, Three.js, React Three Fiber, WebGPU, and 3D Gaussian Splatting projects.

The goal is not to collect impressive demos. The goal is to understand reusable product capabilities, improve the `webgl-product-film` Codex skill, and eventually build our own 3D product/showcase workflow.

## Start Here

For the full workspace-level guide, start with:

```text
../README.md
```

That document explains why this research exists, how it connects to `GrassSystemThreeJS-demo`, and how to choose the next action.

## Core Questions

1. What capability does each project represent?
2. What can we learn from its implementation, interaction model, and visual direction?
3. Which parts should be added to our `webgl-product-film` skill?
4. Which parts can become our own product features?

## Research Layers

- Immersive website and portfolio: scroll-linked 3D, DOM/WebGL synchronization, storytelling.
- Modern Three.js ecosystem: React Three Fiber, helpers, post-processing, physics.
- Product display: 3D model viewers, AR, product inspection, publishing.
- Real-world scene display: 3D Gaussian Splatting, scanned spaces, browser-native spatial scenes.
- Low-level GPU foundation: WebGL, WebGPU, shaders, render pipelines.

## Current Research State

The research now has three concrete samples:

```text
GrassSystemThreeJS
  -> shader / GPU vegetation / cinematic technical demo

14islands/r3f-scroll-rig
  -> scroll-driven DOM + WebGL immersive product page

brunosimon/folio-2019
  -> game-like 3D portfolio, physics, spatial interaction, project boards

google/model-viewer
  -> practical product 3D viewer, annotations, camera controls, AR, product-page publishing
```

The current priority has moved beyond proving the 3D portfolio skeleton. We now know that Samsy Ninja-style output is not mainly about "more 3D"; it is about story, identity, authored assets, camera direction, and proof.

Current focus:

```text
story-driven 3D portfolio generation
  -> brand identity
  -> spatial nodes
  -> detail layers
  -> Film Mode
  -> publishing assets
  -> reusable skill/template input
```

## Files

- `01-project-map.md`: candidate projects grouped by capability.
- `02-research-roadmap.md`: phased research plan.
- `03-skill-upgrade-plan.md`: how research should upgrade `webgl-product-film`.
- `04-product-direction.md`: possible product directions from this research.
- `05-story-driven-3d-portfolio-framework.md`: summary of what Samsy Ninja-style sites teach us, what our prototype validates, and what input future 3D website generation needs.
- `06-research-case-matrix.md`: current case coverage, missing capability areas, and the next research sequence for maturing the skill.
- `07-current-stage-handoff.md`: current-stage closeout, stable capabilities, unsolved gaps, and the recommended next move toward cinematic product showcases.
- `08-mainline-return.md`: decision record for stopping abstract demo expansion and returning to real product / real asset / real brand cases.
- `templates/project-analysis-template.md`: reusable template for analyzing each project.
- `templates/product-viewer-input-brief.md`: input brief for generating a practical 3D product viewer page from product name, model, hotspots, variants, and AR needs.
- `templates/product-viewer-capability-checklist.md`: reusable checklist for product viewer cases such as `google/model-viewer`.
- `templates/cinematic-product-showcase-input-brief.md`: input brief for launch-page style product animation with entrance, exploded views, feature visualization, and final hero shots.
- `templates/story-driven-3d-website-input-brief.md`: reusable input brief for generating 3D portfolios, immersive brand sites, and spatial product pages.
- `templates/game-like-portfolio-capability-checklist.md`: reusable checklist for game-like 3D portfolios, product museums, AI tool showrooms, and virtual exhibitions.

## Analyses

- `analyses/2026-07-05-r3f-scroll-rig.md`: first case study, focused on DOM/WebGL synchronization and scroll-driven immersive websites.
- `analyses/2026-07-05-r3f-scroll-rig-evidence-chain.md`: clean evidence chain for deciding what can be safely added to `webgl-product-film`.
- `analyses/2026-07-05-bruno-simon-folio-2019.md`: third research sample, focused on game-like 3D portfolio architecture, physics interaction, spatial project boards, and reusable product/portfolio exhibition patterns.
- `analyses/2026-07-05-google-model-viewer.md`: practical product viewer case, focused on GLB/glTF display, hotspots, camera controls, material variants, loading behavior, and AR publishing.

## Cases

- `cases/desktop-companion/`: first real-product case for validating the scroll-driven 3D product page template against a Desktop Companion / desktop AI companion story.

## Prototypes

- `prototypes/scroll-product-story/`: first derivative prototype that combines HTML story sections, `r3f-scroll-rig`, a global WebGL canvas, scroll-driven 3D object changes, and a directed Film Mode auto-progression. It now also includes `TEMPLATE_GUIDE.md` for reusing the pattern as a 3D product website base.
- `prototypes/desktop-companion-story/`: isolated real-case prototype derived from `scroll-product-story`, focused on a warm desktop AI companion product story.
- `prototypes/game-portfolio-story/`: third derivative prototype inspired by `brunosimon/folio-2019` and Samsy Ninja-style immersive portfolios. It now validates spatial nodes, detail layers, replaceable covers, Film Mode, and a lightweight publishing package.
- `prototypes/product-viewer-story/`: practical product viewer prototype using `@google/model-viewer`, focused on one inspectable GLB object, hotspots, camera views, material tone controls, AR affordance, and a reusable template guide.
- `prototypes/cinematic-product-showcase/`: first cinematic product-animation prototype using Three.js, focused on product entrance, directed camera motion, feature visualization, exploded view, energy particles, and final hero framing.

## Current Next Step

The next useful move is not another abstract 3D demo. The technical foundation is now enough to return to the project mainline.

For the mainline direction, read:

```text
../docs/mainline/2026-07-05-mainline-reset.md
```

Next priority:

```text
Continue the Desktop Companion / AI companion product direction.
```

Recommended work:

1. Read `../docs/mainline/2026-07-05-mainline-reset.md`.
2. Use `../docs/superpowers/plans/2026-07-05-desktop-companion-v1-product-demo.md` as the execution anchor.
3. Treat the 3D prototypes as supporting techniques, not the goal.
4. Continue in `prototypes/desktop-companion-story/` unless the product direction changes.
5. Reconnect recording/export only after the product story and assets are convincing.
