# Mainline Return

This document records the decision to stop expanding technical demos for now and return to the project mainline.

## Why We Stop Here

The current research has answered the core technical question:

```text
Can WebGL / Three.js capabilities be understood, demonstrated, guided, recorded, and reused?
```

Current answer:

```text
Yes, at the prototype and workflow level.
```

The remaining quality gap is no longer mainly code. It is product definition, real assets, model quality, art direction, and publishing polish.

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

## Project Mainline

The mainline is now:

```text
real goal
  -> choose the right 3D expression pattern
  -> collect or generate real assets
  -> build one focused prototype
  -> package it for website or video
  -> update the reusable skill only from evidence
```

## Recommended Next Action

Pick one real direction before writing more 3D code:

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

4. AI companion product:
   - Use `desktop-companion-story/` or `desktop-ai-companion-site/`.
   - Need product positioning, character/companion assets, interaction story.
   - Best for the desktop companion direction.

## Input Required From User Next

The next useful user input should be one of:

```text
I want to make a real product page for: ...
I want to make a launch video for: ...
I want to make a 3D portfolio for: ...
I want to continue the AI companion product direction with: ...
```

Minimum useful input:

- product / brand / project name;
- target output: webpage, video, demo, portfolio;
- available assets: image, GLB, screenshot, logo, copy;
- desired audience and platform.

## Current Decision

The cinematic earphone prototype is now legacy evidence:

```text
Keep it.
Do not polish its procedural model further.
Use it only to explain and reuse animation mechanics.
```

The next valuable work is a real-asset, real-product, or real-brand case.
