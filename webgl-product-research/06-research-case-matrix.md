# Research Case Matrix

This matrix answers two practical questions:

```text
Is the current webgl-product-film skill complete?
Are our research cases broad enough?
```

Current answer:

```text
Skill status: usable foundation, not a complete production system.
Case coverage: strong in 3D demo film, scroll-driven 3D websites, and game-like portfolios; still thin in product viewers, character systems, spatial data, real-world scenes, and production engineering.
```

## Why This Matrix Exists

The project should not collect random impressive WebGL demos. Each case should expand a reusable capability:

```text
source evidence
  -> runtime or prototype evidence
  -> bounded conclusion
  -> skill / template / demo / publishing update
```

If a case cannot teach a reusable capability, it should stay as inspiration rather than become part of the research core.

## Current Coverage

| Case | Category | What It Proves | Current Depth | Reusable Output |
| --- | --- | --- | --- | --- |
| `GrassSystemThreeJS` | Shader / procedural scene / product film | A standalone Three.js demo can become a directed technical product film. | Strong | capability guide, cinematic scene, recording/export path, publish package |
| `14islands/r3f-scroll-rig` | Scroll-driven DOM + WebGL website | Page layout and scroll progress can drive a persistent 3D canvas. | Medium-strong | analysis notes, evidence chain, scroll product prototype |
| `brunosimon/folio-2019` | Game-like spatial portfolio | A portfolio can become an explorable 3D world with physics, boards, assets, and sound. | Medium | analysis notes, game-like portfolio checklist, research showroom prototype |
| Desktop AI companion case | Optional character / product-story validation case | The story-driven website template can be applied to a concrete product idea, but this is not the repository mainline. | Medium | product input brief, storyboard, isolated prototype |
| `game-portfolio-story` | Internal synthesis prototype | Research samples can be displayed as spatial nodes with detail layers and Film Mode. | Medium | reusable skeleton, publishing notes, story-driven portfolio framework |
| `google/model-viewer` | Practical product viewer | A real product model can be embedded, inspected, annotated, configured, and previewed in AR through a high-level web component. | Medium | analysis note, isolated research entry, product viewer checklist, input brief, reusable prototype guide |
| `cinematic-product-showcase` | Cinematic product animation prototype | Product reveal, camera beats, feature visualization, and exploded-view thinking can be prototyped, but asset quality remains the limiting factor. | Early-medium | cinematic input brief, launch-animation prototype, product animation risks |

## Missing Capability Areas

| Priority | Area | Why It Matters | Candidate References | Expected Output |
| --- | --- | --- | --- | --- |
| P0 | Practical product viewer | Many real projects need inspectable products more than cinematic worlds. | `google/model-viewer`, Three.js model viewer examples | product viewer checklist, annotation/AR/control guidance, minimal product page |
| P0 | Cinematic product showcase refinement | Launch pages and product videos need authored animation, camera direction, part separation, and feature visualization. The first local prototype exists, but needs real assets and stronger production rules. | earphone launch pages, Three.js/R3F product demos, GSAP timelines | product animation checklist, asset-part separation guidance, camera timeline patterns |
| P0 | Real assets and asset pipeline | Visual quality often fails because assets are placeholders, unoptimized, or mismatched. | GLB workflows, texture pipelines, Draco/KTX2, real screenshots/covers | asset intake checklist, compression notes, quality gate |
| P1 | Character / AI companion display | Important for desktop companion, virtual assistant, mascot, and avatar products. | VRM, Live2D, Ready Player Me, Three.js animation examples | character display checklist, expression/motion/voice sync notes |
| P1 | R3F engineering style | Future prototypes should not be one-off large files. | `pmndrs/react-three-fiber`, `pmndrs/drei` | starter architecture, component boundaries, helper selection |
| P1 | Spatial knowledge graph | Useful for research maps, learning systems, memory palaces, and AI knowledge products. | force graph 3D, graph layouts, R3F node systems | node/detail/navigation pattern, data-to-space mapping |
| P2 | Architecture / digital twin | Real spaces are a major 3D use case beyond product pages. | Three.js BIM/room viewers, PlayCanvas examples | scene navigation checklist, floor/room/annotation pattern |
| P2 | 3D Gaussian Splatting | Browser-native real-world capture is becoming a new scene format. | `playcanvas/supersplat`, `sparkjsdev/spark`, `antimatter15/splat` | 3DGS capability map, mesh-vs-splat decision guide |
| P2 | Physics interaction | Game-like portfolios and product playgrounds need believable interaction. | `react-three-rapier`, cannon-es examples | physics value checklist, interaction risks |
| P3 | Low-level GPU / WebGPU | Keeps conceptual explanations accurate and future-facing. | Three.js WebGPU renderer, `webgpu/webgpu-samples` | WebGL/WebGPU/shader reference notes |
| P3 | Publishing pipeline | Web output alone is not enough when the goal is public sharing. | existing GrassSystem film pipeline, Remotion, ffmpeg | video package checklist, caption/voice/music/cover workflow |

## What A Complete Case Should Produce

Each future research case should end with five artifacts:

1. Source analysis: what the project actually does and where the evidence is.
2. Capability map: rendering, assets, motion, interaction, visual quality, publishing, risks.
3. Minimal prototype or runnable inspection: enough to see the capability, not necessarily a full product.
4. Reusable conclusion: what should enter `webgl-product-film`, and what should stay case-specific.
5. Next-use note: when a future product should choose this pattern.

## Skill Maturity Levels

| Level | Meaning | Current Status |
| --- | --- | --- |
| L1 Concept explanation | Explain WebGL, Three.js, shader, GPU, DOM/WebGL, scroll timelines. | Mostly covered |
| L2 Demo analysis | Inspect a repo and identify its reusable capabilities. | Covered for first three cases |
| L3 Prototype generation | Turn a case into a derivative demo or website skeleton. | Covered for grass, scroll, portfolio, desktop companion |
| L4 Publishable output | Produce video, cover, captions, audio, README, publish notes. | Covered mainly for GrassSystem |
| L5 Product-grade system | Handle real assets, mobile fallback, performance, SEO, accessibility, deployment, and maintenance. | Not yet covered |

## Recommended Next Sequence

The next research should reduce the biggest blind spots first:

1. Test `templates/product-viewer-input-brief.md` with a stronger real product asset and real product copy.
2. Use `templates/cinematic-product-showcase-input-brief.md` to start the next isolated product-animation case.
3. R3F + `drei`: standardize how future prototypes are structured so they do not become hard-to-maintain one-file demos.
4. Character / AI companion stack: use avatar, motion, expression, and voice as a validation case for character-driven 3D pages, not as the whole project direction.
5. Asset pipeline: make quality repeatable through model/texture compression, loading states, and visual QA.
6. Spatial knowledge graph: turn the research map itself into a useful knowledge product rather than only a showcase.

## Decision Rules

Use these rules when choosing the next case:

- If the user wants a real business/product page, prioritize product viewer and asset pipeline.
- If the user wants an AI companion or avatar, prioritize character systems.
- If the user wants a personal brand or portfolio, prioritize story-driven portfolio and authored assets.
- If the user wants a research/learning system, prioritize spatial knowledge graph.
- If the user wants cutting-edge rendering, prioritize 3D Gaussian Splatting or WebGPU.
- If the user wants to publish content, prioritize the film pipeline.

## Practical Conclusion

The current skill is worth keeping and using. It is not finished.

The next milestone is:

```text
From "we can make 3D demos understandable"
to "we can choose the right 3D expression pattern for a real goal."
```

That requires broader cases, not just more polishing of the current showroom.
