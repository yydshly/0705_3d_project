# Mainline Return

This document records the decision to stop expanding isolated technical demos for now and return to the real project mainline: 3D technology research and reusable skill sedimentation.

For the actual project mainline, read:

```text
../docs/mainline/2026-07-05-mainline-reset.md
```

This file remains as the WebGL research handoff. It is not the mainline plan.

## Why We Stop Here

The current research has answered the core technical question:

```text
Can WebGL / Three.js capabilities be understood, demonstrated, guided, recorded, and reused?
```

Current answer:

```text
Yes, at the prototype and workflow level.
```

The remaining gap is not only code quality. It is whether we can turn each case into reusable understanding: capability maps, implementation notes, templates, and skill instructions.

## What We Keep

Keep these as reusable technical branches:

| Branch | Keep As | Do Not Treat As |
| --- | --- | --- |
| `GrassSystemThreeJS-demo/` | Technical product film pipeline | General website template |
| `scroll-product-story/` | Scroll-driven 3D website skeleton | Final brand site |
| `game-portfolio-story/` | Spatial portfolio / research showroom skeleton | Samsy Ninja-level finished work |
| `product-viewer-story/` | Practical GLB product inspection template | Cinematic launch animation |
| `cinematic-product-showcase/` | Cinematic animation mechanics prototype | Commercial-quality product model |

## What We Stop Doing

Stop spending time on:

- polishing procedural placeholder models;
- adding more abstract 3D scenes without a real product goal;
- treating visual quality issues as if code alone will solve them;
- adding recording/export before the story and asset quality justify it;
- mixing product viewer, cinematic showcase, portfolio, and film pipeline into one prototype.

## Research-To-Mainline Handoff

The WebGL research should now hand off into:

```text
case evidence
  -> capability map
  -> implementation principle
  -> reusable template
  -> skill update
  -> later product / website / video generation
```

Do not treat any single demo case as the mainline. Grass, product viewer, portfolio, cinematic showcase, and AI companion are all evidence cases for the broader 3D skill.

## Recommended Next Action From Research

Consolidate the research before writing more demo code:

```text
06-research-case-matrix.md
03-skill-upgrade-plan.md
templates/
../docs/mainline/2026-07-05-mainline-reset.md
```

Possible validation cases remain available:

1. Real product page:
   - Use `product-viewer-story/`.
   - Need a real GLB or product asset.
   - Best for ecommerce, official product pages, AR preview.

2. Cinematic launch video / website:
   - Use `cinematic-product-showcase/` as animation reference.
   - Need a high-quality model or a separate generated asset case.
   - Best for earphone-style demos, hardware launches, social videos.

3. Personal / brand 3D portfolio:
   - Use `game-portfolio-story/` or `scroll-product-story/`.
   - Need real identity, projects, images, proof assets.
   - Best for Samsy Ninja-style experience.

4. AI companion / AI girlfriend product:
   - Use `desktop-companion-story/` or `desktop-ai-companion-site/`.
   - Need product positioning, character/companion assets, interaction story.
   - Best as a validation case for product-story and character-driven 3D pages.

## Input Required From User Next

The next useful user input should be one of:

```text
I want to study another 3D project: ...
I want to improve the skill for this scenario: ...
I want to turn this prototype into a reusable template: ...
I want to use the current skill to make a product page / video / portfolio for: ...
```

Minimum useful input:

- target layer: research, skill update, template, demo, or publishable output;
- source project or case;
- available assets or evidence;
- desired reusable output.

## Current Decision

The cinematic earphone prototype is now legacy evidence:

```text
Keep it.
Do not polish its procedural model further.
Use it only to explain and reuse animation mechanics.
```

The next valuable work is research consolidation: make the repository explain what we learned, when each branch should be used, and how the `webgl-product-film` skill should apply it later.
