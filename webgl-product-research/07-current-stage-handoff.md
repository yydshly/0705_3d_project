# Current Stage Handoff

This document closes the current research stage and defines the next practical move.

## Current Stage Goal

The current stage was not to build one final website. It was to understand several different WebGL / Three.js product-expression patterns and decide how they should be reused.

The stage has produced four usable capability branches:

| Branch | What It Is | Best Use |
| --- | --- | --- |
| GrassSystemThreeJS film | Standalone shader / scene demo turned into a guided product film | Technical visual demo, publishable short video |
| Scroll-driven 3D website | DOM sections control a persistent WebGL scene | Immersive official site, product story page |
| Game-like 3D portfolio | A page becomes an explorable 3D world | Portfolio, research showroom, spatial navigation |
| Product viewer | One GLB product is inspectable with hotspots, material controls, and AR | Hardware product page, ecommerce detail, product inspection |

## What Is Stable Enough

The following capabilities are now reliable enough to reuse:

- Explaining WebGL / Three.js / shader / GPU concepts in product language.
- Turning a running 3D demo into a guided story instead of a raw technical playground.
- Designing Film Mode for a demo or 3D page.
- Recording and packaging a technical 3D demo into a shareable video.
- Building a scroll-driven 3D website skeleton.
- Building a spatial 3D portfolio / showroom skeleton.
- Building a `model-viewer` product inspection page with GLB, hotspots, camera views, material tone controls, guided tour, and AR affordance.

## What Is Still Not Stable

These areas should not be treated as solved yet:

- Production-quality asset pipeline: real GLB intake, texture compression, model optimization, visual QA.
- Cinematic product animation: product entry, exploded view, part separation, timeline-driven feature animation.
- Character / AI companion pipeline: avatar, expression, motion, voice sync, idle behavior.
- R3F engineering standards: component boundaries, scene composition, reusable hooks, performance structure.
- Production publishing for every prototype: SEO, mobile fallback, accessibility, deployment, long-term maintenance.

## Important Distinction

The current `product-viewer-story` prototype is a product viewer:

```text
inspect product
  -> rotate / zoom
  -> hotspots
  -> material variants
  -> AR
```

The earphone-style demo discussed later is a cinematic product showcase:

```text
directed camera
  -> product entrance
  -> part separation
  -> feature visualization
  -> timeline animation
  -> final hero shot
```

They are related, but they should be separate templates.

## Recommended Next Move

Do not keep polishing the current `model-viewer` prototype unless the goal is a practical product inspection page.

The next research milestone should be:

```text
cinematic-product-showcase
```

Purpose:

- Study the earphone / hardware launch-page pattern.
- Use Three.js or React Three Fiber instead of `model-viewer` when animation control matters.
- Build a small but real demonstration of product entrance, camera direction, exploded view, material changes, and final hero framing.
- Keep this isolated from existing prototypes.

Suggested location:

```text
webgl-product-research/prototypes/cinematic-product-showcase/
```

Current status:

```text
Started as a first procedural Three.js prototype.
It validates the animation pattern before introducing real product assets.
```

Scope decision:

```text
Keep the procedural earphone as a technical validation model.
Do not spend more effort polishing it toward commercial product realism.
If realism becomes the goal, start a real-asset case with GLB / Blender / generated 3D assets.
```

## Input Needed For A Real Product

For a real product, ask for:

1. Product name and one-sentence positioning.
2. Product images: front, side, back, detail shots if possible.
3. Product model if available: GLB / FBX / OBJ / CAD export.
4. Parts that should separate or animate.
5. Top 3-5 selling points.
6. Desired output: interactive page, launch video, ecommerce viewer, or all of them.

If only one image exists, the result should be described as a concept-level approximation, not an accurate product model.

## Next Case Success Criteria

The next case is successful only if it proves these capabilities:

- A product can enter the scene with intentional camera direction.
- At least two parts can separate or move as authored animation.
- At least one feature is visualized with a non-placeholder effect.
- The timeline can be played automatically.
- The result has a clear distinction from `model-viewer`: it is not just rotation plus hotspots.
- The README explains when to choose cinematic Three.js/R3F instead of `model-viewer`.

## Project Management Rule

Before starting the next prototype:

```text
current research docs
  -> checked
  -> committed or clearly staged
  -> next prototype created in an isolated directory
```

This prevents the research workspace from becoming a pile of partially related demos.
