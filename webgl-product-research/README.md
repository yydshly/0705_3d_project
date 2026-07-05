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
```

The current priority is `brunosimon/folio-2019`, because it fills a missing research category: how a portfolio or product collection can become an explorable 3D world instead of a scroll-only page.

## Files

- `01-project-map.md`: candidate projects grouped by capability.
- `02-research-roadmap.md`: phased research plan.
- `03-skill-upgrade-plan.md`: how research should upgrade `webgl-product-film`.
- `04-product-direction.md`: possible product directions from this research.
- `templates/project-analysis-template.md`: reusable template for analyzing each project.
- `templates/game-like-portfolio-capability-checklist.md`: reusable checklist for game-like 3D portfolios, product museums, AI tool showrooms, and virtual exhibitions.

## Analyses

- `analyses/2026-07-05-r3f-scroll-rig.md`: first case study, focused on DOM/WebGL synchronization and scroll-driven immersive websites.
- `analyses/2026-07-05-r3f-scroll-rig-evidence-chain.md`: clean evidence chain for deciding what can be safely added to `webgl-product-film`.
- `analyses/2026-07-05-bruno-simon-folio-2019.md`: third research sample, focused on game-like 3D portfolio architecture, physics interaction, spatial project boards, and reusable product/portfolio exhibition patterns.

## Cases

- `cases/desktop-companion/`: first real-product case for validating the scroll-driven 3D product page template against a Desktop Companion / desktop AI companion story.

## Prototypes

- `prototypes/scroll-product-story/`: first derivative prototype that combines HTML story sections, `r3f-scroll-rig`, a global WebGL canvas, scroll-driven 3D object changes, and a directed Film Mode auto-progression. It now also includes `TEMPLATE_GUIDE.md` for reusing the pattern as a 3D product website base.
- `prototypes/desktop-companion-story/`: isolated real-case prototype derived from `scroll-product-story`, focused on a warm desktop AI companion product story.
- `prototypes/game-portfolio-story/`: third derivative prototype inspired by `brunosimon/folio-2019`, focused on a controllable 3D research hub with station boards, interaction areas, camera follow, and guided tour mode.
