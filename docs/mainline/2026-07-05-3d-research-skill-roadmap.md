# 3D Research Skill Roadmap

This roadmap clarifies the current project direction:

```text
Mainline:
  study 3D web technology
  -> extract reusable patterns
  -> improve the webgl-product-film skill
  -> later use the skill to build websites, demos, and videos

Demo projects:
  proof cases for the mainline, not the mainline itself
```

## Layer Model

| Layer | Meaning | Examples |
| --- | --- | --- |
| Technology | The underlying 3D capability | WebGL, Three.js, R3F, shaders, glTF, model-viewer, WebGPU |
| Pattern | A reusable way to use the technology | scroll-driven scene, product viewer, cinematic camera, spatial portfolio |
| Case | A concrete project used to verify a pattern | GrassSystem, r3f-scroll-rig, Bruno Simon, Google model-viewer |
| Prototype | Our local runnable experiment | grass film, scroll story, game portfolio, product viewer, cinematic showcase |
| Skill | Codex workflow that can reuse the learning | `webgl-product-film` |
| Product | A future real output using the skill | AI girlfriend page, desktop companion site, product launch page, portfolio, video |

## Correct Role Of AI Girlfriend / Desktop Companion

AI girlfriend or desktop companion is a product case.

It can help validate:

- character / avatar display;
- emotional product storytelling;
- voice, subtitles, and video packaging;
- scroll-driven product page structure;
- cinematic demo presentation.

But it is not the core research direction.

The core direction remains:

```text
Can we understand 3D web projects deeply enough to reuse their patterns through a skill?
```

## What We Have Already Learned

| Case | Reusable Learning |
| --- | --- |
| GrassSystemThreeJS | GPU-style grass display, wind parameters, scene direction, recording and publishing workflow |
| r3f-scroll-rig | DOM and WebGL can be synchronized through scroll progress and shared scene anchors |
| Bruno Simon / Samsy Ninja-style sites | Good 3D sites are not just rendering; they are authored worlds with story, interaction, assets, and proof |
| Google model-viewer | Product display can be handled by a high-level component when the goal is inspection, hotspots, and AR |
| Cinematic product showcase | Product animation needs model quality, camera language, pacing, feature beats, and publishable framing |

## What The Skill Should Become

The `webgl-product-film` skill should eventually help with five workflows:

1. Analyze a 3D web repo and explain how it works.
2. Map its rendering, asset, animation, interaction, and publishing capabilities.
3. Choose the right 3D expression pattern for a goal.
4. Generate a small prototype or product demo using that pattern.
5. Package the result as documentation, website, or video.

## Current Gaps

The skill is useful, but not complete.

Important gaps:

- asset intake and quality control;
- real GLB / glTF model workflow;
- character / avatar workflow;
- spatial knowledge graph workflow;
- WebGPU / low-level shader reference;
- mobile performance and fallback rules;
- stronger publishing workflow for MP4, cover, captions, and audio;
- clearer template-selection rules.

The detailed backlog for these gaps is now tracked in:

```text
webgl-product-research/10-missing-capability-backlog.md
```

## Next Work Sequence

The next mainline work should be:

1. Update the research case matrix so every case has a clear reusable capability.
2. Update the skill upgrade plan with only evidence-backed additions.
3. Add a prototype usage guide:
   - when to use grass film;
   - when to use scroll-driven 3D;
   - when to use product viewer;
   - when to use cinematic showcase;
   - when to use game-like portfolio;
   - when to use character / AI companion cases.
4. Use `webgl-product-research/10-missing-capability-backlog.md` to choose the next missing capability.
5. Decide the next research target based on missing capability, not visual excitement.
6. Only after that, run another validation case.

## Decision Rule

Before starting any new 3D implementation, ask:

```text
Is this a technology research case?
Is this a reusable pattern validation?
Is this a product demo using an existing pattern?
Is this only visual polishing?
```

If the answer is only visual polishing, pause.

If the answer improves reusable skill capability, continue.
