# Prototype Usage Guide

This guide turns the current prototypes into reusable choices for the `webgl-product-film` skill.

The goal is not to say which demo looks best. The goal is to answer:

```text
Given a goal, which 3D pattern should we use?
What input does it need?
What can it output?
What should enter the skill later?
```

## Quick Decision Table

| User Goal | Best Starting Point | Why |
| --- | --- | --- |
| Understand a shader / GPU scene | `GrassSystemThreeJS-demo/` | Best evidence for procedural grass, wind, terrain, lighting, camera direction, and technical film packaging. |
| Make a 3D official website or product story page | `prototypes/scroll-product-story/` | Best evidence for DOM sections driving a persistent WebGL scene. |
| Make a Samsy Ninja-style portfolio or research showroom | `prototypes/game-portfolio-story/` | Best evidence for spatial nodes, detail layers, authored world structure, and guided Film Mode. |
| Display and inspect a real product model | `prototypes/product-viewer-story/` | Best evidence for glTF / GLB viewing, hotspots, camera views, material variants, and AR-style publishing. |
| Make a launch-style product animation | `prototypes/cinematic-product-showcase/` | Best evidence for camera beats, product entrance, feature visualization, particles, and exploded-view thinking. |
| Test character / companion storytelling | `prototypes/desktop-companion-story/` or `prototypes/desktop-ai-companion-site/` | Useful validation case for avatar, personality, emotion, memory, and product-story presentation. Not the mainline. |

## Pattern 1: Technical Scene To Product Film

Use when the source is a standalone WebGL / Three.js demo with visible rendering capability.

Starting point:

```text
GrassSystemThreeJS-demo/
```

Best for:

- shader-driven effects;
- GPU instancing;
- vegetation, terrain, particles, wind, weather;
- turning a technical scene into a publishable explanatory video.

Required input:

- source repo or local project;
- the core technical capability to explain;
- target video length and platform;
- whether captions, voiceover, music, cover, and MP4 export are required.

Expected output:

- capability guide;
- directed scene timeline;
- record controls;
- WebM / MP4 output;
- cover image;
- captions / voiceover / publish notes when needed.

Skill implication:

```text
webgl-product-film should keep this as the "technical demo -> guided film" branch.
```

## Pattern 2: Scroll-Driven 3D Website

Use when the desired output is still a webpage, but scroll should drive 3D state changes.

Starting point:

```text
webgl-product-research/prototypes/scroll-product-story/
```

Best for:

- product pages;
- immersive landing pages;
- technology explainers;
- brand pages where text and 3D should advance together.

Required input:

- product / topic name;
- 4-6 story sections;
- what changes in each section;
- model or procedural object;
- target audience and tone.

Expected output:

- HTML content sections;
- persistent WebGL canvas;
- scroll-driven model / camera / material changes;
- optional Film Mode;
- reusable page template.

Skill implication:

```text
webgl-product-film should treat DOM/WebGL synchronization as a separate branch, not as ordinary Three.js animation.
```

## Pattern 3: Story-Driven 3D Portfolio / Showroom

Use when the goal is a spatial site with multiple nodes, projects, or knowledge areas.

Starting point:

```text
webgl-product-research/prototypes/game-portfolio-story/
```

Best for:

- personal portfolio;
- research atlas;
- product ecosystem showroom;
- game-like brand world;
- Samsy Ninja-style exploratory presentation.

Required input:

- identity / brand direction;
- main world metaphor;
- 3-7 content nodes;
- proof assets for each node;
- desired navigation: guided, free exploration, or mixed.

Expected output:

- spatial nodes;
- detail panel per node;
- path / atlas navigation;
- optional auto tour;
- publishing notes and cover assets.

Skill implication:

```text
The skill should ask for identity and proof assets before building 3D nodes.
Good portfolio pages are story worlds, not floating cards.
```

## Pattern 4: Product Model Viewer

Use when the user already has, or can obtain, a real product model.

Starting point:

```text
webgl-product-research/prototypes/product-viewer-story/
```

Best for:

- ecommerce product inspection;
- device / hardware demos;
- model annotation;
- material variants;
- AR-style preview.

Required input:

- GLB / glTF model;
- product name and positioning;
- camera views;
- hotspots / annotations;
- available variants;
- target platform.

Expected output:

- inspectable product viewer;
- hotspots;
- camera presets;
- material / variant controls;
- practical publishing page.

Skill implication:

```text
If the goal is inspection, prefer model-viewer or a viewer pattern before building a cinematic Three.js scene.
```

## Pattern 5: Cinematic Product Showcase

Use when the output should feel like a launch film or high-impact product reveal.

Starting point:

```text
webgl-product-research/prototypes/cinematic-product-showcase/
```

Best for:

- product launch videos;
- feature animation;
- exploded-view explanations;
- hero shots;
- social teaser clips.

Required input:

- high-quality product model or asset plan;
- primary feature beats;
- visual tone;
- desired length;
- platform format;
- audio / captions / cover needs.

Expected output:

- camera timeline;
- entrance animation;
- feature beats;
- optional exploded view;
- final hero frame;
- video export path when connected to recording.

Skill implication:

```text
Cinematic quality depends on asset quality, part separation, camera pacing, lighting, and sound. Code alone will not fix weak assets.
```

## Pattern 6: Character / AI Companion Validation Case

Use when the target is a character-driven product story, such as AI girlfriend, AI companion, virtual assistant, or mascot site.

Starting points:

```text
webgl-product-research/prototypes/desktop-companion-story/
webgl-product-research/prototypes/desktop-ai-companion-site/
```

Best for:

- avatar presentation;
- emotion / memory / conversation story;
- warm product positioning;
- AI companion landing page;
- character plus desktop workspace scenes.

Required input:

- character identity;
- product promise;
- interaction scenes;
- avatar or character asset;
- voice / subtitle direction if video is needed.

Expected output:

- character-led product story;
- scroll or guided sections;
- optional 3D avatar;
- demo page or video proof.

Skill implication:

```text
This is an optional validation case for character-driven 3D pages. It is not the repository mainline.
```

## How To Choose The Next Research Case

Use the missing capability map:

| Missing Capability | Next Case Type |
| --- | --- |
| Real product asset quality | Strong GLB / glTF asset pipeline case |
| Character motion and expression | VRM / Live2D / Ready Player Me / animation blending case |
| Spatial knowledge product | Graph / node / research atlas case |
| Real-world scene | Gaussian splatting or digital twin case |
| Low-level rendering accuracy | WebGPU / shader pipeline case |
| Publishing reliability | Remotion / ffmpeg / browser capture case |

## Skill Update Rule

After using any prototype, extract:

1. The reusable pattern.
2. The minimum input needed.
3. The evidence from source or runtime.
4. The quality risks.
5. The part that should update `webgl-product-film`.

Do not update the skill because a demo feels interesting.

Update it only when the pattern is reusable.
