# Mainline Reset: 3D Technology Research And Skill Building

This document corrects the project mainline after the WebGL / Three.js exploration work.

## Correct Mainline

The mainline is:

```text
research 3D web technology
  -> understand representative projects
  -> extract reusable implementation patterns
  -> validate patterns with small prototypes
  -> update reusable docs, templates, and skills
  -> use those skills later to generate real product demos, websites, and videos
```

In short:

```text
3D research -> evidence -> prototype -> reusable skill
```

## What Is Not The Mainline

The mainline is not a single product direction.

These are demonstration cases, not the core goal:

| Case | Role |
| --- | --- |
| Grass / abandoned car scene | Shader, instancing, vegetation, wind, cinematic film pipeline |
| Scroll-driven 3D website | DOM + WebGL synchronization and scroll storytelling |
| Game-like portfolio | Spatial navigation, project nodes, authored story world |
| Product viewer | GLB/glTF inspection, hotspots, camera views, AR-style publishing |
| Cinematic product showcase | Camera direction, feature beats, exploded-view thinking |
| AI girlfriend / desktop companion | Possible product-story case for validating the skill |

The AI companion direction can still be useful, but only as one validation case. It should not replace the broader 3D research and skill-building mainline.

## Why This Matters

The value of this repository is not that one demo looks impressive.

The value is that we are learning how to repeatedly answer:

```text
What does this 3D project actually do?
How is it implemented?
Which lower-level technology does it use?
What interaction or rendering pattern can be reused?
Can we explain it visually?
Can we turn it into a reusable workflow or Codex skill?
Can we later use that skill to build a product page, portfolio, or video?
```

## Current Capability Map

| Capability Area | Current Evidence |
| --- | --- |
| GPU vegetation / shaders | `GrassSystemThreeJS-demo/` |
| Product film workflow | Grass scene recording, captions, voiceover, music, WebM/MP4 thinking |
| Scroll-driven immersive site | `r3f-scroll-rig` research and prototype |
| Game-like 3D portfolio | Bruno Simon / Samsy Ninja-style analysis and showroom prototype |
| Product model display | `google/model-viewer` analysis and product viewer prototype |
| Cinematic product animation | `cinematic-product-showcase/` |
| Skill packaging | `webgl-product-film` skill and research templates |

## Current Problem

We drifted between:

- understanding technology;
- making visual demos;
- polishing product-like pages;
- discussing publishable videos;
- discussing AI companion products.

Those are related, but not the same layer.

The corrected structure is:

```text
mainline:
  3D technology research + reusable skill sedimentation

cases:
  grass film
  scroll website
  game portfolio
  product viewer
  cinematic product
  AI companion / AI girlfriend if useful

outputs:
  docs
  templates
  prototypes
  skill updates
  optional demo videos
```

## Next Useful Work

Do not immediately start another product demo.

The next useful work is to consolidate the research:

1. Review the current case matrix.
2. Identify what capability each case proves.
3. Identify what the `webgl-product-film` skill already knows.
4. Identify what is still missing from the skill.
5. Add a practical usage guide: when to use each prototype, what input is required, and what output it can generate.
6. Only then choose the next research target or validation case.

## Success Criteria

The next milestone is successful if the repository can answer:

```text
I want to understand a 3D web project. What process should I follow?
I want to build a 3D product page. Which template should I use?
I want to make a 3D portfolio. Which case should I study?
I want to make a publishable 3D video. Which pipeline should I reuse?
I want Codex to help me do this later. Which skill should it call?
```

It is not successful merely because:

- a new page renders;
- a model moves;
- a demo looks more polished;
- an AI companion page exists.

## Immediate Next Action

Return to research consolidation:

```text
webgl-product-research/
  -> case matrix
  -> skill upgrade plan
  -> prototype usage guide
  -> next research roadmap
```

Use demo projects only as evidence for skill improvement.
